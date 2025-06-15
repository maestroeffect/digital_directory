'use client'

// React Imports
import { useMemo } from 'react'

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

const CustomThemeProvider = props => {
  // Props
  const { children, direction, systemMode } = props

  // Hooks
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')

  // Vars
  const isServer = typeof window === 'undefined'
  const modeSetting = settings?.mode ?? systemMode ?? 'light'

  const currentMode = isServer ? modeSetting : modeSetting === 'system' ? (isDark ? 'dark' : 'light') : modeSetting

  // Safe defaults for settings
  const safeSettings = {
    skin: settings?.skin ?? 'default',
    primaryColor: settings?.primaryColor ?? '#1976d2',
    mode: settings?.mode ?? 'light'

    // add other keys here if needed
  }

  // Merge the primary color scheme override with the core theme
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
        <>
          <ModeChanger systemMode={systemMode} />
          <CssBaseline />
          {children}
        </>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

export default CustomThemeProvider
