import { useCallback, useRef, useState } from 'react'
import { useEventListener } from 'usehooks-ts'
import useThrottle from './useThrottle'

/**
 * Simple hook that will return the scroll position of an
 * HTMLElement. DOES NOT work on `window` or `document`!
 * To use the hook, you must set the ref on the element you
 * want to track the scroll position for.
 * The hook returns a tuple with [ref, scrollPositionY]
 */
export default function useScrollPosition<
  T extends HTMLElement = HTMLDivElement
>(refQuery?: (ref: T) => HTMLElement | null) {
  const ref = useRef<T>(null)
  const [value, setValue] = useState(0)
  const y = useThrottle<number>(value, 200)

  const handleScroll = useCallback(() => {
    const el = refQuery && ref.current ? refQuery(ref.current) : ref.current

    setValue(el?.scrollTop ?? 0)
  }, [refQuery])

  useEventListener('scroll', handleScroll, ref)

  return [ref, y] as const
}
