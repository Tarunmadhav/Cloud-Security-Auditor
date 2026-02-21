import type { Scan, Vulnerability } from "./types"
import { scans as initialScans, vulnerabilities as initialVulnerabilities } from "./mock-data"

// In-memory store so API routes can mutate the list and GET returns updated data.
// This resets on server restart, which is fine for a mock/demo app.

const scanStore: Scan[] = [...initialScans]
const findingsStore: Vulnerability[] = [...initialVulnerabilities]

export function getAllScans(): Scan[] {
  return scanStore
}

export function getScanById(id: string): Scan | undefined {
  return scanStore.find((s) => s.id === id)
}

export function addScan(scan: Scan): void {
  scanStore.unshift(scan) // newest first
}

export function updateScan(id: string, updates: Partial<Scan>): Scan | undefined {
  const index = scanStore.findIndex((s) => s.id === id)
  if (index === -1) return undefined
  scanStore[index] = { ...scanStore[index], ...updates }
  return scanStore[index]
}

export function getFindingsByScanId(scanId: string): Vulnerability[] {
  return findingsStore.filter((v) => v.scanId === scanId)
}

export function addFinding(finding: Vulnerability): void {
  findingsStore.push(finding)
}
