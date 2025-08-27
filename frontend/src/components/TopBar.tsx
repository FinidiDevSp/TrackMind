import { useState, type ReactNode, type KeyboardEvent } from 'react'
import './TopBar.css'
import { FaMusic, FaList, FaBan, FaEllipsisH, FaBars } from 'react-icons/fa'
import type { IconType } from 'react-icons'

export type Tab = 'BEATPORT' | '1001TRACKLIST' | 'BAN/UNBAN' | 'OTROS'

interface TopBarProps {
  logo?: ReactNode
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onSettingsClick: () => void
}

const tabs: Tab[] = ['BEATPORT', '1001TRACKLIST', 'BAN/UNBAN', 'OTROS']

const tabIcons: Record<Tab, IconType> = {
  BEATPORT: FaMusic,
  '1001TRACKLIST': FaList,
  'BAN/UNBAN': FaBan,
  OTROS: FaEllipsisH,
}

const TopBar = ({ logo, activeTab, onTabChange, onSettingsClick }: TopBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(prev => !prev)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="topbar">
      <div className="topbar__logo">{logo}</div>
      <button
        className="topbar__menu-toggle"
        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isMenuOpen}
        aria-controls="topbar-menu"
        onClick={toggleMenu}
      >
        <FaBars />
      </button>
      <nav
        id="topbar-menu"
        className={`topbar__nav${isMenuOpen ? ' topbar__nav--open' : ''}`}
        onKeyDown={handleKeyDown}
      >
        {tabs.map(tab => {
          const Icon = tabIcons[tab]
          return (
            <button
              key={tab}
              className={`topbar__tab${activeTab === tab ? ' topbar__tab--active' : ''}`}
              onClick={() => {
                onTabChange(tab)
                setIsMenuOpen(false)
              }}
            >
              <Icon />
              {tab}
            </button>
          )
        })}
      </nav>
      <button className="topbar__settings" aria-label="Abrir configuración" onClick={onSettingsClick}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M11.983 2.083a1 1 0 0 1 1.935 0l.342 1.094a1 1 0 0 0 .95.694h1.154a1 1 0 0 1 .986 1.164l-.223 1.274a1 1 0 0 0 .271.907l.817.817a1 1 0 0 1 0 1.414l-.817.817a1 1 0 0 0-.271.907l.223 1.274a1 1 0 0 1-.986 1.164h-1.154a1 1 0 0 0-.95.694l-.342 1.094a1 1 0 0 1-1.935 0l-.342-1.094a1 1 0 0 0-.95-.694H9.537a1 1 0 0 1-.986-1.164l.223-1.274a1 1 0 0 0-.271-.907l-.817-.817a1 1 0 0 1 0-1.414l.817-.817a1 1 0 0 0 .271-.907L8.55 5.035A1 1 0 0 1 9.537 3.87h1.154a1 1 0 0 0 .95-.694l.342-1.094zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </header>
  )
}

export default TopBar
