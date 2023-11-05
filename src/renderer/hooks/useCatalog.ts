import { useEffect } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import { CatalogRecord, CatalogTypeName } from '@shared/types'

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
