'use client'
import { createContext, useMemo, useState, useEffect } from 'react'

// Config Imports
import themeConfig from '@configs/themeConfig'
import primaryColorConfig from '@configs/primaryColorConfig'

// Hook Imports
import { useObjectCookie } from '@core/hooks/useObjectCookie'

// Create context with default values
export const SettingsContext = createContext({
  settings: {
    mode: 'light',
    skin: 'default',
    semiDark: false,
    layout: 'vertical',
    navbarContentWidth: 'compact',
    contentWidth: 'compact',
    footerContentWidth: 'compact',
    primaryColor: primaryColorConfig?.[0]?.main || '#000000'
  },
  updateSettings: () => console.warn('No SettingsProvider found'),
  isSettingsChanged: false,
  resetSettings: () => console.warn('No SettingsProvider found'),
  updatePageSettings: () => console.warn('No SettingsProvider found')
})

// Settings Provider
export const SettingsProvider = ({ children, ...props }) => {
  // Initialize cookie hook at the top level
  const [settingsCookie, updateSettingsCookie] = useObjectCookie(
    themeConfig?.settingsCookieName || 'settings',
    JSON.stringify(props.settingsCookie) !== '{}' ? props.settingsCookie : null
  )

  // Safely get default values with fallbacks
  const getDefaultSettings = () => ({
    mode: props.mode || themeConfig?.mode || 'light',
    skin: props.skin || themeConfig?.skin || 'default',
    semiDark: props.semiDark ?? themeConfig?.semiDark ?? false,
    layout: props.layout || themeConfig?.layout || 'vertical',
    navbarContentWidth: props.navbarContentWidth || themeConfig?.navbar?.contentWidth || 'compact',
    contentWidth: props.contentWidth || themeConfig?.contentWidth || 'compact',
    footerContentWidth: props.footerContentWidth || themeConfig?.footer?.contentWidth || 'compact',
    primaryColor: props.primaryColor || primaryColorConfig?.[0]?.main || '#000000'
  })

  // Initialize state with defaults
  const [settingsState, setSettingsState] = useState(getDefaultSettings())
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize with cookie values once mounted
  useEffect(() => {
    if (settingsCookie) {
      setSettingsState(settingsCookie)
    }

    setIsInitialized(true)
  }, [settingsCookie])

  const updateSettings = (settings, options = { updateCookie: true }) => {
    setSettingsState(prev => {
      const newSettings = { ...prev, ...settings }

      if (options.updateCookie) {
        updateSettingsCookie(newSettings)
      }

      return newSettings
    })
  }

  // Calculate isSettingsChanged using useMemo at the top level
  const isSettingsChanged = useMemo(
    () => JSON.stringify(getDefaultSettings()) !== JSON.stringify(settingsState),
    [settingsState]
  )

  // Only render children after initialization
  if (!isInitialized) {
    return null // or a loading spinner
  }

  return (
    <SettingsContext.Provider
      value={{
        settings: settingsState,
        updateSettings,
        isSettingsChanged,
        resetSettings: () => updateSettings(getDefaultSettings()),
        updatePageSettings: settings => {
          updateSettings(settings, { updateCookie: false })

          return () => updateSettings(settingsState, { updateCookie: false })
        }
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
