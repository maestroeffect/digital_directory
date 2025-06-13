'use client'

import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@views/NotFound'

export default function NotFoundContent() {
  const direction = 'ltr'
  const mode = 'light' // fallback
  const systemMode = 'light' // fallback

  return (
    <Providers direction={direction} settingsCookie={{}} mode={mode} systemMode={systemMode}>
      <BlankLayout systemMode={systemMode}>
        <NotFound mode={mode} />
      </BlankLayout>
    </Providers>
  )
}
