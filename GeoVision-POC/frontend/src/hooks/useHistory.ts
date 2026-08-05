import { useCallback, useEffect, useState } from 'react'
import type { CityResult, HistoryEntry } from '../types'
import { supabase } from '../lib/supabase'

interface HistoryRow {
  id: string
  created_at: string
  results: CityResult[]
}

export const useHistory = (userId: string) => {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEntries = useCallback(async (): Promise<HistoryEntry[]> => {
    const { data, error: queryError } = await supabase
      .from('analysis_history')
      .select('id, created_at, results')
      .order('created_at', { ascending: false })
      .limit(20)

    if (queryError) throw queryError
    const rows = (data ?? []) as HistoryRow[]
    return rows.map(row => ({
      id: row.id,
      timestamp: new Date(row.created_at).getTime(),
      results: row.results,
    }))
  }, [])

  useEffect(() => {
    let active = true
    fetchEntries()
      .then(rows => {
        if (!active) return
        setEntries(rows)
        setError('')
      })
      .catch(queryError => {
        if (active) setError(queryError instanceof Error ? queryError.message : 'Could not load history')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [fetchEntries, userId])

  const addEntry = async (results: CityResult[]) => {
    const { error: insertError } = await supabase
      .from('analysis_history')
      .insert({ user_id: userId, results })

    if (insertError) setError(insertError.message)
    else {
      setEntries(await fetchEntries())
      setError('')
    }
  }

  const clearHistory = async () => {
    const { error: deleteError } = await supabase
      .from('analysis_history')
      .delete()
      .eq('user_id', userId)

    if (deleteError) setError(deleteError.message)
    else setEntries([])
  }

  return { entries, loading, error, addEntry, clearHistory }
}
