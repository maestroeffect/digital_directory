'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import { useSession } from 'next-auth/react'

import { useSettings } from '@core/hooks/useSettings'

const MyBookmarks = ({ activeLink }) => {
  const { settings, updateSettings } = useSettings()

  const router = useRouter()

  // if (!activeLink) return null // Hide if no active link
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return null // Or return null to show nothing while loading
  }

  const handleBookmarkClick = () => {
    router.push('/my-bookmarks')
  }

  return (
    <Tooltip title={`My Bookmarks`}>
      <IconButton className='text-textPrimary' onClick={handleBookmarkClick}>
        <i className={settings.mode === 'dark' ? 'ri-bookmark-2-fill' : 'ri-bookmark-2-fill'} />
      </IconButton>
    </Tooltip>
  )
}

export default MyBookmarks
