import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'

import { useGetSelectedAccount } from '../../../hooks/accounts'

import { parseCustomDisplayName } from '../../../lib/utils'
import { toast } from '../../../lib/notifications'
import { findUserByDisplayName } from '../../../services/endpoints/lookup'
import { getQueryPublicProfile } from '../../../services/endpoints/mcp'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/public-profile',
  component: () => {
    const { t } = useTranslation(['sidebar'], {
      keyPrefix: 'account-management',
    })

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('options.public-profile')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['account-management', 'general'])
  const { selected } = useGetSelectedAccount()

  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<null | {
    displayName: string
    accountId: string
    homebaseName: string
    commanderLevel: number
    zonesCompleted: number
    collectionBookLevel: number
    items: number
    lastUpdated: string
  }>(null)

  const isDisabled =
    isSubmitting || !selected?.accessToken || displayName.trim().length <= 0

  const accountName = useMemo(
    () =>
      selected
        ? parseCustomDisplayName(selected)
        : t('unknown', { ns: 'general' }),
    [selected, t]
  )

  const handleSubmit = async () => {
    if (isDisabled || !selected?.accessToken) {
      return
    }

    setIsSubmitting(true)

    try {
      const lookup = await findUserByDisplayName({
        accessToken: selected.accessToken,
        displayName: displayName.trim(),
      })

      const profile = await getQueryPublicProfile({
        accessToken: selected.accessToken,
        accountId: lookup.data.id,
      })

      const currentProfile = profile.data.profileChanges?.[0]?.profile
      const attrs = currentProfile?.stats?.attributes
      const homebaseName = (attrs as { homebase_name?: string } | undefined)?.homebase_name
      const gameplay = attrs?.gameplay_stats ?? []
      const zonesCompleted =
        gameplay.find((item) => item.statName === 'zonescompleted')
          ?.statValue ?? 0

      setData({
        displayName: lookup.data.displayName,
        accountId: lookup.data.id,
        homebaseName: homebaseName ?? '-',
        commanderLevel: attrs?.level ?? 0,
        zonesCompleted,
        collectionBookLevel: attrs?.collection_book?.maxBookXpLevelAchieved ?? 0,
        items: Object.keys(currentProfile?.items ?? {}).length,
        lastUpdated: currentProfile?.updated ?? '-',
      })
    } catch (error) {
      setData(null)
      toast.error(t('public-profile.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <div className="max-w-lg space-y-4 w-full">
          <Card>
            <CardHeader className="border-b">
              <CardDescription>{t('public-profile.description')}</CardDescription>
              <CardDescription>
                {t('public-profile.account', { name: accountName })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <Label htmlFor="public-profile-display-name">
                {t('public-profile.form.label')}
              </Label>
              <Input
                id="public-profile-display-name"
                placeholder={t('public-profile.form.placeholder')}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />

              <Button
                className="w-full"
                disabled={isDisabled}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  t('public-profile.form.submit-button')
                )}
              </Button>
            </CardContent>
          </Card>

          {data && (
            <Card>
              <CardHeader className="border-b">
                <CardDescription>{t('public-profile.results.title')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    {t('public-profile.results.display-name')}:{' '}
                    <span className="font-bold">{data.displayName}</span>
                  </li>
                  <li>
                    {t('public-profile.results.account-id')}:{' '}
                    <span className="font-bold break-all">{data.accountId}</span>
                  </li>
                  <li>
                    {t('public-profile.results.homebase-name')}:{' '}
                    <span className="font-bold">{data.homebaseName}</span>
                  </li>
                  <li>
                    {t('public-profile.results.commander-level')}:{' '}
                    <span className="font-bold">{data.commanderLevel}</span>
                  </li>
                  <li>
                    {t('public-profile.results.collection-book-level')}:{' '}
                    <span className="font-bold">{data.collectionBookLevel}</span>
                  </li>
                  <li>
                    {t('public-profile.results.zones-completed')}:{' '}
                    <span className="font-bold">{data.zonesCompleted}</span>
                  </li>
                  <li>
                    {t('public-profile.results.total-items')}:{' '}
                    <span className="font-bold">{data.items}</span>
                  </li>
                  <li>
                    {t('public-profile.results.last-updated')}:{' '}
                    <span className="font-bold">{data.lastUpdated}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
