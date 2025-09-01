import { Fragment, useEffect, useState } from 'react'
import { FaTrash, FaFolder, FaFolderOpen, FaSearch } from 'react-icons/fa'
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

  const [banSearchTerm, setBanSearchTerm] = useState('')
  const [unbanSearchTerm, setUnbanSearchTerm] = useState('')
  const [alert, setAlert] = useState<
    { type: 'success' | 'danger'; message: string } | null
  >(null)
  const [lastRemoved, setLastRemoved] = useState<
    { item: Item; from: 'ban' | 'unban' } | null
  >(null)
  const [draggedItem, setDraggedItem] = useState<
    { item: Item; from: 'ban' | 'unban' } | null
  >(null)
  const [dragOver, setDragOver] = useState<'ban' | 'unban' | null>(null)

  useEffect(() => {
    if (!alert) return
    const timer = setTimeout(() => setAlert(null), 3000)
    return () => clearTimeout(timer)
  }, [alert])

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
    type: 'BAN' | 'UNBAN',
  ) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0] as File & { path?: string; webkitRelativePath?: string }
      const path =
        file.path ||
        (file.webkitRelativePath
          ? file.webkitRelativePath.split('/')[0]
          : file.name)
      setter(path)
      await checkPath(path, errorSetter)
      setAlert({ type: 'success', message: `Carpeta ${type} seleccionada` })
      e.target.value = ''
    }
  }

  const removeBan = (id: number) => {
    const item = banList.find(i => i.id === id)
    if (item && window.confirm(`¿Eliminar ${item.name}?`)) {
      setBanList(prev => prev.filter(i => i.id !== id))
      setLastRemoved({ item, from: 'ban' })
      setAlert({ type: 'danger', message: `${item.name} eliminado de BAN` })
    }
  }

  const removeUnban = (id: number) => {
    const item = unbanList.find(i => i.id === id)
    if (item && window.confirm(`¿Eliminar ${item.name}?`)) {
      setUnbanList(prev => prev.filter(i => i.id !== id))
      setLastRemoved({ item, from: 'unban' })
      setAlert({ type: 'danger', message: `${item.name} eliminado de UNBAN` })
    }
  }

  const undoRemove = () => {
    if (!lastRemoved) return
    if (lastRemoved.from === 'ban') {
      setBanList(prev => [...prev, lastRemoved.item])
      setAlert({
        type: 'success',
        message: `${lastRemoved.item.name} agregado a BAN`,
      })
    } else {
      setUnbanList(prev => [...prev, lastRemoved.item])
      setAlert({
        type: 'success',
        message: `${lastRemoved.item.name} agregado a UNBAN`,
      })
    }
    setLastRemoved(null)
  }

  const handleDrop = (target: 'ban' | 'unban') => {
    if (!draggedItem || draggedItem.from === target) return
    if (target === 'ban') {
      setBanList(prev => [...prev, draggedItem.item])
      setUnbanList(prev => prev.filter(i => i.id !== draggedItem.item.id))
      setAlert({
        type: 'success',
        message: `${draggedItem.item.name} movido a BAN`,
      })
    } else {
      setUnbanList(prev => [...prev, draggedItem.item])
      setBanList(prev => prev.filter(i => i.id !== draggedItem.item.id))
      setAlert({
        type: 'success',
        message: `${draggedItem.item.name} movido a UNBAN`,
      })
    }
    setDraggedItem(null)
    setDragOver(null)
  }

  const groupedBan = groupByLetter(banList)
  const groupedUnban = groupByLetter(unbanList)

  const filterGroups = (groups: Record<string, Item[]>, term: string) =>
    Object.entries(groups).reduce<Record<string, Item[]>>(
      (acc, [letter, items]) => {
        const filteredItems = items.filter(item =>
          item.name.toLowerCase().includes(term.toLowerCase()),
        )
        if (filteredItems.length) acc[letter] = filteredItems
        return acc
      },
      {},
    )

  const filteredGroupedBan = filterGroups(groupedBan, banSearchTerm)
  const filteredGroupedUnban = filterGroups(groupedUnban, unbanSearchTerm)

  return (
    <>
      <div className="container my-3">
        <div className="row g-3">
          <section className="col-md-6 d-flex flex-column">
            <div className="input-group mb-2">
              <span className="input-group-text">
                <FaFolder />
              </span>
              <input
                type="text"
                className="form-control"
                value={banPath}
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
                onChange={e => handleFolderChange(e, setBanPath, setBanError, 'BAN')}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore: permitir selección de carpetas
                webkitdirectory=""
              />
              <label
                htmlFor="ban-folder"
                aria-label="Seleccionar carpeta BAN"
                tabIndex={0}
                className="input-group-text btn btn-primary"
              >
                <FaFolderOpen />
              </label>
            </div>
            {banError && <div className="text-danger small mb-2">{banError}</div>}
            <div className="input-group mb-2">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="search"
                className="form-control"
                value={banSearchTerm}
                onChange={e => setBanSearchTerm(e.target.value)}
                placeholder="Buscar..."
              />
            </div>
            <ul
              className={`list-group flex-grow-1 overflow-auto ${dragOver === 'ban' ? 'drag-over' : ''}`}
              onDragOver={e => e.preventDefault()}
              onDragEnter={() => setDragOver('ban')}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop('ban')}
            >
              {Object.entries(filteredGroupedBan)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([letter, items]) => (
                  <Fragment key={letter}>
                    <li className="list-group-item letter-header">{letter}</li>
                    {items.map(item => (
                      <li
                        key={item.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        draggable
                        onDragStart={() => setDraggedItem({ item, from: 'ban' })}
                        onDragEnd={() => setDraggedItem(null)}
                      >
                        <span>{item.name}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
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

          <section className="col-md-6 d-flex flex-column">
            <div className="input-group mb-2">
              <span className="input-group-text">
                <FaFolder />
              </span>
              <input
                type="text"
                className="form-control"
                value={unbanPath}
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
                onChange={e => handleFolderChange(e, setUnbanPath, setUnbanError, 'UNBAN')}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore: permitir selección de carpetas
                webkitdirectory=""
              />
              <label
                htmlFor="unban-folder"
                aria-label="Seleccionar carpeta UNBAN"
                tabIndex={0}
                className="input-group-text btn btn-primary"
              >
                <FaFolderOpen />
              </label>
            </div>
            {unbanError && <div className="text-danger small mb-2">{unbanError}</div>}
            <div className="input-group mb-2">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="search"
                className="form-control"
                value={unbanSearchTerm}
                onChange={e => setUnbanSearchTerm(e.target.value)}
                placeholder="Buscar..."
              />
            </div>
            <ul
              className={`list-group flex-grow-1 overflow-auto ${dragOver === 'unban' ? 'drag-over' : ''}`}
              onDragOver={e => e.preventDefault()}
              onDragEnter={() => setDragOver('unban')}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop('unban')}
            >
              {Object.entries(filteredGroupedUnban)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([letter, items]) => (
                  <Fragment key={letter}>
                    <li className="list-group-item letter-header">{letter}</li>
                    {items.map(item => (
                      <li
                        key={item.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        draggable
                        onDragStart={() => setDraggedItem({ item, from: 'unban' })}
                        onDragEnd={() => setDraggedItem(null)}
                      >
                        <span>{item.name}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
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
      </div>
      <footer className="text-center mt-3 border-top pt-2">
        Información de la pantalla BAN/UNBAN
      </footer>
      {alert && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`}
          role="alert"
        >
          {alert.message}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setAlert(null)}
          ></button>
        </div>
      )}
      {lastRemoved && (
        <button
          type="button"
          className="btn btn-primary position-fixed bottom-0 end-0 m-3"
          onClick={undoRemove}
        >
          Deshacer
        </button>
      )}
    </>
  )
}

export default BanTab
