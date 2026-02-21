import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding scans...");
  await sql`INSERT INTO scans (id, name, target, scan_scope, scan_type, status, start_time, end_time, findings_count, progress, critical_count, high_count, cloud_provider) VALUES
    ('scan-001', 'Production AWS Full Scan', 'aws-prod-account', 'full', 'full', 'completed', '2026-02-21T08:00:00Z', '2026-02-21T08:45:00Z', 23, 100, 4, 7, 'AWS'),
    ('scan-002', 'Azure Staging SSL Check', 'azure-staging-rg', 'ssl', 'ssl', 'completed', '2026-02-20T14:00:00Z', '2026-02-20T14:20:00Z', 8, 100, 1, 3, 'Azure'),
    ('scan-003', 'GCP Network Scan', 'gcp-prod-project', 'ports', 'ports', 'completed', '2026-02-19T06:00:00Z', '2026-02-19T06:35:00Z', 12, 100, 2, 4, 'GCP'),
    ('scan-004', 'AWS Dev Headers Audit', 'aws-dev-account', 'headers', 'headers', 'completed', '2026-02-19T10:00:00Z', '2026-02-19T10:15:00Z', 14, 100, 0, 5, 'AWS'),
    ('scan-005', 'Azure Prod Full Scan', 'azure-prod-rg', 'full', 'full', 'completed', '2026-02-18T12:00:00Z', '2026-02-18T12:50:00Z', 19, 100, 3, 6, 'Azure'),
    ('scan-006', 'GCP Staging SSL Audit', 'gcp-staging-project', 'ssl', 'ssl', 'completed', '2026-02-18T16:00:00Z', '2026-02-18T16:12:00Z', 3, 100, 0, 1, 'GCP')
  ON CONFLICT (id) DO NOTHING`;
  console.log("Seeded scans");

  console.log("Seeding vulnerabilities...");
  await sql`INSERT INTO vulnerabilities (id, title, severity, category, cvss_score, affected_resource, cloud_provider, status, description, remediation, scan_id, discovered_at) VALUES
    ('vuln-001', 'Publicly accessible S3 bucket', 'critical', 'Storage', 9.8, 's3://prod-data-backup', 'AWS', 'open', 'S3 bucket has public read access enabled, exposing sensitive data.', 'Remove public access and enable S3 Block Public Access.', 'scan-001', '2026-02-21T08:12:00Z'),
    ('vuln-002', 'Unencrypted RDS instance', 'high', 'Database', 7.5, 'rds:prod-db-01', 'AWS', 'in_progress', 'RDS instance does not have encryption at rest enabled.', 'Enable encryption at rest using AWS KMS.', 'scan-001', '2026-02-21T08:15:00Z'),
    ('vuln-003', 'Overly permissive NSG rule', 'critical', 'Networking', 9.1, 'nsg:staging-web-nsg', 'Azure', 'open', 'Network Security Group allows inbound traffic on all ports from any source.', 'Restrict inbound rules to specific ports and IP ranges.', 'scan-002', '2026-02-20T14:05:00Z'),
    ('vuln-004', 'Expired SSL certificate', 'high', 'SSL/TLS', 7.2, 'lb:azure-staging-lb', 'Azure', 'open', 'SSL certificate has expired, causing trust warnings.', 'Renew and deploy a valid SSL certificate.', 'scan-002', '2026-02-20T14:08:00Z'),
    ('vuln-005', 'Firewall rule allows 0.0.0.0/0', 'critical', 'Networking', 9.4, 'fw:gcp-prod-default', 'GCP', 'open', 'Default firewall rule allows all inbound traffic from any IP.', 'Update firewall rules to restrict source IP ranges.', 'scan-003', '2026-02-19T06:10:00Z'),
    ('vuln-006', 'Missing security headers', 'medium', 'Headers', 5.3, 'app:dev-api-gateway', 'AWS', 'open', 'Application is missing Content-Security-Policy and X-Frame-Options headers.', 'Add recommended security headers to the response.', 'scan-004', '2026-02-19T10:05:00Z'),
    ('vuln-007', 'IAM user with no MFA', 'high', 'IAM', 8.1, 'iam:dev-admin-user', 'AWS', 'open', 'IAM user has console access without multi-factor authentication enabled.', 'Enable MFA for all IAM users with console access.', 'scan-004', '2026-02-19T10:07:00Z'),
    ('vuln-008', 'Logging disabled on GCS bucket', 'low', 'Storage', 3.1, 'gcs://staging-assets', 'GCP', 'remediated', 'Access logging is not enabled on the Cloud Storage bucket.', 'Enable access logging for audit trail purposes.', 'scan-006', '2026-02-18T16:05:00Z'),
    ('vuln-009', 'Azure Key Vault soft-delete disabled', 'medium', 'Security', 5.8, 'kv:prod-secrets', 'Azure', 'open', 'Key Vault does not have soft-delete enabled risking permanent key loss.', 'Enable soft-delete and purge protection on the Key Vault.', 'scan-005', '2026-02-18T12:20:00Z'),
    ('vuln-010', 'Unrestricted egress traffic', 'high', 'Networking', 7.0, 'vpc:gcp-prod-vpc', 'GCP', 'in_progress', 'VPC allows unrestricted egress traffic to all destinations.', 'Implement egress firewall rules to restrict outbound traffic.', 'scan-003', '2026-02-19T06:22:00Z'),
    ('vuln-011', 'Root account used for daily operations', 'critical', 'IAM', 9.5, 'iam:root-account', 'AWS', 'open', 'AWS root account is used for daily tasks instead of IAM users.', 'Create dedicated IAM users and disable root access keys.', 'scan-001', '2026-02-21T08:30:00Z'),
    ('vuln-012', 'TLS 1.0 enabled on load balancer', 'medium', 'SSL/TLS', 5.0, 'lb:azure-prod-lb', 'Azure', 'open', 'Load balancer still accepts TLS 1.0 connections which are deprecated.', 'Configure minimum TLS version to 1.2.', 'scan-005', '2026-02-18T12:35:00Z')
  ON CONFLICT (id) DO NOTHING`;
  console.log("Seeded vulnerabilities");

  console.log("Seeding threats...");
  await sql`INSERT INTO threats (id, type, severity, source, description, timestamp, status, related_findings, recommended_action, scan_id) VALUES
    ('threat-001', 'Brute Force Attempt', 'high', '203.0.113.42', 'Multiple failed SSH login attempts detected from a single IP address.', '2026-02-22T05:30:00Z', 'active', 3, 'Block the source IP and enable rate limiting on SSH.', 'scan-001'),
    ('threat-002', 'Unusual API Activity', 'medium', 'iam:compromised-key-01', 'API calls from an IAM key that is normally dormant, indicating possible compromise.', '2026-02-21T22:15:00Z', 'investigating', 5, 'Rotate the IAM key and review CloudTrail logs.', 'scan-001'),
    ('threat-003', 'Data Exfiltration Attempt', 'critical', 's3://prod-data-backup', 'Large volume of data downloaded from a public S3 bucket by an external IP.', '2026-02-21T18:00:00Z', 'active', 2, 'Immediately restrict bucket access and investigate downloaded data.', 'scan-001'),
    ('threat-004', 'Port Scan Detected', 'low', '198.51.100.17', 'Systematic port scanning detected from an external IP on GCP infrastructure.', '2026-02-22T06:45:00Z', 'active', 1, 'Monitor the source IP and tighten firewall rules.', 'scan-003'),
    ('threat-005', 'Privilege Escalation', 'critical', 'iam:azure-staging-user', 'User account attempted to escalate privileges beyond assigned role.', '2026-02-20T12:00:00Z', 'resolved', 4, 'Review IAM policies and revoke excess permissions.', 'scan-002'),
    ('threat-006', 'Cryptomining Activity', 'high', 'vm:gcp-prod-worker-03', 'Unusual CPU usage pattern consistent with cryptocurrency mining detected.', '2026-02-22T02:00:00Z', 'investigating', 2, 'Isolate the VM, scan for malware, and rebuild from a clean image.', 'scan-003'),
    ('threat-007', 'Suspicious Login Location', 'medium', 'user:admin@company.com', 'Admin login detected from an unusual geographic location.', '2026-02-21T09:00:00Z', 'active', 1, 'Verify with the user and enforce MFA if not already enabled.', 'scan-001')
  ON CONFLICT (id) DO NOTHING`;
  console.log("Seeded threats");

  console.log("Seeding compliance frameworks...");
  await sql`INSERT INTO compliance_frameworks (id, name, short_name, score, total_controls, passed_controls, failed_controls, na_controls, scan_id) VALUES
    ('cf-001', 'CIS Benchmarks', 'CIS', 87, 142, 124, 14, 4, 'scan-001'),
    ('cf-002', 'ISO 27001', 'ISO', 74, 114, 84, 26, 4, 'scan-001'),
    ('cf-003', 'NIST CSF', 'NIST', 91, 108, 98, 8, 2, 'scan-001')
  ON CONFLICT (id) DO NOTHING`;
  console.log("Seeded compliance frameworks");

  console.log("All data seeded successfully!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
