'use client'

import { useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import { useSession } from 'next-auth/react'

import { useSettings } from '@core/hooks/useSettings'

const MyBookmarks = ({ activeLink }) => {
  const { settings, updateSettings } = useSettings()

  const router = useRouter()
  const pathname = usePathname() // Get current route

  // if (!activeLink) return null // Hide if no active link
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return null // Or return null to show nothing while loading
  }

  const handleBookmarkClick = () => {
    router.push('/my-bookmarks')
  }

  return (
    <Tooltip title='My Bookmarks'>
      <IconButton onClick={handleBookmarkClick}>
        <i
          className={`ri-bookmark-2-fill transition-colors duration-300 ${
            pathname === '/my-bookmarks' ? 'text-orange-500' : settings.mode === 'dark' ? 'text-white' : 'text-black'
          }`}
          style={{ fontSize: '24px' }} // Ensure the icon is visible
        />
      </IconButton>
    </Tooltip>
  )
}

export default MyBookmarks
