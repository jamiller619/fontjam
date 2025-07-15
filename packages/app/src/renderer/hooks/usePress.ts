import { RefObject, useState } from 'react'
import { useEventListener } from 'usehooks-ts'

export default function usePress<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
) {
  const [isPressed, setPressed] = useState(false)

  const handleMouseDown = () => setPressed(true)
  const handleMouseUp = () => setPressed(false)

  useEventListener('mousedown', handleMouseDown, ref)
  useEventListener('mouseup', handleMouseUp, ref)

  return isPressed
}
