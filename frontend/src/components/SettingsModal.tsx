import { useEffect, useState } from 'react'
import './SettingsModal.css'

interface ChangelogEntry {
  hash: string
  date: string
  message: string
}

interface SettingsModalProps {
  onClose: () => void
}

type Tab = 'CHANGELOG' | 'QUICK TAG CUSTOM' | 'GENERAL'

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('CHANGELOG')
  const [entries, setEntries] = useState<ChangelogEntry[]>([])

  useEffect(() => {
    fetch('/changelog.json')
      .then(r => r.json())
      .then(setEntries)
      .catch(() => setEntries([]))
  }, [])

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>SETTINGS</h2>
          <button className="settings-close" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>
        <div className="settings-tabs">
          {(['CHANGELOG', 'QUICK TAG CUSTOM', 'GENERAL'] as Tab[]).map(tab => (
            <button
              key={tab}
              className={tab === activeTab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="settings-content">
          {activeTab === 'CHANGELOG' ? (
            <ul className="changelog-list">
              {entries.map(e => (
                <li key={e.hash}>
                  <span className="changelog-date">{e.date}</span>
                  <span className="changelog-message">{e.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="placeholder">Coming soon...</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
