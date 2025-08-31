import { Fragment, useEffect, useRef, useState } from 'react'
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

  const [showAlert, setShowAlert] = useState(false)

  const banInputRef = useRef<HTMLInputElement>(null)
  const unbanInputRef = useRef<HTMLInputElement>(null)

  const handleFolderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0] as File & { path?: string; webkitRelativePath?: string }
      const path = file.path ?? file.webkitRelativePath?.split('/')[0] ?? ''
      setter(path)
    }
  }

  const removeBan = (id: number) => {
    setBanList(prev => prev.filter(item => item.id !== id))
  }

  const removeUnban = (id: number) => {
    setUnbanList(prev => prev.filter(item => item.id !== id))
  }

  useEffect(() => {
    setShowAlert(true)
    const timer = setTimeout(() => setShowAlert(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const groupedBan = groupByLetter(banList)
  const groupedUnban = groupByLetter(unbanList)

  return (
    <>
      <div className="ban-container">
        <section className="ban-section">
          <div className="path-input">
            <FaFolder className="input-icon" />
            <input
              type="text"
              value={banPath}
              readOnly
              placeholder="Ruta BAN"
            />
            <input
              type="file"
              ref={banInputRef}
              style={{ display: 'none' }}
              onChange={e => handleFolderChange(e, setBanPath)}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore: permitir selección de carpetas
              webkitdirectory=""
            />
            <button
              type="button"
              aria-label="Seleccionar carpeta BAN"
              onClick={() => banInputRef.current?.click()}
            >
              <FaFolderOpen />
            </button>
          </div>
        <ul className="item-list">
          {Object.entries(groupedBan)
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
            readOnly
            placeholder="Ruta UNBAN"
          />
          <input
            type="file"
            ref={unbanInputRef}
            style={{ display: 'none' }}
            onChange={e => handleFolderChange(e, setUnbanPath)}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: permitir selección de carpetas
            webkitdirectory=""
          />
          <button
            type="button"
            aria-label="Seleccionar carpeta UNBAN"
            onClick={() => unbanInputRef.current?.click()}
          >
            <FaFolderOpen />
          </button>
        </div>
        <ul className="item-list">
          {Object.entries(groupedUnban)
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
    </>
  )
}

export default BanTab
