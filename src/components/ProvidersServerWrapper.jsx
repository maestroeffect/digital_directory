// app/components/ProvidersServerWrapper.jsx
import Providers from './Providers'
import { getMode, getSettingsFromCookie, getSystemMode } from '@/app/utils/serverHelpers.js'

export default async function ProvidersServerWrapper({ children, direction }) {
  const mode = await getMode()
  const settingsCookie = await getSettingsFromCookie()
  const systemMode = await getSystemMode()

  return (
    <Providers direction={direction} settingsCookie={settingsCookie} mode={mode} systemMode={systemMode}>
      {children}
    </Providers>
  )
}
