import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSessionStorage } from 'usehooks-ts'
import { CatalogRecord, CatalogTypeName, Family } from '@shared/types'
import useAPI from './useAPI'
import useAppState from './useAppState'

const apiMap = {
  library: window.api['get.libraries'],
  collection: window.api['get.collections'],
}

function useCatalog<T extends CatalogTypeName>(type: T) {
  const [catalog, setCatalog] = useSessionStorage<CatalogRecord<T>[]>(
    `catalog.${type}`,
    []
  )

  useEffect(() => {
    if (catalog.length > 0) return

    apiMap[type]().then(setCatalog)
  }, [catalog.length, setCatalog, type])

  return catalog
}

export function useCollections() {
  return useCatalog('collection')
}

export function useLibraries() {
  return useCatalog('library')
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
    if (state['catalog.active.id'] !== activeId) {
      setState((prev) => ({
        ...prev,
        'catalog.active.id': activeId,
      }))
    }
  }, [activeId, setState, state])

  return activeId
}

export function useFamilies(page = 0, pageSize: number, id?: number) {
  const activeId = useSetActiveLibraryId(id)
  const { data } = useAPI(
    'get.families',
    [activeId, { index: page, length: pageSize }],
    {
      revalidateIfStale: false,
    }
  )

  return [data?.records, activeId] as const
}
