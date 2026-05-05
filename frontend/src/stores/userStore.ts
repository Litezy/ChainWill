
import { create } from "zustand"
import { persist } from "zustand/middleware"

type User = {
  name?: string
  email?: string
  avatar?: string
}

type UserState = {
  user: User | null
  isLoading: boolean

  refreshKey: number

  setUser: (user: User) => void
  updateUser: (data: Partial<User>) => void

  triggerRefresh: () => void
  clearUser: () => void
  setLoading: (val: boolean) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      refreshKey: 0,

      setUser: (user) => set({ user }),

      updateUser: (data) =>
        set((state) => ({
          user: {
            ...state.user,
            ...data,
          },
        })),

      triggerRefresh: () =>
        set((state) => ({ refreshKey: state.refreshKey + 1 })),

      clearUser: () => set({ user: null }),

      setLoading: (val) => set({ isLoading: val }),
    }),
    {
      name: "user-storage",
    }
  )
)