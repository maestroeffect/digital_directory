// app/not-found.jsx
'use client'

import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@views/NotFound'

export default function NotFoundPage() {
  const direction = 'ltr'
  const mode = 'light' // fallback value or derive on client
  const systemMode = 'light' // fallback value

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>
        <NotFound mode={mode} />
      </BlankLayout>
    </Providers>
  )
}
