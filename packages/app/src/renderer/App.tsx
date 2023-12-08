import { DndContext } from '@dnd-kit/core'
import Router from '~/components/Router'
import ThemeProvider from '~/style/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <DndContext>
        <Router />
      </DndContext>
    </ThemeProvider>
  )
}
