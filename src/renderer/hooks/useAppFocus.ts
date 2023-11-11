import { useState } from 'react'
import { useEventListener } from 'usehooks-ts'

export default function useAppFocus() {
  const [isFocused, setIsFocused] = useState(document.hasFocus())

  useEventListener('focus', () => setIsFocused(true))
  useEventListener('blur', () => setIsFocused(false))

  return isFocused
}
