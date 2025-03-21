'use client'

import { useState } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import { useSettings } from '@core/hooks/useSettings'

const ShareButton = ({ activeLink }) => {
  const { settings, updateSettings } = useSettings()

  const shareNews = () => {
    if (!activeLink) return

    navigator.share
      ? navigator.share({ title: 'Check this out', url: activeLink })
      : alert('Sharing not supported on this device')
  }

  if (!activeLink) return null // Hide if no active link

  return (
    <Tooltip title={`Share News`}>
      <IconButton className='text-textPrimary' onClick={shareNews}>
        <i className={settings.mode === 'dark' ? 'ri-share-line' : 'ri-share-line'} />
      </IconButton>
    </Tooltip>
  )
}

export default ShareButton
