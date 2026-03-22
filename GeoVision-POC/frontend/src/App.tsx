import { useState } from 'react'
import type { AppState, CityResult, HistoryEntry } from './types'
import { useHistory } from './hooks/useHistory'
import { MainScreen } from './screens/MainScreen'
import { AnalysisScreen } from './screens/AnalysisScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { HistoryScreen } from './screens/HistoryScreen'

const App = () => {
  const [state, setState] = useState<AppState>({ screen: 'main' })
  const { entries, addEntry, clearHistory } = useHistory()

  const goToAnalysis = (file: File) => setState({ screen: 'analysis', file })

  const goToResults = (results: CityResult[], imageUrl: string) => {
    addEntry(imageUrl, results)
    setState({ screen: 'results', results, imageUrl })
  }

  const goToMain = (error?: string) => setState({ screen: 'main', error })

  const goToEntry = (entry: HistoryEntry) =>
    setState({ screen: 'results', results: entry.results, imageUrl: entry.imageUrl })

  switch (state.screen) {
    case 'main':
      return <MainScreen error={state.error} onFilePicked={goToAnalysis} onViewHistory={() => setState({ screen: 'history' })} />
    case 'analysis':
      return <AnalysisScreen file={state.file} onComplete={goToResults} onError={goToMain} />
    case 'results':
      return <ResultsScreen results={state.results} imageUrl={state.imageUrl} onBack={() => goToMain()} />
    case 'history':
      return <HistoryScreen entries={entries} onSelect={goToEntry} onClear={clearHistory} onBack={() => goToMain()} />
  }
}

export default App
