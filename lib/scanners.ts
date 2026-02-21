import type { ShodanResult, DNSResult, SSLResult, ScanRawData } from "./types"

/**
 * Resolve a user-provided target into a normalized URL and IP address.
 */
export function parseTarget(input: string): { url: string; hostname: string } {
  let url = input.trim()
  // If no protocol, add https://
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  try {
    const parsed = new URL(url)
    return { url: parsed.origin, hostname: parsed.hostname }
  } catch {
    // Fallback: treat as hostname directly
    return { url: `https://${input.trim()}`, hostname: input.trim() }
  }
}

/**
 * Resolve hostname to IP using Google Public DNS API (free, no key).
 */
export async function resolveIP(hostname: string): Promise<string | null> {
  try {
    // Skip DNS resolution for raw IPs
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      return hostname
    }
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const aRecord = data.Answer?.find((r: { type: number }) => r.type === 1)
    return aRecord?.data ?? null
  } catch {
    return null
  }
}

/**
 * Fetch security-relevant HTTP headers from the target.
 */
export async function fetchSecurityHeaders(
  targetUrl: string
): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "CloudSecurityAuditor/1.0 (Security Scanner)",
      },
    })

    const interestingHeaders = [
      "strict-transport-security",
      "content-security-policy",
      "x-frame-options",
      "x-content-type-options",
      "referrer-policy",
      "permissions-policy",
      "x-xss-protection",
      "server",
      "x-powered-by",
      "access-control-allow-origin",
      "x-robots-tag",
      "feature-policy",
      "cross-origin-opener-policy",
      "cross-origin-resource-policy",
      "cross-origin-embedder-policy",
    ]

    const headers: Record<string, string> = {}
    for (const name of interestingHeaders) {
      const value = res.headers.get(name)
      if (value) {
        headers[name] = value
      }
    }

    // Note which security headers are MISSING (this is important for findings)
    const requiredHeaders = [
      "strict-transport-security",
      "content-security-policy",
      "x-frame-options",
      "x-content-type-options",
      "referrer-policy",
      "permissions-policy",
    ]
    for (const name of requiredHeaders) {
      if (!headers[name]) {
        headers[`_missing_${name}`] = "true"
      }
    }

    return headers
  } catch {
    return null
  }
}

/**
 * Fetch data from Shodan InternetDB (free, no API key).
 * Returns open ports, known CVEs, CPEs, hostnames, and tags.
 */
export async function fetchShodanData(ip: string): Promise<ShodanResult | null> {
  try {
    const res = await fetch(`https://internetdb.shodan.io/${ip}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      ip: data.ip || ip,
      ports: data.ports || [],
      cpes: data.cpes || [],
      hostnames: data.hostnames || [],
      tags: data.tags || [],
      vulns: data.vulns || [],
    }
  } catch {
    return null
  }
}

/**
 * Check DNS records for email security (SPF, DKIM, DMARC) using Google DNS.
 */
export async function fetchDNSRecords(hostname: string): Promise<DNSResult | null> {
  try {
    const records: { type: string; value: string }[] = []
    let hasSPF = false
    let hasDKIM = false
    let hasDMARC = false

    // Fetch TXT records for SPF
    const txtRes = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=TXT`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (txtRes.ok) {
      const txtData = await txtRes.json()
      for (const answer of txtData.Answer || []) {
        const val = answer.data?.replace(/"/g, "") || ""
        records.push({ type: "TXT", value: val })
        if (val.startsWith("v=spf1")) hasSPF = true
      }
    }

    // Fetch DMARC record
    const dmarcRes = await fetch(
      `https://dns.google/resolve?name=_dmarc.${encodeURIComponent(hostname)}&type=TXT`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (dmarcRes.ok) {
      const dmarcData = await dmarcRes.json()
      for (const answer of dmarcData.Answer || []) {
        const val = answer.data?.replace(/"/g, "") || ""
        records.push({ type: "DMARC", value: val })
        if (val.startsWith("v=DMARC1")) hasDMARC = true
      }
    }

    // Fetch DKIM (common selectors)
    for (const selector of ["default", "google", "selector1", "selector2", "k1"]) {
      try {
        const dkimRes = await fetch(
          `https://dns.google/resolve?name=${selector}._domainkey.${encodeURIComponent(hostname)}&type=TXT`,
          { signal: AbortSignal.timeout(5000) }
        )
        if (dkimRes.ok) {
          const dkimData = await dkimRes.json()
          if (dkimData.Answer?.length) {
            hasDKIM = true
            for (const answer of dkimData.Answer) {
              records.push({ type: "DKIM", value: answer.data?.replace(/"/g, "") || "" })
            }
            break // Found DKIM, no need to check more selectors
          }
        }
      } catch {
        // Skip failed selector
      }
    }

    // Fetch MX records
    const mxRes = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=MX`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (mxRes.ok) {
      const mxData = await mxRes.json()
      for (const answer of mxData.Answer || []) {
        records.push({ type: "MX", value: answer.data || "" })
      }
    }

    return { records, hasSPF, hasDKIM, hasDMARC }
  } catch {
    return null
  }
}

/**
 * Gather basic SSL/TLS information by checking the target's HTTPS response
 * and reading certificate-related headers. For deeper analysis, we rely on
 * the AI to analyze all gathered data.
 */
export async function fetchSSLInfo(targetUrl: string): Promise<SSLResult | null> {
  try {
    if (!targetUrl.startsWith("https://")) return null

    const res = await fetch(targetUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    })

    // We can't directly read certificates from JS fetch, but we can detect
    // if HTTPS works, if HSTS is set, and infer basic SSL status
    const hsts = res.headers.get("strict-transport-security")

    return {
      grade: res.ok ? "Reachable" : "Unreachable",
      protocol: "TLS",
      issuer: "Unknown (check via SSL Labs)",
      validFrom: "",
      validTo: "",
      daysUntilExpiry: -1,
      supportsHSTS: !!hsts,
      vulnerabilities: [],
    }
  } catch (err) {
    return {
      grade: "Failed",
      protocol: "Unknown",
      issuer: "Unknown",
      validFrom: "",
      validTo: "",
      daysUntilExpiry: -1,
      supportsHSTS: false,
      vulnerabilities: [
        `SSL/TLS connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      ],
    }
  }
}

/**
 * Detect technologies from HTML meta tags, headers, and script sources.
 */
export async function detectTechnologies(targetUrl: string): Promise<string[]> {
  try {
    const res = await fetch(targetUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "CloudSecurityAuditor/1.0 (Security Scanner)",
      },
    })
    if (!res.ok) return []

    const html = await res.text()
    const techs: string[] = []

    // Server header
    const server = res.headers.get("server")
    if (server) techs.push(`Server: ${server}`)

    const powered = res.headers.get("x-powered-by")
    if (powered) techs.push(`Powered-By: ${powered}`)

    // Meta generator
    const genMatch = html.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i)
    if (genMatch) techs.push(`Generator: ${genMatch[1]}`)

    // Common framework signatures
    const signatures: [RegExp, string][] = [
      [/wp-content|wp-includes/i, "WordPress"],
      [/next[\/-]data|__next/i, "Next.js"],
      [/nuxt/i, "Nuxt.js"],
      [/react/i, "React"],
      [/angular/i, "Angular"],
      [/vue\.js|vue\.min\.js/i, "Vue.js"],
      [/jquery/i, "jQuery"],
      [/bootstrap/i, "Bootstrap"],
      [/tailwindcss|tailwind/i, "Tailwind CSS"],
      [/cloudflare/i, "Cloudflare"],
      [/nginx/i, "Nginx"],
      [/apache/i, "Apache"],
      [/express/i, "Express.js"],
      [/django/i, "Django"],
      [/laravel/i, "Laravel"],
      [/shopify/i, "Shopify"],
      [/squarespace/i, "Squarespace"],
      [/wix\.com/i, "Wix"],
      [/gatsby/i, "Gatsby"],
      [/svelte/i, "Svelte"],
    ]

    for (const [regex, name] of signatures) {
      if (regex.test(html) || (server && regex.test(server))) {
        if (!techs.includes(name)) techs.push(name)
      }
    }

    return techs
  } catch {
    return []
  }
}

/**
 * Run all scanners in parallel and return aggregated raw data.
 */
export async function gatherScanData(
  target: string,
  scope: string
): Promise<ScanRawData> {
  const { url, hostname } = parseTarget(target)
  const ip = await resolveIP(hostname)

  const tasks: Promise<void>[] = []
  let headers: Record<string, string> | null = null
  let shodan: ShodanResult | null = null
  let dns: DNSResult | null = null
  let ssl: SSLResult | null = null
  let technologies: string[] = []

  // Run relevant scanners based on scope
  if (scope === "full" || scope === "headers") {
    tasks.push(fetchSecurityHeaders(url).then((r) => { headers = r }))
    tasks.push(detectTechnologies(url).then((r) => { technologies = r }))
  }

  if (scope === "full" || scope === "ports") {
    if (ip) {
      tasks.push(fetchShodanData(ip).then((r) => { shodan = r }))
    }
  }

  if (scope === "full" || scope === "ssl") {
    tasks.push(fetchSSLInfo(url).then((r) => { ssl = r }))
  }

  if (scope === "full") {
    tasks.push(fetchDNSRecords(hostname).then((r) => { dns = r }))
  }

  await Promise.allSettled(tasks)

  return {
    headers,
    shodan,
    dns,
    ssl,
    technologies,
    resolvedIP: ip,
    targetUrl: url,
  }
}
