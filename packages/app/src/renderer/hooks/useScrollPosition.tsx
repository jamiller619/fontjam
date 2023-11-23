import { RefObject, useCallback, useState } from 'react'
import { useEventListener } from 'usehooks-ts'
import useThrottle from './useThrottle'

/**
 * Simple hook that will return the scrolltop of an
 * HTMLElement. DOES NOT work on `window` or `document`!
 */
export default function useScrollPosition<T extends HTMLElement>(
  ref: RefObject<T>,
  throttleInterval = 100
) {
  const [value, setValue] = useState(0)
  const y = useThrottle<number>(value, throttleInterval)

  const handleScroll = useCallback(() => {
    if (!ref.current) return

    setValue(ref.current.scrollTop)
  }, [ref])

  useEventListener('scroll', handleScroll, ref)

  return y
}
