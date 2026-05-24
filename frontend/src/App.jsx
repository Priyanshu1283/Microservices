import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './routes/AppRouter'
import { useEffect } from 'react'
import { useThemeStore } from './store/themeStore'
import { AIBuddyChat } from './components/AIBuddyChat'

function App() {
  const { theme } = useThemeStore()

  // Ensure theme class is applied on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [theme])

  return (
    <BrowserRouter>
      <AppRouter />
      <AIBuddyChat />
    </BrowserRouter>
  )
}

export default App
