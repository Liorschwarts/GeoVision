import { useState } from 'react'
import type { AppState, CityResult, HistoryEntry } from './types'
import { useHistory } from './hooks/useHistory'
import { MainScreen } from './screens/MainScreen'
import { AnalysisScreen } from './screens/AnalysisScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { AuthScreen } from './screens/AuthScreen'
import { Spinner } from './components/Spinner'
import { useAuth } from './hooks/useAuth'

const App = () => {
  const { user, loading: authLoading, signOut } = useAuth()

  if (authLoading) {
    return <div className="min-h-svh flex items-center justify-center"><Spinner /></div>
  }

  if (!user) return <AuthScreen />

  return <AuthenticatedApp userId={user.id} email={user.email ?? ''} onSignOut={signOut} />
}

interface AuthenticatedAppProps {
  userId: string
  email: string
  onSignOut: () => Promise<unknown>
}

const AuthenticatedApp = ({ userId, email, onSignOut }: AuthenticatedAppProps) => {
  const [state, setState] = useState<AppState>({ screen: 'main' })
  const { entries, loading, error, addEntry, clearHistory } = useHistory(userId)

  const goToAnalysis = (file: File) => setState({ screen: 'analysis', file })

  const goToResults = (results: CityResult[], imageUrl: string) => {
    void addEntry(results)
    setState({ screen: 'results', results, imageUrl })
  }

  const goToMain = (error?: string) => setState({ screen: 'main', error })

  const goToEntry = (entry: HistoryEntry) =>
    setState({ screen: 'results', results: entry.results })

  switch (state.screen) {
    case 'main':
      return <MainScreen error={state.error} email={email} onSignOut={onSignOut} onFilePicked={goToAnalysis} onViewHistory={() => setState({ screen: 'history' })} />
    case 'analysis':
      return <AnalysisScreen file={state.file} onComplete={goToResults} onError={goToMain} />
    case 'results':
      return <ResultsScreen results={state.results} imageUrl={state.imageUrl} onBack={() => goToMain()} />
    case 'history':
      return <HistoryScreen entries={entries} loading={loading} error={error} onSelect={goToEntry} onClear={() => void clearHistory()} onBack={() => goToMain()} />
  }
}

export default App
