import type { AnalyzeResponse, CityResult } from '../types'

export async function analyzeImage(file: File): Promise<CityResult[]> {
  const body = new FormData()
  body.append('image', file)

  const res = await fetch('/api/analyze', { method: 'POST', body })
  const data = (await res.json()) as AnalyzeResponse & { error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? res.statusText ?? 'Analysis failed')
  }
  if (!Array.isArray(data.results) || data.results.length !== 5) {
    throw new Error('The model did not return five city recommendations')
  }
  if (new Set(data.results.map((result) => result.city)).size !== 5) {
    throw new Error('The model returned duplicate city recommendations')
  }
  return data.results
}
