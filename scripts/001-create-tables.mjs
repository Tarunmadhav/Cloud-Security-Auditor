import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target TEXT NOT NULL,
      scan_scope TEXT NOT NULL DEFAULT 'full',
      scan_type TEXT NOT NULL DEFAULT 'full',
      cloud_provider TEXT NOT NULL DEFAULT 'AWS',
      status TEXT NOT NULL DEFAULT 'pending',
      start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      end_time TIMESTAMPTZ,
      findings_count INT NOT NULL DEFAULT 0,
      progress INT NOT NULL DEFAULT 0,
      critical_count INT NOT NULL DEFAULT 0,
      high_count INT NOT NULL DEFAULT 0
    )
  `;
  console.log("Created scans table");

  await sql`
    CREATE TABLE IF NOT EXISTS vulnerabilities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      category TEXT NOT NULL,
      cvss_score NUMERIC(3,1) NOT NULL DEFAULT 0,
      affected_resource TEXT NOT NULL,
      cloud_provider TEXT NOT NULL DEFAULT 'AWS',
      status TEXT NOT NULL DEFAULT 'open',
      description TEXT NOT NULL DEFAULT '',
      remediation TEXT NOT NULL DEFAULT '',
      scan_id TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
      discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("Created vulnerabilities table");

  await sql`
    CREATE TABLE IF NOT EXISTS threats (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      source TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'active',
      related_findings INT NOT NULL DEFAULT 0,
      recommended_action TEXT NOT NULL DEFAULT '',
      scan_id TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE
    )
  `;
  console.log("Created threats table");

  await sql`
    CREATE TABLE IF NOT EXISTS compliance_frameworks (
      id SERIAL PRIMARY KEY,
      scan_id TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      score INT NOT NULL DEFAULT 0,
      total_controls INT NOT NULL DEFAULT 0,
      passed_controls INT NOT NULL DEFAULT 0,
      failed_controls INT NOT NULL DEFAULT 0,
      na_controls INT NOT NULL DEFAULT 0
    )
  `;
  console.log("Created compliance_frameworks table");

  await sql`
    CREATE TABLE IF NOT EXISTS compliance_controls (
      id SERIAL PRIMARY KEY,
      framework_id INT NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
      control_id TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_assessed',
      severity TEXT NOT NULL DEFAULT 'medium',
      description TEXT NOT NULL DEFAULT ''
    )
  `;
  console.log("Created compliance_controls table");

  console.log("All tables created successfully!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
