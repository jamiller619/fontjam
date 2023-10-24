import ThemeProvider from '~/style/ThemeProvider'
import Router from './Router'

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  )
}
