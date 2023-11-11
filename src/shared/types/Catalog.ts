type FluentUIIcon = string

type LocalIcon = 'GoogleFonts'

type Catalog = {
  id: number
  createdAt: number
  name: string
  path: string
  isEditable: 0 | 1
  type: CatalogTypeName
  locations: CatalogLocation[]

  icon: `localicon://${LocalIcon}` | `fluentui://${FluentUIIcon}`
}

export default Catalog

export type CatalogLocation = {
  id: number
  path: string
}

export type CatalogFont = {
  id: number
  catalogId: number
  fontId: number
}

type AsCatalogType<T extends CatalogTypeName> = Catalog & {
  type: T
}

export type Library = AsCatalogType<'library'>
export type Collection = AsCatalogType<'collection'>
export type Online = AsCatalogType<'online'>

export type CatalogTypeName = 'library' | 'collection' | 'online'
export type CatalogRecord<T extends CatalogTypeName> = T extends 'library'
  ? Library
  : T extends 'collection'
  ? Collection
  : Online
