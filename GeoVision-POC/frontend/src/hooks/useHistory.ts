import { useState } from 'react'
import type { CityResult, HistoryEntry } from '../types'
import { loadHistory, saveHistory } from '../utils/history'

export const useHistory = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory)

  const addEntry = (imageUrl: string, results: CityResult[]) => {
    const entry: HistoryEntry = {
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
      imageUrl,
      results,
    }
    const next = [entry, ...entries].slice(0, 20)
    setEntries(next)
    saveHistory(next)
  }

  const clearHistory = () => {
    setEntries([])
    saveHistory([])
  }

  return { entries, addEntry, clearHistory }
}
