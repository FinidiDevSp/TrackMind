import { ReactNode } from 'react'
import './TopBar.css'

interface TopBarProps {
  logo?: ReactNode
}

const TopBar = ({ logo }: TopBarProps) => {
  return (
    <header className="topbar">
      <div className="topbar__logo">{logo}</div>
      <button className="topbar__settings" aria-label="Abrir configuración">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M11.983 2.083a1 1 0 0 1 1.935 0l.342 1.094a1 1 0 0 0 .95.694h1.154a1 1 0 0 1 .986 1.164l-.223 1.274a1 1 0 0 0 .271.907l.817.817a1 1 0 0 1 0 1.414l-.817.817a1 1 0 0 0-.271.907l.223 1.274a1 1 0 0 1-.986 1.164h-1.154a1 1 0 0 0-.95.694l-.342 1.094a1 1 0 0 1-1.935 0l-.342-1.094a1 1 0 0 0-.95-.694H9.537a1 1 0 0 1-.986-1.164l.223-1.274a1 1 0 0 0-.271-.907l-.817-.817a1 1 0 0 1 0-1.414l.817-.817a1 1 0 0 0 .271-.907L8.55 5.035A1 1 0 0 1 9.537 3.87h1.154a1 1 0 0 0 .95-.694l.342-1.094zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" clipRule="evenodd" />
        </svg>
      </button>
    </header>
  )
}

export default TopBar
