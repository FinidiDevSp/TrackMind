/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { defaultMainConfig, type MainConfig } from './main.config'

interface MainConfigContextValue {
  config: MainConfig
  setConfig: (config: MainConfig) => void
}

const MainConfigContext = createContext<MainConfigContextValue | undefined>(
  undefined,
)

export const MainConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfigState] = useState<MainConfig>(defaultMainConfig)

  useEffect(() => {
    const stored = localStorage.getItem('main.config')
    if (stored) {
      try {
        setConfigState({ ...defaultMainConfig, ...JSON.parse(stored) })
      } catch {
        setConfigState(defaultMainConfig)
      }
    }
  }, [])

  const setConfig = (cfg: MainConfig) => {
    setConfigState(cfg)
    localStorage.setItem('main.config', JSON.stringify(cfg))
  }

  return (
    <MainConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </MainConfigContext.Provider>
  )
}

export const useMainConfig = () => {
  const ctx = useContext(MainConfigContext)
  if (!ctx) {
    throw new Error('useMainConfig must be used within a MainConfigProvider')
  }
  return ctx
}
