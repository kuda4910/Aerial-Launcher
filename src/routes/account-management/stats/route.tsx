import { createRoute } from '@tanstack/react-router'
import { UpdateIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'
import Masonry from 'react-responsive-masonry'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { AccountSelectors } from '../../../components/selectors/accounts'
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
  CardFooter,
  CardHeader,
} from '../../../components/ui/card'
import { GoToTop } from '../../../components/go-to-top'

import { AccountStatsData } from '../../../state/management/account-stats'

import { useAccountStatsData, useParseAccountInfo } from './-hooks'

import { parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/stats',
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
              <BreadcrumbPage>{t('options.stats')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['account-management'], {
    keyPrefix: 'stats',
  })

  const {
    accounts,
    data,
    handleGetStats,
    isDisabledForm,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    accountStatsUpdateAccounts,
    accountStatsUpdateTags,
  } = useAccountStatsData()

  return (
    <>
      <div className="flex flex-grow">
        <div className="flex items-center justify-center w-full">
          <div className="max-w-lg space-y-4 w-full">
            <Card className="w-full" id="selector-card">
              <CardHeader className="border-b">
                <CardDescription>{t('description')}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6">
                <AccountSelectors
                  accounts={{ options: accounts, value: parsedSelectedAccounts }}
                  tags={{ options: tags, value: parsedSelectedTags }}
                  onUpdateAccounts={accountStatsUpdateAccounts}
                  onUpdateTags={accountStatsUpdateTags}
                />
              </CardContent>
              <CardFooter className="space-x-6">
                <Button
                  className="w-full"
                  onClick={handleGetStats}
                  disabled={isDisabledForm}
                >
                  {isLoading ? <UpdateIcon className="animate-spin" /> : t('form.submit-button')}
                </Button>
              </CardFooter>
            </Card>

            {data.length > 0 && (
              <div className="max-w-lg pt-1 w-full">
                <div className="leading-none mb-5 text-center uppercase">
                  {t('results.title', { total: data.length })}
                </div>

                <Masonry columnsCount={2} gutter="0.75rem">
                  {data.map((item) => (
                    <AccountInfo data={item} key={item.accountId} />
                  ))}
                </Masonry>
              </div>
            )}
          </div>
        </div>
      </div>

      <GoToTop containerId="selector-card" />
    </>
  )
}

function AccountInfo({ data }: { data: AccountStatsData }) {
  const { t } = useTranslation(['account-management'], {
    keyPrefix: 'stats',
  })
  const { account } = useParseAccountInfo({ data })

  return (
    <div className="border rounded w-full" key={data.accountId}>
      <header className="bg-muted-foreground/5 px-2 py-2">
        <div className="max-w-36 mx-auto text-center text-sm truncate">
          {parseCustomDisplayName(account)}
        </div>
      </header>
      <div className="px-1.5 py-1.5 text-muted-foreground text-sm">
        <ul className="list-disc pl-6">
          <li className="leading-5">
            {t('level')}: <span className="font-bold">{data.level}</span>
          </li>
          <li className="leading-5">
            {t('missions')}: <span className="font-bold">{data.missionsCompleted}</span>
          </li>
          <li className="leading-5">
            {t('rewards')}: <span className="font-bold">{data.rewardsClaimed}</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
