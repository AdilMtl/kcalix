import { create } from 'zustand'
import { todayISO } from '../lib/dateUtils'

interface DateState {
  selectedDate: string
  goToPrev: () => void
  goToNext: () => void
  goToToday: () => void
  isToday: () => boolean
}

export const useDateStore = create<DateState>((set, get) => ({
  selectedDate: todayISO(),

  goToPrev: () => {
    const d = new Date(get().selectedDate + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    const tzOff = d.getTimezoneOffset()
    set({ selectedDate: new Date(d.getTime() - tzOff * 60000).toISOString().slice(0, 10) })
  },

  goToNext: () => {
    const cur = get().selectedDate
    const today = todayISO()
    // não avança além de hoje
    if (cur >= today) return
    const d = new Date(cur + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    const tzOff = d.getTimezoneOffset()
    set({ selectedDate: new Date(d.getTime() - tzOff * 60000).toISOString().slice(0, 10) })
  },

  goToToday: () => {
    set({ selectedDate: todayISO() })
  },

  isToday: () => get().selectedDate === todayISO(),
}))
