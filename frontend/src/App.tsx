import { useEffect, useState, lazy, Suspense } from 'react'
import { useMainConfig } from './MainConfigContext'
import Sidebar, { type Tab } from './components/Sidebar'
import SettingsModal from './components/SettingsModal'

const BeatportTab = lazy(() => import('./tabs/Beatport/BeatportTab'))
const TracklistTab = lazy(() => import('./tabs/Tracklist/TracklistTab'))
const BanTab = lazy(() => import('./tabs/Ban/BanTab'))
const OtrosTab = lazy(() => import('./tabs/Otros/OtrosTab'))

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('BEATPORT')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const { config } = useMainConfig()

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const handleStart = () => {
    alert(config.banScreenEnabled ? 'OK' : 'NO OK')
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <main
        style={{
          flex: 1,
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <nav id="main-breadcrumb" aria-label="breadcrumb">
          <ol className="breadcrumb mb-3">
            <li className="breadcrumb-item">
              <a href="#section-content">Contenido</a>
            </li>
            <li className="breadcrumb-item">
              <a href="#section-info">Información</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {activeTab}
            </li>
          </ol>
        </nav>
        <div
          id="section-content"
          className="flex-grow-1 overflow-auto"
          data-bs-spy="scroll"
          data-bs-target="#main-breadcrumb"
          tabIndex={0}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleStart}
          >
            Iniciar
          </button>
          <Suspense fallback={<div>Cargando...</div>}>
            {activeTab === 'BEATPORT' && <BeatportTab />}
            {activeTab === '1001TRACKLIST' && <TracklistTab />}
            {activeTab === 'BAN/UNBAN' && <BanTab />}
            {activeTab === 'OTROS' && <OtrosTab />}
          </Suspense>
        </div>
        <div className="text-end mt-2" id="section-info">
          {time}
        </div>
      </main>
      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}

export default App

