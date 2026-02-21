import type { Scan, Vulnerability, Threat, ComplianceFramework } from "./types"

// In-memory store — starts empty, populated only by real scans.
// Resets on server restart.

const scanStore: Scan[] = []
const findingsStore: Vulnerability[] = []
const threatStore: Threat[] = []
const complianceStore: ComplianceFramework[] = []

// --- Scans ---
export function getAllScans(): Scan[] {
  return scanStore
}

export function getScanById(id: string): Scan | undefined {
  return scanStore.find((s) => s.id === id)
}

export function addScan(scan: Scan): void {
  scanStore.unshift(scan)
}

export function updateScan(id: string, updates: Partial<Scan>): Scan | undefined {
  const index = scanStore.findIndex((s) => s.id === id)
  if (index === -1) return undefined
  scanStore[index] = { ...scanStore[index], ...updates }
  return scanStore[index]
}

// --- Vulnerabilities / Findings ---
export function getAllFindings(): Vulnerability[] {
  return findingsStore
}

export function getFindingsByScanId(scanId: string): Vulnerability[] {
  return findingsStore.filter((v) => v.scanId === scanId)
}

export function addFinding(finding: Vulnerability): void {
  findingsStore.push(finding)
}

export function addFindings(findings: Vulnerability[]): void {
  findingsStore.push(...findings)
}

// --- Threats ---
export function getAllThreats(): Threat[] {
  return threatStore
}

export function getThreatsByScanId(scanId: string): Threat[] {
  return threatStore.filter((t) => t.scanId === scanId)
}

export function addThreats(threats: Threat[]): void {
  threatStore.push(...threats)
}

// --- Compliance ---
export function getAllCompliance(): ComplianceFramework[] {
  return complianceStore
}

export function getComplianceByScanId(scanId: string): ComplianceFramework[] {
  return complianceStore.filter((c) => c.scanId === scanId)
}

export function addCompliance(frameworks: ComplianceFramework[]): void {
  complianceStore.push(...frameworks)
}
