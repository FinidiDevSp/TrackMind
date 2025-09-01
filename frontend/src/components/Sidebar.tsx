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

const Sidebar = ({ activeTab, onTabChange, onSettingsClick }: SidebarProps) => (
  <div className="d-flex">
    <button
      className="sidebar__toggle btn btn-link"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#sidebarMenu"
      aria-controls="sidebarMenu"
      aria-label="Alternar menú"
    >
      <i className="fa-solid fa-bars" />
    </button>
    <div className="collapse collapse-horizontal show" id="sidebarMenu" style={{ width: '200px' }}>
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__avatar" />
          <span className="sidebar__name">GORKA</span>
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
              <span>{tab}</span>
            </button>
          ))}
        </nav>
        <button className="sidebar__settings" aria-label="Abrir configuración" onClick={onSettingsClick}>
          <i className="fa-solid fa-gear" />
          <span>Configuración</span>
        </button>
      </aside>
    </div>
  </div>
)

export default Sidebar

