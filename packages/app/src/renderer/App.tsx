import Router from '~/components/Router'
import ThemeProvider from '~/style/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  )
}
