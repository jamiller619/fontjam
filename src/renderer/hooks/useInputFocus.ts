import { useEffect, useRef } from 'react'

export default function useInputFocus() {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.focus()
    }
  }, [])

  return ref
}
