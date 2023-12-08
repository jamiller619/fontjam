import { useCallback, useMemo } from 'react'
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

export function useAppStateTest<T extends (keyof AppState)[]>(...keys: T) {
  const [store, setStore] = useLocalStorage<AppState>(
    'appstate',
    defaultAppState
  )

  const state = useMemo(() => {
    const appState = {} as {
      [K in T[number]]: AppState[K]
    }

    for (const key of keys) {
      // @ts-ignore: Fuck you, this works
      appState[key] = store[key]
    }

    return appState
  }, [keys, store])

  const setState = useCallback(
    (newState: Partial<typeof state>) => {
      setStore((prev) => ({
        ...prev,
        ...newState,
      }))
    },
    [setStore]
  )

  return [state, setState] as const
}

export default function useAppState() {
  const [state, setState] = useLocalStorage<AppState>(
    'appstate',
    defaultAppState
  )

  return [state, setState] as const
}
