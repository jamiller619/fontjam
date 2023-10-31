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
  isEditable: 0 | 1
  icon: Icon
  path: string
}

export default Library
