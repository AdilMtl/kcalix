import { create } from 'zustand'

interface InstallState {
  // Sinaliza que o onboarding acabou de terminar — InstallPrompt observa isso
  wizardJustFinished: boolean
  triggerInstallPrompt: () => void
  clearTrigger: () => void
}

export const useInstallStore = create<InstallState>((set) => ({
  wizardJustFinished: false,
  triggerInstallPrompt: () => set({ wizardJustFinished: true }),
  clearTrigger: () => set({ wizardJustFinished: false }),
}))
