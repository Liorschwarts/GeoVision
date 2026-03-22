import { useEffect, useState } from 'react'

export const useFakeProgress = (): number => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev
        return prev + Math.max(0.3, (95 - prev) * 0.06)
      })
    }, 80)
    return () => clearInterval(id)
  }, [])

  return Math.round(progress)
}
