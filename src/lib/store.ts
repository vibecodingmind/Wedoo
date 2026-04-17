import { create } from 'zustand'

interface AppState {
  activeModule: string
  selectedWeddingId: string | null
  sidebarOpen: boolean
  unreadNotifications: number
  setActiveModule: (module: string) => void
  setSelectedWeddingId: (id: string) => void
  setSidebarOpen: (open: boolean) => void
  setUnreadNotifications: (count: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  selectedWeddingId: null,
  sidebarOpen: false,
  unreadNotifications: 0,
  setActiveModule: (module) => set({ activeModule: module, sidebarOpen: false }),
  setSelectedWeddingId: (id) => set({ selectedWeddingId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
}))
