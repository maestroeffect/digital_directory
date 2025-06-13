// app/not-found.jsx
'use client'

import { Suspense } from 'react'

import dynamic from 'next/dynamic'

// Dynamically import the actual view
const NotFoundContent = dynamic(() => import('./not-found-client.jsx'), {
  ssr: false
})

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  )
}
