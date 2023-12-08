import { useDroppable } from '@dnd-kit/core'
import { HTMLAttributes, JSX, ReactNode, useEffect } from 'react'

type DragData = Record<string, unknown>

type DroppableProps<T extends DragData> = HTMLAttributes<HTMLElement> & {
  id: string
  children?: ReactNode
  data?: T
  as?: JSX.ElementType
  onDropOver?: () => void
  onDropOut?: () => void
}

export default function Droppable<T extends DragData>({
  id,
  children,
  data,
  as,
  onDropOver,
  onDropOut,
  ...props
}: DroppableProps<T>) {
  const Component = as ?? 'div'
  const { setNodeRef, isOver } = useDroppable({
    id,
    data,
  })

  useEffect(() => {
    if (isOver) {
      onDropOver?.()
    } else {
      onDropOut?.()
    }
  }, [isOver, onDropOut, onDropOver])

  return (
    <Component {...props} ref={setNodeRef}>
      {children}
    </Component>
  )
}
