import type { AnalyzeResponse, CityResult } from '../types'

export async function analyzeImage(file: File): Promise<CityResult[]> {
  const body = new FormData()
  body.append('image', file)

  const res = await fetch('/api/analyze', { method: 'POST', body })
  if (!res.ok) throw new Error(res.statusText)

  const data = (await res.json()) as AnalyzeResponse
  return data.results
}
