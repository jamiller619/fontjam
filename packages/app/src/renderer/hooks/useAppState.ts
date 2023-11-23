import { useLocalStorage } from 'usehooks-ts'

type AppState = {
  'preview.text': string
  'preview.size': number
  'menu.open': boolean
  'library.active.id': number | null
  'library.filters.view': 'grid' | 'list'
  'toolbar.collapsed': boolean
}

const defaultAppState: AppState = {
  'preview.text': 'The quick brown fox jumps over the lazy dog',
  'preview.size': 18,
  'menu.open': true,
  'library.active.id': null,
  'library.filters.view': 'grid',
  'toolbar.collapsed': false,
}

export default function useAppState() {
  const [state, setState] = useLocalStorage<AppState>(
    'appstate',
    defaultAppState
  )

  return [state, setState] as const
}
