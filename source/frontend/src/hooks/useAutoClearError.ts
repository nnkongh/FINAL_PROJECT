import { useEffect } from 'react'

export const useAutoClearError = (error: any, clearError: () => void) => {
  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => {
      clearError()
    }, 5000)

    return () => clearTimeout(timer)
  }, [error, clearError])
}
