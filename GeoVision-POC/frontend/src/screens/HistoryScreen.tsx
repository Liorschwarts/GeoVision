import type { HistoryEntry } from '../types'

interface Props {
  entries: HistoryEntry[]
  loading: boolean
  error: string
  onSelect: (entry: HistoryEntry) => void
  onClear: () => void
  onBack: () => void
}

const formatTimestamp = (ts: number) => {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return new Date(ts).toLocaleDateString()
}

export const HistoryScreen = ({ entries, loading, error, onSelect, onClear, onBack }: Props) => (
  <div className="min-h-svh bg-gray-50 flex flex-col">
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <button
        onClick={onBack}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="Back"
      >
        <BackIcon />
      </button>
      <span className="text-sm font-semibold text-gray-700">Search History</span>
      {entries.length > 0 && (
        <button
          onClick={onClear}
          className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>

    {loading ? (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
        Loading history...
      </div>
    ) : error ? (
      <div className="p-6 text-center text-sm text-red-500">{error}</div>
    ) : entries.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
        <HistoryEmptyIcon />
        <p className="text-sm">No searches yet</p>
      </div>
    ) : (
      <ul className="flex flex-col divide-y divide-gray-100">
        {entries.map(entry => (
          <li key={entry.id}>
            <button
              onClick={() => onSelect(entry)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#009e8e] text-white text-lg font-semibold">
                {entry.results[0]?.city.charAt(0) ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {entry.results[0]?.city}, {entry.results[0]?.country}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {entry.results.length} results · {formatTimestamp(entry.timestamp)}
                </p>
              </div>
              <ChevronIcon />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
)

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 flex-shrink-0">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const HistoryEmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
    <polyline points="12 8 12 12 14 14" />
    <path d="M3.05 11a9 9 0 1 0 .5-4.5" />
    <polyline points="3 3 3 7 7 7" />
  </svg>
)
