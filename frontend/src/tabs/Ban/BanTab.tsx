import { Fragment, useEffect, useState } from 'react'
import { FaTrash, FaFolder, FaFolderOpen, FaSearch } from 'react-icons/fa'
import './BanTab.css'
import { apiFetch } from '../../utils/api'

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
  const [banList, setBanList] = useState<Item[]>([])
  const [unbanList, setUnbanList] = useState<Item[]>([])
  const [banSearchTerm, setBanSearchTerm] = useState('')
  const [unbanSearchTerm, setUnbanSearchTerm] = useState('')
  const [alert, setAlert] = useState<
    { type: 'success' | 'danger'; message: string } | null
  >(null)
  const [lastRemoved, setLastRemoved] = useState<
    { item: Item; from: 'ban' | 'unban' } | null
  >(null)
  const [dragged, setDragged] = useState<
    | { type: 'item'; item: Item; from: 'ban' | 'unban' }
    | { type: 'group'; letter: string; from: 'ban' | 'unban' }
    | null
  >(null)
  const [dragOver, setDragOver] = useState<'ban' | 'unban' | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [banned, allowed, paths] = await Promise.all([
          apiFetch('/banned'),
          apiFetch('/allowed'),
          apiFetch('/paths'),
        ])
        let idCounter = 1
        setBanList(banned.banned.map((name: string) => ({ id: idCounter++, name })))
        setUnbanList(
          allowed.allowed.map((name: string) => ({ id: idCounter++, name })),
        )
        setBanPath(paths.ban_path || '')
        setUnbanPath(paths.unban_path || '')
      } catch {
        setAlert({ type: 'danger', message: 'Error cargando datos del servidor' })
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!alert) return
    const timer = setTimeout(() => setAlert(null), 3000)
    return () => clearTimeout(timer)
  }, [alert])

  const validatePath = async (path: string) => {
    try {
      const res = await apiFetch('/validate-path', {
        method: 'POST',
        body: JSON.stringify({ path }),
      })
      return res.valid
    } catch {
      return false
    }
  }

  const checkPath = async (path: string, type: 'BAN' | 'UNBAN') => {
    const valid = await validatePath(path)
    if (!valid) {
      setAlert({
        type: 'danger',
        message: `Ruta ${type} inválida o inaccesible`,
      })
      return false
    }
    try {
      const payload = {
        ban_path: type === 'BAN' ? path : banPath,
        unban_path: type === 'UNBAN' ? path : unbanPath,
      }
      await apiFetch('/paths', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setAlert({ type: 'success', message: `Carpeta ${type} seleccionada` })
    } catch {
      setAlert({ type: 'danger', message: `Error guardando ruta ${type}` })
    }
    return true
  }

  const handleFolderChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    type: 'BAN' | 'UNBAN',
  ) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0] as File & { path?: string; webkitRelativePath?: string }
      let folderPath = ''
      if (file.path) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pathModule = (window as any).require?.('path')
        folderPath = pathModule
          ? pathModule.dirname(file.path)
          : file.path.replace(/[/\\][^/\\]*$/, '')
      } else if (file.webkitRelativePath) {
        folderPath = file.webkitRelativePath.split('/')[0]
      } else {
        folderPath = file.name
      }
      setter(folderPath)
      await checkPath(folderPath, type)
      e.target.value = ''
    }
  }

  const removeBan = async (id: number) => {
    const item = banList.find(i => i.id === id)
    if (item && window.confirm(`¿Eliminar ${item.name}?`)) {
      try {
        await apiFetch(`/banned/${encodeURIComponent(item.name)}`, {
          method: 'DELETE',
        })
        setBanList(prev => prev.filter(i => i.id !== id))
        setLastRemoved({ item, from: 'ban' })
        setAlert({ type: 'danger', message: `${item.name} eliminado de BAN` })
      } catch {
        setAlert({ type: 'danger', message: `Error eliminando ${item.name}` })
      }
    }
  }

  const removeUnban = async (id: number) => {
    const item = unbanList.find(i => i.id === id)
    if (item && window.confirm(`¿Eliminar ${item.name}?`)) {
      try {
        await apiFetch(`/allowed/${encodeURIComponent(item.name)}`, {
          method: 'DELETE',
        })
        setUnbanList(prev => prev.filter(i => i.id !== id))
        setLastRemoved({ item, from: 'unban' })
        setAlert({ type: 'danger', message: `${item.name} eliminado de UNBAN` })
      } catch {
        setAlert({ type: 'danger', message: `Error eliminando ${item.name}` })
      }
    }
  }

  const undoRemove = async () => {
    if (!lastRemoved) return
    try {
      if (lastRemoved.from === 'ban') {
        await apiFetch('/ban', {
          method: 'POST',
          body: JSON.stringify({ name: lastRemoved.item.name }),
        })
        setBanList(prev => [...prev, lastRemoved.item])
        setAlert({
          type: 'success',
          message: `${lastRemoved.item.name} agregado a BAN`,
        })
      } else {
        await apiFetch('/unban', {
          method: 'POST',
          body: JSON.stringify({ name: lastRemoved.item.name }),
        })
        setUnbanList(prev => [...prev, lastRemoved.item])
        setAlert({
          type: 'success',
          message: `${lastRemoved.item.name} agregado a UNBAN`,
        })
      }
      setLastRemoved(null)
    } catch {
      setAlert({ type: 'danger', message: 'Error restaurando elemento' })
    }
  }

  const handleDrop = async (target: 'ban' | 'unban') => {
    if (!dragged || dragged.from === target) return
    if (dragged.type === 'item') {
      const name = dragged.item.name
      try {
        if (target === 'ban') {
          await apiFetch('/ban', {
            method: 'POST',
            body: JSON.stringify({ name }),
          })
          setBanList(prev => [...prev, dragged.item])
          setUnbanList(prev => prev.filter(i => i.id !== dragged.item.id))
          setAlert({
            type: 'success',
            message: `${name} movido a BAN`,
          })
        } else {
          await apiFetch('/unban', {
            method: 'POST',
            body: JSON.stringify({ name }),
          })
          setUnbanList(prev => [...prev, dragged.item])
          setBanList(prev => prev.filter(i => i.id !== dragged.item.id))
          setAlert({
            type: 'success',
            message: `${name} movido a UNBAN`,
          })
        }
      } catch {
        setAlert({ type: 'danger', message: `Error moviendo ${name}` })
      }
    } else {
      const sourceList = dragged.from === 'ban' ? banList : unbanList
      const itemsToMove = sourceList.filter(i =>
        i.name.toUpperCase().startsWith(dragged.letter),
      )
      try {
        if (target === 'ban') {
          await Promise.all(
            itemsToMove.map(item =>
              apiFetch('/ban', {
                method: 'POST',
                body: JSON.stringify({ name: item.name }),
              }),
            ),
          )
          setBanList(prev => [...prev, ...itemsToMove])
          setUnbanList(prev =>
            prev.filter(i => !i.name.toUpperCase().startsWith(dragged.letter)),
          )
          setAlert({
            type: 'success',
            message: `Elementos '${dragged.letter}' movidos a BAN`,
          })
        } else {
          await Promise.all(
            itemsToMove.map(item =>
              apiFetch('/unban', {
                method: 'POST',
                body: JSON.stringify({ name: item.name }),
              }),
            ),
          )
          setUnbanList(prev => [...prev, ...itemsToMove])
          setBanList(prev =>
            prev.filter(i => !i.name.toUpperCase().startsWith(dragged.letter)),
          )
          setAlert({
            type: 'success',
            message: `Elementos '${dragged.letter}' movidos a UNBAN`,
          })
        }
      } catch {
        setAlert({ type: 'danger', message: 'Error moviendo elementos' })
      }
    }
    setDragged(null)
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
      <div className="my-3" style={{ margin: '0 10%' }}>
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
                onChange={e => setBanPath(e.target.value)}
                onBlur={e => checkPath(e.target.value, 'BAN')}
                onKeyDown={e => {
                  if (e.key === 'Enter') checkPath(e.currentTarget.value, 'BAN')
                }}
                placeholder="Ruta BAN"
              />
              <input
                id="ban-folder"
                type="file"
                style={{ display: 'none' }}
                onChange={e => handleFolderChange(e, setBanPath, 'BAN')}
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
                    <li
                      className="list-group-item letter-header"
                      draggable
                      onDragStart={() => setDragged({
                        type: 'group',
                        letter,
                        from: 'ban',
                      })}
                      onDragEnd={() => setDragged(null)}
                    >
                      {letter}
                    </li>
                    {items.map(item => (
                      <li
                        key={item.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        draggable
                        onDragStart={() =>
                          setDragged({ type: 'item', item, from: 'ban' })
                        }
                        onDragEnd={() => setDragged(null)}
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
            <div className="mt-2 text-end">
              <span className="badge bg-secondary">{banList.length} elementos</span>
            </div>
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
                onChange={e => setUnbanPath(e.target.value)}
                onBlur={e => checkPath(e.target.value, 'UNBAN')}
                onKeyDown={e => {
                  if (e.key === 'Enter')
                    checkPath(e.currentTarget.value, 'UNBAN')
                }}
                placeholder="Ruta UNBAN"
              />
              <input
                id="unban-folder"
                type="file"
                style={{ display: 'none' }}
                onChange={e => handleFolderChange(e, setUnbanPath, 'UNBAN')}
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
                    <li
                      className="list-group-item letter-header"
                      draggable
                      onDragStart={() =>
                        setDragged({ type: 'group', letter, from: 'unban' })
                      }
                      onDragEnd={() => setDragged(null)}
                    >
                      {letter}
                    </li>
                    {items.map(item => (
                      <li
                        key={item.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        draggable
                        onDragStart={() =>
                          setDragged({ type: 'item', item, from: 'unban' })
                        }
                        onDragEnd={() => setDragged(null)}
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
            <div className="mt-2 text-end">
              <span className="badge bg-secondary">{unbanList.length} elementos</span>
            </div>
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
