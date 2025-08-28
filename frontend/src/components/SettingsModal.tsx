import { useEffect, useRef, useState } from 'react'
import './SettingsModal.css'
import { useTheme } from '../theme/ThemeContext'

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
  const [isClosing, setIsClosing] = useState(false)
  const { theme, setTheme } = useTheme()
  const openerRef = useRef<HTMLElement | null>(
    document.activeElement instanceof HTMLElement ? document.activeElement : null
  )
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/changelog.json')
      .then(r => r.json())
      .then(setEntries)
      .catch(() => setEntries([]))
  }, [])

  useEffect(() => {
    const node = modalRef.current
    if (!node) return

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([type="hidden"]):not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ]

    const getFocusable = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
      )

    const focusables = getFocusable()
    focusables[0]?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const elems = getFocusable()
      const first = elems[0]
      const last = elems[elems.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    node.addEventListener('keydown', handleKeyDown)
    return () => node.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      openerRef.current?.focus()
    }, 200)
  }

  return (
    <div
      ref={modalRef}
      className={`settings-overlay${isClosing ? ' closing' : ''}`}
      role="dialog"
      aria-modal="true"
    >
      <div className={`settings-modal${isClosing ? ' closing' : ''}`}>
        <div className="settings-header">
          <h2>SETTINGS</h2>
          <button className="settings-close" onClick={handleClose} aria-label="Cerrar">
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
          {activeTab === 'CHANGELOG' && (
            <ul className="changelog-list">
              {entries.map(e => (
                <li key={e.hash}>
                  <span className="changelog-date">{e.date}</span>
                  <span className="changelog-message">{e.message}</span>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'QUICK TAG CUSTOM' && <div className="placeholder">Coming soon...</div>}
          {activeTab === 'GENERAL' && (
            <div className="theme-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={e => setTheme(e.target.checked ? 'dark' : 'light')}
                />
                Dark mode
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
