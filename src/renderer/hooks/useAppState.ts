import { useLocalStorage } from 'usehooks-ts'

type AppState = {
  previewText: string
  previewFontSize: number
  view: 'grid' | 'list'
  isSidebarOpen: boolean
}

const defaultAppState: AppState = {
  previewText: 'The quick brown fox jumps over the lazy dog',
  previewFontSize: 18,
  view: 'grid',
  isSidebarOpen: true,
}

export default function useAppState() {
  const [state, setState] = useLocalStorage<AppState>(
    'appstate',
    defaultAppState
  )

  return [state, setState] as const
}
