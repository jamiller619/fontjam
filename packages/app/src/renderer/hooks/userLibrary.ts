import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSessionStorage } from 'usehooks-ts'
import { Library } from '@shared/types'
import api from '~/utils/api'
import useAPI from './useAPI'
import useAppState from './useAppState'

export function useLibraries() {
  const [libraries, setLibraries] = useSessionStorage<Library[]>(
    'libraries',
    []
  )

  useEffect(() => {
    if (libraries.length > 0) return

    api.call('get.libraries').then(setLibraries)
  }, [libraries.length, setLibraries])

  return libraries
}

function parseId(id?: string | number | null) {
  if (id == null) return undefined
  if (typeof id === 'number') return id

  return Number(id)
}

export function useLibrary(id?: string | number | null) {
  const libraries = useLibraries()
  const nid = parseId(id)

  return libraries.find((l) => l.id === nid)
}

function useSetActiveLibraryId(id?: number) {
  const params = useParams()
  const activeId = id || Number(params.id) || 1
  const [state, setState] = useAppState()

  useEffect(() => {
    if (state['library.active.id'] !== activeId) {
      setState((prev) => ({
        ...prev,
        'library.active.id': activeId,
      }))
    }
  }, [activeId, setState, state])

  return activeId
}

export function useFamilies(page = 0, pageSize: number, id?: number) {
  const activeId = useSetActiveLibraryId(id)
  const { data } = useAPI('get.families', [
    activeId,
    { index: page, length: pageSize },
  ])

  return [data?.records, activeId] as const
}
