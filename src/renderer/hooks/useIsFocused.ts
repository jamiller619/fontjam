import { RefObject, useState } from 'react'
import { useEventListener } from 'usehooks-ts'

export default function useIsFocused<
  T extends HTMLInputElement = HTMLInputElement
>(ref: RefObject<T>) {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  useEventListener('focus', handleFocus, ref)
  useEventListener('blur', handleBlur, ref)

  return isFocused
}
