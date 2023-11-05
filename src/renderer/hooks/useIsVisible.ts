import { useRef, useState } from 'react'
import { useEventListener } from 'usehooks-ts'

export default function useIsVisible<T extends HTMLElement>(offset = 0) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<T>(null)

  const handleScroll = () => {
    if (!ref.current) {
      setIsVisible(false)

      return
    }

    const top = ref.current.getBoundingClientRect().top

    setIsVisible(top + offset >= 0 && top - offset <= window.innerHeight)
  }

  useEventListener('scroll', handleScroll)

  return [isVisible, ref] as const
}
