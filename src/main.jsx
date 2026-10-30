import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AppStateProvider from './state/AppStateProvider.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </StrictMode>,
)
