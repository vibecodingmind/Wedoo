import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: string
}

interface Wedding {
  id: string
  name: string
  date: string
  budget: number
  status: string
}

interface AppState {
  activeModule: string
  selectedWeddingId: string | null
  sidebarOpen: boolean
  unreadNotifications: number
  user: User | null
  weddings: Wedding[]
  setActiveModule: (module: string) => void
  setSelectedWeddingId: (id: string) => void
  setSidebarOpen: (open: boolean) => void
  setUnreadNotifications: (count: number) => void
  setUser: (user: User | null) => void
  clearUser: () => void
  setWeddings: (weddings: Wedding[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  selectedWeddingId: null,
  sidebarOpen: false,
  unreadNotifications: 0,
  user: null,
  weddings: [],
  setActiveModule: (module) => set({ activeModule: module, sidebarOpen: false }),
  setSelectedWeddingId: (id) => set({ selectedWeddingId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setWeddings: (weddings) => set({ weddings }),
}))
