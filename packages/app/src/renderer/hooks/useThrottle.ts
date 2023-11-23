import { useEffect, useRef, useState } from 'react'

export default function useThrottle<T>(value: T, interval = 500) {
  const [throttledValue, setThrottledValue] = useState(value)
  const last = useRef(Date.now())

  useEffect(() => {
    if (Date.now() >= last.current + interval) {
      last.current = Date.now()

      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        last.current = Date.now()
        setThrottledValue(value)
      }, interval)

      return () => clearTimeout(timer)
    }
  }, [interval, value])

  return throttledValue
}
