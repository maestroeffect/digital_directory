import { Suspense } from 'react'

import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFoundClient from './not-found-client'

import { getServerMode, getSystemMode } from '@core/utils/serverHelpers'

const NotFoundPage = async () => {
  const direction = 'ltr'
  const mode = await getServerMode()
  const systemMode = await getSystemMode()

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>
        <Suspense fallback={<div>Loading 404...</div>}>
          <NotFoundClient mode={mode} />
        </Suspense>
      </BlankLayout>
    </Providers>
  )
}

export default NotFoundPage
