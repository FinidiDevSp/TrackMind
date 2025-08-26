import { useEffect, useState } from 'react'
import TopBar from './components/TopBar'

function App() {
  const [msg, setMsg] = useState('cargando...')

  useEffect(() => {
    fetch('/api/hello')
      .then(r => r.json())
      .then(d => setMsg(d.message))
      .catch(() => setMsg('Error conectando con el backend'))
  }, [])

  return (
    <>
      <TopBar />
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <h1>MP3 Tool</h1>
        <p>
          Backend dice: <strong>{msg}</strong>
        </p>
        <div className="text-boxes">
          <input type="text" placeholder="Caja 1" />
          <input type="text" placeholder="Caja 2" />
        </div>
      </div>
    </>
  )
}

export default App
