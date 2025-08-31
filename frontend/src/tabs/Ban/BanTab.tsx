import { Fragment, useEffect, useState } from 'react'
import { FaTrash, FaFolder, FaFolderOpen } from 'react-icons/fa'
import './BanTab.css'

interface Item {
  id: number
  name: string
}

const groupByLetter = (items: Item[]) =>
  items.reduce<Record<string, Item[]>>((acc, item) => {
    const letter = item.name.charAt(0).toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(item)
    return acc
  }, {})

const BanTab = () => {
  const [banPath, setBanPath] = useState('')
  const [unbanPath, setUnbanPath] = useState('')
  const [banError, setBanError] = useState('')
  const [unbanError, setUnbanError] = useState('')
  const [banList, setBanList] = useState<Item[]>([
    { id: 1, name: 'Alpha Song' },
    { id: 2, name: 'Amanecer' },
    { id: 3, name: 'Bravo Beat' },
    { id: 4, name: 'Blue Sky' },
    { id: 5, name: 'Crazy Tune' },
    { id: 6, name: 'Crystal' },
    { id: 7, name: 'Danza' },
    { id: 8, name: 'Dreamer' },
    { id: 9, name: 'Eclipse' },
    { id: 10, name: 'Emerald' },
    { id: 11, name: 'Fuego' },
    { id: 12, name: 'Fiesta' },
  ])
  const [unbanList, setUnbanList] = useState<Item[]>([
    { id: 13, name: 'Azul' },
    { id: 14, name: 'Alfa' },
    { id: 15, name: 'Brisa' },
    { id: 16, name: 'Barco' },
    { id: 17, name: 'Corazon' },
    { id: 18, name: 'Cielo' },
    { id: 19, name: 'Diamante' },
    { id: 20, name: 'Dragon' },
    { id: 21, name: 'Estrella' },
    { id: 22, name: 'Espada' },
    { id: 23, name: 'Faro' },
    { id: 24, name: 'Flota' },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [lastRemoved, setLastRemoved] = useState<
    { item: Item; from: 'ban' | 'unban' } | null
  >(null)

  const validatePath = async (path: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fs = (window as any).require?.('fs')
      if (fs) {
        await fs.promises.access(path)
        const stat = await fs.promises.lstat(path)
        return stat.isDirectory()
      }
    } catch {
      return false
    }
    return path.trim().length > 0
  }

  const checkPath = async (
    path: string,
    errorSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const valid = await validatePath(path)
    errorSetter(valid ? '' : 'Ruta inválida o inaccesible')
  }

  const handleFolderChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    errorSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0] as File & { path?: string; webkitRelativePath?: string }
      const path = file.path ?? file.webkitRelativePath?.split('/')[0] ?? ''
      setter(path)
      await checkPath(path, errorSetter)
    }
  }

  const removeBan = (id: number) => {
    const item = banList.find(i => i.id === id)
    if (item && window.confirm(`¿Eliminar ${item.name}?`)) {
      setBanList(prev => prev.filter(i => i.id !== id))
      setLastRemoved({ item, from: 'ban' })
    }
  }

  const removeUnban = (id: number) => {
    const item = unbanList.find(i => i.id === id)
    if (item && window.confirm(`¿Eliminar ${item.name}?`)) {
      setUnbanList(prev => prev.filter(i => i.id !== id))
      setLastRemoved({ item, from: 'unban' })
    }
  }

  const undoRemove = () => {
    if (!lastRemoved) return
    if (lastRemoved.from === 'ban') {
      setBanList(prev => [...prev, lastRemoved.item])
    } else {
      setUnbanList(prev => [...prev, lastRemoved.item])
    }
    setLastRemoved(null)
  }

  useEffect(() => {
    setShowAlert(true)
    const timer = setTimeout(() => setShowAlert(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const groupedBan = groupByLetter(banList)
  const groupedUnban = groupByLetter(unbanList)

  const filterGroups = (groups: Record<string, Item[]>) =>
    Object.entries(groups).reduce<Record<string, Item[]>>(
      (acc, [letter, items]) => {
        const filteredItems = items.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        if (filteredItems.length) acc[letter] = filteredItems
        return acc
      },
      {},
    )

  const filteredGroupedBan = filterGroups(groupedBan)
  const filteredGroupedUnban = filterGroups(groupedUnban)

  return (
    <>
      <div className="ban-container">
        <section className="ban-section">
          <div className="path-input">
            <FaFolder className="input-icon" />
            <input
              type="text"
              value={banPath}
              readOnly={false}
              onChange={e => {
                setBanPath(e.target.value)
                setBanError('')
              }}
              onBlur={() => checkPath(banPath, setBanError)}
              placeholder="Ruta BAN"
            />
            <input
              id="ban-folder"
              type="file"
              style={{ display: 'none' }}
              onChange={e => handleFolderChange(e, setBanPath, setBanError)}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore: permitir selección de carpetas
              webkitdirectory=""
            />
            <label htmlFor="ban-folder" aria-label="Seleccionar carpeta BAN" tabIndex={0}>
              <FaFolderOpen />
            </label>
          </div>
          {banError && <span className="error-message">{banError}</span>}
        <input
          type="search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar..."
        />
        <ul className="item-list">
          {Object.entries(filteredGroupedBan)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, items]) => (
              <Fragment key={letter}>
                <li className="letter-header">{letter}</li>
                {items.map(item => (
                  <li key={item.id} className="item-row">
                    <span>{item.name}</span>
                    <button
                      type="button"
                      className="item-remove"
                      onClick={() => removeBan(item.id)}
                      aria-label={`Eliminar ${item.name}`}
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </Fragment>
            ))}
        </ul>
      </section>

      <section className="ban-section">
        <div className="path-input">
          <FaFolder className="input-icon" />
          <input
            type="text"
            value={unbanPath}
            readOnly={false}
            onChange={e => {
              setUnbanPath(e.target.value)
              setUnbanError('')
            }}
            onBlur={() => checkPath(unbanPath, setUnbanError)}
            placeholder="Ruta UNBAN"
          />
          <input
            id="unban-folder"
            type="file"
            style={{ display: 'none' }}
            onChange={e => handleFolderChange(e, setUnbanPath, setUnbanError)}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: permitir selección de carpetas
            webkitdirectory=""
          />
          <label htmlFor="unban-folder" aria-label="Seleccionar carpeta UNBAN" tabIndex={0}>
            <FaFolderOpen />
          </label>
        </div>
        {unbanError && <span className="error-message">{unbanError}</span>}
        <input
          type="search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar..."
        />
        <ul className="item-list">
          {Object.entries(filteredGroupedUnban)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, items]) => (
              <Fragment key={letter}>
                <li className="letter-header">{letter}</li>
                {items.map(item => (
                  <li key={item.id} className="item-row">
                    <span>{item.name}</span>
                    <button
                      type="button"
                      className="item-remove"
                      onClick={() => removeUnban(item.id)}
                      aria-label={`Eliminar ${item.name}`}
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </Fragment>
            ))}
        </ul>
      </section>
      </div>
      <footer className="ban-footer">Información de la pantalla BAN/UNBAN</footer>
      {showAlert && (
        <div className="alert-box">
          Cargados {banList.length} BAN y {unbanList.length} UNBAN
        </div>
      )}
      {lastRemoved && (
        <button type="button" className="undo-button" onClick={undoRemove}>
          Deshacer
        </button>
      )}
    </>
  )
}

export default BanTab
