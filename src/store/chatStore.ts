import { create } from 'zustand'

interface ChatState {
  open: boolean
  initialShowPhoto: boolean
  initialInput: string
  openChat: (opts?: { photo?: boolean; input?: string }) => void
  closeChat: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  open: false,
  initialShowPhoto: false,
  initialInput: '',

  openChat: (opts) => set({
    open: true,
    initialShowPhoto: opts?.photo ?? false,
    initialInput: opts?.input ?? '',
  }),

  closeChat: () => set({
    open: false,
    initialShowPhoto: false,
    initialInput: '',
  }),
}))
