import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Assessment, SessionEvent, ChatMessage, RuleResult } from "../types"

// Patient slice
interface PatientState {
  currentAssessment: Partial<Assessment>
  updateAssessment: (updates: Partial<Assessment>) => void
  clearAssessment: () => void
  setRiskFactors: (factors: RiskFactors) => void
  resetToken: number
  triggerReset: () => void
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      currentAssessment: {},
      resetToken: 0,
      updateAssessment: (updates) =>
        set((state) => ({
          currentAssessment: { ...state.currentAssessment, ...updates },
        })),
      clearAssessment: () => set({ currentAssessment: {}, resetToken: Date.now() }),
      triggerReset: () => set((state) => ({ resetToken: Date.now() })),
      setRiskFactors: (factors) =>
        set((state) => ({ currentAssessment: { ...state.currentAssessment, risk: factors } as any })),
    }),
    {
      name: "patient-storage",
    },
  ),
)

// Session slice
interface SessionState {
  sessionId: string
  timeline: SessionEvent[]
  chatMessages: ChatMessage[]
  ruleResults: RuleResult[]
  addTimelineEvent: (event: Omit<SessionEvent, "id" | "timestamp">) => void
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void
  setRuleResults: (results: RuleResult[]) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionId: crypto.randomUUID(),
      timeline: [],
      chatMessages: [],
      ruleResults: [],
      addTimelineEvent: (event) =>
        set((state) => ({
          timeline: [...state.timeline, { ...event, id: crypto.randomUUID(), timestamp: new Date() }],
        })),
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, { ...message, id: crypto.randomUUID(), timestamp: new Date() }],
        })),
      setRuleResults: (results) => set({ ruleResults: results }),
      clearSession: () =>
        set({
          sessionId: crypto.randomUUID(),
          timeline: [],
          chatMessages: [],
          ruleResults: [],
        }),
    }),
    {
      name: "session-storage",
    },
  ),
)

// UI slice
interface UIState {
  theme: "light" | "dark"
  sidebarOpen: boolean
  activeDrawer: string | null
  toasts: Array<{ id: string; message: string; type: "success" | "error" | "warning" }>
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveDrawer: (drawer: string | null) => void
  addToast: (toast: Omit<UIState["toasts"][0], "id">) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>()((set) => ({
  theme: "light",
  sidebarOpen: false,
  activeDrawer: null,
  toasts: [],
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveDrawer: (drawer) => set({ activeDrawer: drawer }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
