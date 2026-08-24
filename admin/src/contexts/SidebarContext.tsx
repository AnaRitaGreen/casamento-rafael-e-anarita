import {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react'

interface SidebarProviderProps {
  children: ReactNode
}

interface SidebarContextData {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  toggle: () => void
}

const SidebarContext = createContext({} as SidebarContextData)

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  function onOpen() {
    setIsOpen(true)
  }

  function onClose() {
    setIsOpen(false)
  }

  function toggle() {
    setIsOpen((prev) => !prev)
  }

  return (
    <SidebarContext.Provider value={{ isOpen, onOpen, onClose, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)