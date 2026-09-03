import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

try {
  const saved = localStorage.getItem('sc_settings_v4');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.themeAccent) {
      document.documentElement.setAttribute('data-theme', parsed.themeAccent);
    }
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
