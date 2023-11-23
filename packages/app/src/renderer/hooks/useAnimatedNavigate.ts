import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { To, useNavigate } from 'react-router-dom'

export default function useAnimatedNavigate() {
  const navigate = useNavigate()

  return useCallback(
    (path: To, callback?: () => void | Promise<void>) => {
      document.startViewTransition(async () => {
        if (callback) {
          await callback()
        }

        flushSync(() => navigate(path))
      })
    },
    [navigate]
  )
}
