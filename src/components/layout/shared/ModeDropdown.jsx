'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const ModeToggle = () => {
  // Hooks
  const { settings, updateSettings } = useSettings()

  // Function to toggle between light and dark mode
  const toggleMode = () => {
    const newMode = settings.mode === 'dark' ? 'light' : 'dark'

    updateSettings({ mode: newMode })
  }

  // Determine icon based on mode
  const getModeIcon = () => {
    return settings.mode === 'dark' ? 'ri-sun-line' : 'ri-moon-clear-line'
  }

  return (
    <Tooltip title={`Switch to ${settings.mode === 'dark' ? 'Light' : 'Dark'} Mode`}>
      <IconButton onClick={toggleMode} className='text-textPrimary'>
        <i className={getModeIcon()} />
      </IconButton>
    </Tooltip>
  )
}

export default ModeToggle
