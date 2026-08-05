import type { CityResult } from '../types'
import { CityMap } from './CityMap'

interface Props {
  result: CityResult
  rank: number
}

export const CityCard = ({ result, rank }: Props) => (
  <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4 w-full max-w-sm">
    <div className="flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-teal-500 uppercase tracking-wider">
          #{rank} Match
        </span>
        <h2 className="text-xl font-bold text-gray-800 mt-0.5">{result.city}</h2>
        <p className="text-sm text-gray-500">{result.country}</p>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-3xl font-bold text-teal-500">{result.score}%</span>
        <span className="text-xs text-gray-400">visual similarity score</span>
      </div>
    </div>

    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className="h-full bg-teal-500 rounded-full transition-all"
        style={{ width: `${result.score}%` }}
      />
    </div>

    <CityMap lat={result.lat} lng={result.lng} city={result.city} />
  </div>
)
