import { useState } from 'react'
import { useMainConfig } from '../MainConfigContext'
import './Sidebar.css'

export type Tab = 'BEATPORT' | '1001TRACKLIST' | 'BAN/UNBAN' | 'OTROS'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onSettingsClick: () => void
}

const tabIcons: Record<Tab, string> = {
  BEATPORT: 'fa-solid fa-music',
  '1001TRACKLIST': 'fa-solid fa-list',
  'BAN/UNBAN': 'fa-solid fa-ban',
  OTROS: 'fa-solid fa-ellipsis-h',
}

const Sidebar = ({ activeTab, onTabChange, onSettingsClick }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const { config } = useMainConfig()
  const tabs: Tab[] = config.banScreenEnabled
    ? ['BEATPORT', '1001TRACKLIST', 'BAN/UNBAN', 'OTROS']
    : ['BEATPORT', '1001TRACKLIST', 'OTROS']

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar__top">
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

