import { useRef, useState } from 'react'

interface Item {
  id: number
  name: string
}

const BanTab = () => {
  const [banPath, setBanPath] = useState('')
  const [unbanPath, setUnbanPath] = useState('')
  const [banList, setBanList] = useState<Item[]>([
    { id: 1, name: 'Baneo de prueba 1' },
    { id: 2, name: 'Baneo de prueba 2' },
  ])
  const [unbanList, setUnbanList] = useState<Item[]>([
    { id: 3, name: 'Unban de prueba 1' },
  ])

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

  return (
    <div>
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            value={banPath}
            readOnly
            placeholder="Ruta BAN"
            style={{ flex: 1 }}
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
          <button type="button" onClick={() => banInputRef.current?.click()}>
            ...
          </button>
        </div>
        <ul>
          {banList.map(item => (
            <li key={item.id}>
              {item.name}{' '}
              <button type="button" onClick={() => removeBan(item.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            value={unbanPath}
            readOnly
            placeholder="Ruta UNBAN"
            style={{ flex: 1 }}
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
          <button type="button" onClick={() => unbanInputRef.current?.click()}>
            ...
          </button>
        </div>
        <ul>
          {unbanList.map(item => (
            <li key={item.id}>
              {item.name}{' '}
              <button type="button" onClick={() => removeUnban(item.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default BanTab
