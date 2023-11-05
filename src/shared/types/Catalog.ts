import { type radixColorScales } from '@radix-ui/themes'

type IconName = keyof typeof import('@fluentui/react-icons')

type Icon = Exclude<
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

type Catalog = {
  id: number
  createdAt: number
  name: string
  path: string
  isEditable: 0 | 1
  type: 'library' | 'collection'

  icon: Icon
  color: (typeof radixColorScales)[number] | 'accent' | 'gray'
}

export default Catalog

export type Library = Omit<Catalog, 'type'>
export type Collection = Omit<Catalog, 'type'>

export type CatalogTypeName = 'library' | 'collection'
export type CatalogRecord<T extends CatalogTypeName> = T extends 'library'
  ? Library
  : Collection
