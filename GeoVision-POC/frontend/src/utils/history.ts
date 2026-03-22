import type { HistoryEntry } from '../types'

const KEY = 'gv_history'
const MAX_ENTRIES = 20

export function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as HistoryEntry[]
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
}
