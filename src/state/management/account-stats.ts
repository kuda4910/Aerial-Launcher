import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export type AccountStatsData = {
  accountId: string
  level: number
  missionsCompleted: number
  rewardsClaimed: number
}

export type AccountStatsState = {
  accounts: Array<string>
  isLoading: boolean
  data: Record<string, AccountStatsData>
  tags: Array<string>

  updateAccounts: (accountIds: Array<string>) => void
  updateData: (
    value: Record<string, AccountStatsData>,
    reset?: boolean
  ) => void
  updateLoading: (state: boolean) => void
  updateTags: (tags: Array<string>) => void
}

export const useAccountStatsStore = create<AccountStatsState>()(
  immer((set) => ({
    accounts: [],
    isLoading: false,
    data: {},
    tags: [],

    updateAccounts: (accountIds) =>
      set({
        accounts: [...new Set(accountIds)],
      }),
    updateData: (value, reset) => {
      if (reset === true) {
        set({ data: {} })
      } else {
        set((state) => {
          Object.values(value).forEach((item) => {
            state.data[item.accountId] = item
          })
        })
      }
    },
    updateLoading: (state) => set({ isLoading: state }),
    updateTags: (tags) =>
      set({
        tags: [...new Set(tags)],
      }),
  }))
)
