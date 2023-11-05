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

type Library = {
  id: number
  createdAt: number
  name: string
  path: string
  isEditable: 0 | 1

  icon: Icon
  color: (typeof radixColorScales)[number] | 'accent' | 'gray'
}

export default Library
