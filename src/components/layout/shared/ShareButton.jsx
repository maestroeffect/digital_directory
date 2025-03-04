'use client'

import { useState } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import { useSettings } from '@core/hooks/useSettings'

const FontIconToggle = () => {
  const { settings, updateSettings } = useSettings()

  const toggleMode = () => {
    updateSettings({ mode: settings.mode === 'dark' ? 'light' : 'dark' })
  }

  return (
    <Tooltip title={`Share News`}>
      <IconButton onClick={toggleMode} className='text-textPrimary'>
        <i className={settings.mode === 'dark' ? 'ri-share-line' : 'ri-share-line'} />
      </IconButton>
    </Tooltip>
  )
}

export default FontIconToggle
