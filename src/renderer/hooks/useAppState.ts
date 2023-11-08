import { useLocalStorage } from 'usehooks-ts'

type AppState = {
  'preview.text': string
  'preview.size': number
  'sidebar.open': boolean
  'catalog.active.id': number | null
  'catalog.filters.view': 'grid' | 'list'
  'toolbar.collapsed': boolean
}

const defaultAppState: AppState = {
  'preview.text': 'The quick brown fox jumps over the lazy dog',
  'preview.size': 18,
  'sidebar.open': true,
  'catalog.active.id': null,
  'catalog.filters.view': 'grid',
  'toolbar.collapsed': false,
}

export default function useAppState() {
  const [state, setState] = useLocalStorage<AppState>(
    'appstate',
    defaultAppState
  )

  return [state, setState] as const
}
