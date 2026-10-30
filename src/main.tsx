import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AppStateProvider from './state/AppStateProvider'
import './styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('Application root element was not found')

createRoot(root).render(
  <StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </StrictMode>,
)
