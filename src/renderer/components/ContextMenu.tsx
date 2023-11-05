import { ContextMenu as RUIContextMenu, colorProp } from '@radix-ui/themes'
import { Fragment, ReactNode, useId } from 'react'

export type ContextMenuItem =
  | 'separator'
  | {
      text: string
      color?: (typeof colorProp)['values'][number]
      shortcut?: string
      action?: () => void
      children?: ContextMenuItem[]
    }

export type ContextMenuProps = {
  children?: ReactNode
  content?: ContextMenuItem[]
}

export default function ContextMenu({ children, content }: ContextMenuProps) {
  const id = useId()

  return (
    <RUIContextMenu.Root>
      <RUIContextMenu.Trigger>{children}</RUIContextMenu.Trigger>
      <RUIContextMenu.Content>
        {content?.map((item, i) =>
          typeof item === 'string' && item === 'separator' ? (
            <RUIContextMenu.Separator key={`${id}-${i}`} />
          ) : (
            <Fragment key={`${id}-${i}`}>
              {item.children ? (
                <RUIContextMenu.Sub>
                  <RUIContextMenu.SubTrigger>
                    {item.text}
                  </RUIContextMenu.SubTrigger>
                  <RUIContextMenu.SubContent>
                    {item.children.map((child, n) =>
                      typeof child === 'string' && child === 'separator' ? (
                        <RUIContextMenu.Separator key={`${id}-${i}-${n}`} />
                      ) : (
                        <RUIContextMenu.Item
                          key={`${id}-${i}-${n}`}
                          shortcut={child.shortcut}>
                          {child.text}
                        </RUIContextMenu.Item>
                      )
                    )}
                  </RUIContextMenu.SubContent>
                </RUIContextMenu.Sub>
              ) : (
                <RUIContextMenu.Item
                  shortcut={item.shortcut}
                  color={item.color}>
                  {item.text}
                </RUIContextMenu.Item>
              )}
            </Fragment>
          )
        )}
      </RUIContextMenu.Content>
    </RUIContextMenu.Root>
  )
}
