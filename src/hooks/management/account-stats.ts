import { useShallow } from 'zustand/react/shallow'

import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import {
  useAccountStatsStore,
  AccountStatsState,
} from '../../state/management/account-stats'

export function useGetAccountStatsData() {
  const { accounts, data, isLoading, tags } = useAccountStatsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      isLoading: state.isLoading,
      data: state.data,
      tags: state.tags,
    }))
  )

  return {
    isLoading,
    data,
    selectedAccounts: accounts,
    selectedTags: tags,
  }
}

export function useGetAccountStatsActions() {
  const { updateAccounts, updateData, updateLoading, updateTags } =
    useAccountStatsStore(
      useShallow((state) => ({
        updateAccounts: state.updateAccounts,
        updateData: state.updateData,
        updateLoading: state.updateLoading,
        updateTags: state.updateTags,
      }))
    )

  const rawAccountStatsUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const accountStatsUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawAccountStatsUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const accountStatsUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  const accountStatsUpdateData = (
    value: AccountStatsState['data'],
    reset?: boolean
  ) => {
    updateData(value, reset)
  }

  const accountStatsUpdateLoading = (value: boolean) => {
    updateLoading(value)
  }

  return {
    rawAccountStatsUpdateAccounts,
    rawAccountStatsUpdateTags,
    accountStatsUpdateAccounts,
    accountStatsUpdateTags,
    accountStatsUpdateData,
    accountStatsUpdateLoading,
  }
}
