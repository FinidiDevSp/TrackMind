import { useEffect, useState, lazy, Suspense } from 'react'
import { API_BASE } from './config'
import TopBar, { type Tab } from './components/TopBar'
import SettingsModal from './components/SettingsModal'

const BeatportTab = lazy(() => import('./tabs/Beatport/BeatportTab'))
const TracklistTab = lazy(() => import('./tabs/Tracklist/TracklistTab'))
const BanTab = lazy(() => import('./tabs/Ban/BanTab'))
const OtrosTab = lazy(() => import('./tabs/Otros/OtrosTab'))

function App() {
  const [msg, setMsg] = useState('cargando...')
  const [activeTab, setActiveTab] = useState<Tab>('BEATPORT')
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/hello`)
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
        <Suspense fallback={<div>Cargando...</div>}>
          {activeTab === 'BEATPORT' && <BeatportTab />}
          {activeTab === '1001TRACKLIST' && <TracklistTab />}
          {activeTab === 'BAN/UNBAN' && <BanTab />}
          {activeTab === 'OTROS' && <OtrosTab />}
        </Suspense>
      </div>
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  )
}

export default App
