// app/not-found.jsx
'use client'

import { Suspense } from 'react'

import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@views/NotFound'

export default function NotFoundPage() {
  const direction = 'ltr'
  const mode = 'light' // fallback
  const systemMode = 'light' // fallback

  return (
    <Providers direction={direction} settingsCookie={{}} mode={mode} systemMode={systemMode}>
      <BlankLayout systemMode={systemMode}>
        <Suspense fallback={<div>Loading...</div>}>
          <NotFound mode={mode} />
        </Suspense>
      </BlankLayout>
    </Providers>
  )
}
