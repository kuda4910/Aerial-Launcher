import { useTranslation } from 'react-i18next'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import { AccountStatsData } from '../../../state/management/account-stats'

import {
  useGetAccountStatsActions,
  useGetAccountStatsData,
} from '../../../hooks/management/account-stats'
import { useGetAccounts } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'
import { getQueryProfile } from '../../../services/endpoints/mcp'

export function useAccountStatsData() {
  const { t } = useTranslation(['general'])

  const { accountsArray, accountList } = useGetAccounts()
  const { data, isLoading, selectedAccounts, selectedTags } =
    useGetAccountStatsData()
  const {
    accountStatsUpdateAccounts,
    accountStatsUpdateData,
    accountStatsUpdateLoading,
    accountStatsUpdateTags,
  } = useGetAccountStatsActions()
  const {
    accounts,
    areThereAccounts,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    getAccounts,
  } = useAccountSelectorData({
    selectedAccounts,
    selectedTags,
  })

  const parsedData = accountsArray
    .filter((account) => data[account.accountId] !== undefined)
    .map((account) => data[account.accountId])

  const isDisabledForm = isSelectedEmpty || isLoading || !areThereAccounts

  const handleGetStats = async () => {
    if (isDisabledForm) {
      return
    }

    const selected = getAccounts()

    if (selected.length <= 0) {
      toast(t('form.accounts.no-linked'))

      return
    }

    accountStatsUpdateLoading(true)
    accountStatsUpdateData({}, true)

    const result: Record<string, AccountStatsData> = {}

    await Promise.all(
      selected.map(async (accountId) => {
        const account = accountList[accountId]
        if (!account?.accessToken) {
          return
        }

        try {
          const response = await getQueryProfile({
            accessToken: account.accessToken,
            accountId,
          })
          const attrs =
            response.data.profileChanges?.[0]?.profile.stats.attributes ?? {}
          const gameplay = (attrs.gameplay_stats ?? []) as Array<{
            statName: string
            statValue: number
          }>
          const missionsCompleted =
            gameplay.find((s) => s.statName === 'zonescompleted')?.statValue ?? 0
          const level = attrs.level ?? 0
          const rewardsClaimed =
            attrs.rewards_claimed_post_max_level ?? 0

          result[accountId] = {
            accountId,
            level,
            missionsCompleted,
            rewardsClaimed,
          }
        } catch (error) {
          //
        }
      })
    )

    accountStatsUpdateData(result)
    accountStatsUpdateLoading(false)
  }

  return {
    accounts,
    areThereAccounts,
    isDisabledForm,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    data: parsedData,

    handleGetStats,
    accountStatsUpdateAccounts,
    accountStatsUpdateTags,
  }
}

export function useParseAccountInfo({
  data,
}: {
  data: AccountStatsData
}) {
  const { accountList } = useGetAccounts()

  const account = accountList[data.accountId]

  return {
    account,
  }
}
