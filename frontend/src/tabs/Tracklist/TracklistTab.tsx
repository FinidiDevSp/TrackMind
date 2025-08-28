import { useState, useEffect, Fragment } from 'react'
import './TracklistTab.css'
import { tracklists, type Track } from './sampleData'
import ResponsiveTable from '../../components/ResponsiveTable'

const moodColors: Record<string, string> = {
  'mood 1': '#ff6b6b',
  'mood 2': '#4dabf7',
  'mood 3': '#51cf66',
}

const EnergyBar = ({ energy }: { energy: number }) => {
  const percentage = (energy / 5) * 100
  return (
    <div className="energy-bar">
      <div className="energy-bar-fill" style={{ width: `${percentage}%` }} />
    </div>
  )
}

const TracklistTab = () => {
  const [selectedId, setSelectedId] = useState(tracklists[0]?.id)
  const [tracks, setTracks] = useState<Track[]>(tracklists[0]?.tracks ?? [])
  const [loading, setLoading] = useState(false)
  const [minEnergy, setMinEnergy] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  type SortKey = 'index' | 'theme' | 'custom' | 'mood' | 'energy' | 'genre' | 'year' | 'type'
  const [sortBy, setSortBy] = useState<SortKey>('index')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)
  const [showTracklists, setShowTracklists] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const handleSelect = (id: string) => {
    setSelectedId(id)
  }

  useEffect(() => {
    const tl = tracklists.find(t => t.id === selectedId)
    if (!tl) return
    setLoading(true)
    const timer = setTimeout(() => {
      setTracks(tl.tracks)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [selectedId])

  const filteredTracks = tracks.filter(t => t.energy >= minEnergy)
  const sortedTracks = (() => {
    const arr = [...filteredTracks]
    if (sortBy === 'index') {
      return sortDirection === 'asc' ? arr : arr.reverse()
    }
    return arr.sort((a, b) => {
      let aVal: string | number
      let bVal: string | number
      if (sortBy === 'theme') {
        aVal = `${a.artists} ${a.title}`
        bVal = `${b.artists} ${b.title}`
      } else {
        aVal = a[sortBy]
        bVal = b[sortBy]
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
  })()
  const filteredTracklists = tracklists.filter(tl =>
    tl.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSort = (column: SortKey) => {
    if (sortBy === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedTrack(prev => (prev === id ? null : id))
  }

  return (
    <div className="tracklist-container">
      <aside className={`tracklists-panel ${showTracklists ? 'open' : ''}`}>
        <input
          className="search-input"
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredTracklists.map(tl => (
            <li
              key={tl.id}
              className={tl.id === selectedId ? 'active' : ''}
              onClick={() => handleSelect(tl.id)}
            >
              {tl.name}
            </li>
          ))}
        </ul>
      </aside>
      <section className="tracks-panel">
        <div className="mobile-controls">
          <button onClick={() => setShowTracklists(prev => !prev)}>Listas</button>
          <button onClick={() => setShowFilters(prev => !prev)}>Filtros</button>
        </div>
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <ResponsiveTable className="fade-in">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort('index')}
                  className={`sortable ${sortBy === 'index' ? `sort-${sortDirection}` : ''}`}
                >
                  #
                </th>
                <th
                  onClick={() => handleSort('theme')}
                  className={`sortable ${sortBy === 'theme' ? `sort-${sortDirection}` : ''}`}
                >
                  Tema
                </th>
                <th
                  onClick={() => handleSort('custom')}
                  className={`sortable ${sortBy === 'custom' ? `sort-${sortDirection}` : ''}`}
                >
                  Custom
                </th>
                <th
                  onClick={() => handleSort('mood')}
                  className={`sortable ${sortBy === 'mood' ? `sort-${sortDirection}` : ''}`}
                >
                  Mood
                </th>
                <th
                  onClick={() => handleSort('energy')}
                  className={`sortable ${sortBy === 'energy' ? `sort-${sortDirection}` : ''}`}
                >
                  Energy
                </th>
                <th
                  onClick={() => handleSort('genre')}
                  className={`sortable ${sortBy === 'genre' ? `sort-${sortDirection}` : ''}`}
                >
                  Género
                </th>
                <th
                  onClick={() => handleSort('year')}
                  className={`sortable ${sortBy === 'year' ? `sort-${sortDirection}` : ''}`}
                >
                  Año
                </th>
                <th
                  onClick={() => handleSort('type')}
                  className={`sortable ${sortBy === 'type' ? `sort-${sortDirection}` : ''}`}
                >
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTracks.map((track, idx) => (
                <Fragment key={track.id}>
                  <tr
                    onClick={() => toggleExpand(track.id)}
                    className="track-row"
                  >
                    <td>{idx + 1}</td>
                    <td>
                      {track.artists} - {track.title}
                    </td>
                    <td>{track.custom}</td>
                    <td>
                      <span
                        className="mood-badge"
                        style={{ backgroundColor: moodColors[track.mood] }}
                      >
                        {track.mood}
                      </span>
                    </td>
                    <td>
                      <EnergyBar energy={track.energy} />
                    </td>
                    <td>{track.genre}</td>
                    <td>{track.year}</td>
                    <td>{track.type}</td>
                  </tr>
                  {expandedTrack === track.id && (
                    <tr className="expanded-row">
                      <td colSpan={8}>
                        <div className="expanded-content">
                          <img src={track.imageUrl} alt={track.title} />
                          <audio controls src={track.previewUrl} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </ResponsiveTable>
        )}
      </section>
      <aside className={`filter-panel ${showFilters ? 'open' : ''}`}>
        <label>
          Energía mínima
          <select value={minEnergy} onChange={e => setMinEnergy(Number(e.target.value))}>
            <option value={0}>Todas</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5</option>
          </select>
        </label>
      </aside>
    </div>
  )
}

export default TracklistTab
