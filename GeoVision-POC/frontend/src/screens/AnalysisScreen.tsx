import { useEffect, useRef } from 'react'
import { analyzeImage } from '../api/analyze'
import { Spinner } from '../components/Spinner'
import { ProgressBar } from '../components/ProgressBar'
import { useFakeProgress } from '../hooks/useFakeProgress'
import type { CityResult } from '../types'

interface Props {
  file: File
  onComplete: (results: CityResult[], imageUrl: string) => void
  onError: (message: string) => void
}

export const AnalysisScreen = ({ file, onComplete, onError }: Props) => {
  const progress = useFakeProgress()
  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onCompleteRef.current = onComplete
    onErrorRef.current = onError
  }, [onComplete, onError])

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = async () => {
      const imageUrl = reader.result as string
      try {
        const results = await analyzeImage(file)
        onCompleteRef.current(results, imageUrl)
      } catch (e) {
        onErrorRef.current(e instanceof Error ? e.message : 'Analysis failed')
      }
    }
    reader.readAsDataURL(file)
  }, [file])

  return (
    <div
      className="min-h-svh flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #0bbfaa 0%, #00796b 100%)' }}
    >
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-5 w-72 shadow-xl">
        <Spinner />
        <p className="text-gray-500 text-sm">Initializing analysis...</p>
        <ProgressBar progress={progress} />
      </div>
    </div>
  )
}
