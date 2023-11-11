import ThemeProvider from '~/style/ThemeProvider'
import Router from './components/Router'

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  )
}
