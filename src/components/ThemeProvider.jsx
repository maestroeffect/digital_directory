'use client'

import { useEffect } from 'react'

import { useSettings } from '@/@core/hooks/useSettings'

const ThemeProvider = ({ children }) => {
  const { settings } = useSettings()
  const isDarkMode = settings.mode === 'dark'

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [isDarkMode])

  return <>{children}</>
}

export default ThemeProvider
