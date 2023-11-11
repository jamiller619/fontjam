type IconName = keyof typeof import('@fluentui/react-icons')

type FluentUIIcon = Exclude<
  IconName,
  | 'wrapIcon'
  | 'bundleIcon'
  | 'createFluentIcon'
  | 'IconDirectionContextProvider'
  | 'IconDirectionContextValue'
  | 'useIconContext'
  | 'FluentIconsProps'
  | 'FluentIcon'
  | 'useIconState'
  | 'UseIconStateOptions'
  | 'iconFilledClassName'
  | 'iconRegularClassName'
>

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

type AsCatalogType<T extends CatalogTypeName> = Catalog & {
  type: T
}

export type Library = AsCatalogType<'library'>
export type Collection = AsCatalogType<'collection'>
export type Online = AsCatalogType<'online'>

export type CatalogTypeName = 'library' | 'collection' | 'online'
export type CatalogRecord<T extends CatalogTypeName> = T extends 'library'
  ? Library
  : Collection
