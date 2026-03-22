import type { CityResult } from '../types'
import { CityCard } from '../components/CityCard'

interface Props {
  results: CityResult[]
  imageUrl: string
  onBack: () => void
}

export const ResultsScreen = ({ results, imageUrl, onBack }: Props) => (
  <div className="h-svh overflow-y-scroll snap-y snap-mandatory bg-gray-50">
    <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <button
        onClick={onBack}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="Back"
      >
        <BackIcon />
      </button>
      <img src={imageUrl} alt="Uploaded" className="w-8 h-8 rounded-lg object-cover" />
      <span className="text-sm font-semibold text-gray-700">
        {results.length} similar places found
      </span>
    </div>

    {results.map((result, i) => (
      <div
        key={result.city}
        className="min-h-svh snap-start flex items-center justify-center p-6 pt-20"
      >
        <CityCard result={result} rank={i + 1} />
      </div>
    ))}

    <div className="min-h-svh snap-start flex flex-col items-center justify-center gap-6 p-6"
      style={{ background: 'linear-gradient(160deg, #0bbfaa 0%, #00796b 100%)' }}
    >
      <p className="text-white/80 text-lg font-medium">Want to explore more?</p>
      <button
        onClick={onBack}
        className="flex items-center gap-2 h-14 px-8 rounded-2xl bg-white text-[#00796b] font-semibold shadow-md active:scale-95 transition-transform cursor-pointer"
      >
        Try another photo
      </button>
    </div>
  </div>
)

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
