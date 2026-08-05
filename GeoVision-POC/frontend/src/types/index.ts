export interface CityResult {
  city: string
  country: string
  score: number
  lat: number
  lng: number
}

export interface HistoryEntry {
  id: string
  timestamp: number
  results: CityResult[]
}

export interface AnalyzeResponse {
  results: CityResult[]
}

export type AppState =
  | { screen: 'main'; error?: string }
  | { screen: 'analysis'; file: File }
  | { screen: 'results'; results: CityResult[]; imageUrl?: string }
  | { screen: 'history' }
