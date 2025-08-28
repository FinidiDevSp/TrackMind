import { useState, useEffect } from 'react'
import './TracklistTab.css'
import { tracklists, type Track } from './sampleData'
import { FaStar, FaRegStar } from 'react-icons/fa'

const TracklistTab = () => {
  const [selectedId, setSelectedId] = useState(tracklists[0]?.id)
  const [tracks, setTracks] = useState<Track[]>(tracklists[0]?.tracks ?? [])
  const [loading, setLoading] = useState(false)
  const [minEnergy, setMinEnergy] = useState(0)

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

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < count ? <FaStar key={i} color="#ffc107" /> : <FaRegStar key={i} color="#555" />
    )
  }

  return (
    <div className="tracklist-container">
      <aside className="tracklists-panel">
        <ul>
          {tracklists.map(tl => (
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
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <table className="fade-in">
            <thead>
              <tr>
                <th>#</th>
                <th>Tema</th>
                <th>Custom</th>
                <th>Mood</th>
                <th>Energy</th>
                <th>Género</th>
                <th>Año</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {filteredTracks.map((track, idx) => (
                <tr key={track.id}>
                  <td>{idx + 1}</td>
                  <td>{track.artists} - {track.title}</td>
                  <td>{track.custom}</td>
                  <td>{track.mood}</td>
                  <td>{renderStars(track.energy)}</td>
                  <td>{track.genre}</td>
                  <td>{track.year}</td>
                  <td>{track.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <aside className="filter-panel">
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
