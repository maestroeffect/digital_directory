'use client'

import { useState } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import { useSettings } from '@core/hooks/useSettings'

const ViewOriginal = ({ activeLink }) => {
  const { settings, updateSettings } = useSettings()

  if (!activeLink) return null // Hide if no active link

  return (
    <Tooltip title={`View Source`}>
      <a href={activeLink} target='_blank' rel='noopener noreferrer'>
        <IconButton className='text-textPrimary'>
          <i className={settings.mode === 'dark' ? 'ri-external-link-line' : 'ri-external-link-line'} />
        </IconButton>
      </a>
    </Tooltip>
  )
}

export default ViewOriginal
