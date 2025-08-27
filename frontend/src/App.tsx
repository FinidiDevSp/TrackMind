import { useEffect, useState } from 'react'
import TopBar, { type Tab } from './components/TopBar'
import SettingsModal from './components/SettingsModal'

function App() {
  const [msg, setMsg] = useState('cargando...')
  const [activeTab, setActiveTab] = useState<Tab>('BEATPORT')
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    fetch('/api/hello')
      .then(r => r.json())
      .then(d => setMsg(d.message))
      .catch(() => setMsg('Error conectando con el backend'))
  }, [])

  return (
    <>
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <h1>MP3 Tool</h1>
        <p>
          Backend dice: <strong>{msg}</strong>
        </p>
        {activeTab === 'BEATPORT' && (
          <div className="text-boxes">
            <input type="text" placeholder="Caja 1" />
            <input type="text" placeholder="Caja 2" />
          </div>
        )}
        {activeTab === '1001TRACKLIST' && (
          <label>Pantalla 1001TRACKLIST</label>
        )}
        {activeTab === 'BAN/UNBAN' && <label>Pantalla BAN/UNBAN</label>}
        {activeTab === 'OTROS' && <label>Pantalla OTROS</label>}
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  )
}

export default App
