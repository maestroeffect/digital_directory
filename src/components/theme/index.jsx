'use client'

// React Imports
import { useMemo, useState, useEffect } from 'react'

// MUI Imports
import { deepmerge } from '@mui/utils'
import { ThemeProvider, lighten, darken, createTheme } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import CssBaseline from '@mui/material/CssBaseline'

// Third-party Imports
import { useMedia } from 'react-use'
import stylisRTLPlugin from 'stylis-plugin-rtl'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Core Theme Imports
import defaultCoreTheme from '@core/theme'

const CustomThemeProvider = ({ children, direction, systemMode }) => {
  // Ensure the component is mounted before using media queries or window-related values
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Hooks (always called unconditionally)
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')

  // Fallback safe settings
  const safeSettings = {
    skin: settings?.skin ?? 'default',
    primaryColor: settings?.primaryColor ?? '#1976d2',
    mode: settings?.mode ?? 'light'
  }

  // Determine current mode
  const currentMode = useMemo(() => {
    if (safeSettings.mode === 'system') {
      return isDark ? 'dark' : 'light'
    }

    return safeSettings.mode
  }, [safeSettings.mode, isDark])

  // Create theme object
  const theme = useMemo(() => {
    const { primaryColor } = safeSettings

    const newTheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: primaryColor,
              light: lighten(primaryColor, 0.2),
              dark: darken(primaryColor, 0.1)
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: primaryColor,
              light: lighten(primaryColor, 0.2),
              dark: darken(primaryColor, 0.1)
            }
          }
        }
      },
      cssVariables: {
        colorSchemeSelector: 'data'
      }
    }

    const coreTheme = deepmerge(defaultCoreTheme(safeSettings, currentMode, direction), newTheme)

    return createTheme(coreTheme)
  }, [safeSettings.primaryColor, safeSettings.skin, currentMode, direction])

  // Still wait for client mount before rendering (but all hooks run unconditionally)
  if (!isClient) return null

  return (
    <AppRouterCacheProvider
      options={{
        prepend: true,
        ...(direction === 'rtl' && {
          key: 'rtl',
          stylisPlugins: [stylisRTLPlugin]
        })
      }}
    >
      <ThemeProvider
        theme={theme}
        defaultMode={systemMode}
        modeStorageKey={`${themeConfig.templateName.toLowerCase().split(' ').join('-')}-mui-template-mode`}
      >
        <ModeChanger systemMode={systemMode} />
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

export default CustomThemeProvider
