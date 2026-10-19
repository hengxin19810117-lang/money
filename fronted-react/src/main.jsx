import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AnimeThemeProvider from './components/AnimeThemeProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AnimeThemeProvider>
      <App />
    </AnimeThemeProvider>
  </StrictMode>,
)
