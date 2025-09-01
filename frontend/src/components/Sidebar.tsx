import { useEffect, useState } from 'react'
import './Sidebar.css'

export type Tab = 'BEATPORT' | '1001TRACKLIST' | 'BAN/UNBAN' | 'OTROS'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onSettingsClick: () => void
}

const tabs: Tab[] = ['BEATPORT', '1001TRACKLIST', 'BAN/UNBAN', 'OTROS']

const tabIcons: Record<Tab, string> = {
  BEATPORT: 'fa-solid fa-music',
  '1001TRACKLIST': 'fa-solid fa-list',
  'BAN/UNBAN': 'fa-solid fa-ban',
  OTROS: 'fa-solid fa-ellipsis-h',
}

const Sidebar = ({ activeTab, onTabChange, onSettingsClick }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar__top">
        <span className="sidebar__time">{formattedTime}</span>
        <button
          className="sidebar__toggle"
          aria-label="Alternar menú"
          onClick={() => setCollapsed(prev => !prev)}
        >
          <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
        </button>
      </div>
      <div className="sidebar__header">
        <div className="sidebar__avatar" />
        {!collapsed && <span className="sidebar__name">GORKA</span>}
      </div>
      <nav className="sidebar__nav" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`sidebar__tab${activeTab === tab ? ' sidebar__tab--active' : ''}`}
            onClick={() => onTabChange(tab)}
            role="tab"
            aria-selected={activeTab === tab}
          >
            <i className={tabIcons[tab]} />
            {!collapsed && <span>{tab}</span>}
          </button>
        ))}
      </nav>
      <button
        className="sidebar__settings"
        aria-label="Abrir configuración"
        onClick={onSettingsClick}
      >
        <i className="fa-solid fa-gear" />
        {!collapsed && <span>Configuración</span>}
      </button>
    </aside>
  )
}

export default Sidebar

