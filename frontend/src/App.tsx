import { useEffect, useState } from 'react'

function App() {
  const [msg, setMsg] = useState('cargando...')

  useEffect(() => {
    fetch('/api/hello')
      .then(r => r.json())
      .then(d => setMsg(d.message))
      .catch(() => setMsg('Error conectando con el backend'))
  }, [])

  return (
    <div style={{fontFamily:'system-ui, sans-serif', padding: 24}}>
      <h1>MP3 Tool</h1>
      <p>Backend dice: <strong>{msg}</strong></p>
    </div>
  )
}

export default App
