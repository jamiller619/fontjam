type IconName = keyof typeof import('@fluentui/react-icons')

type Base = {
  id: number
  createdAt: number
  name: string
  isEditable: 0 | 1
  icon: Exclude<
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
}

export default Base
