import qubiclogo from '../../assets/img/logo.gif'
import { useSettings } from '@core/hooks/useSettings'
import qubicwebgifwhite from '@assets/img/logo_white.gif'

const Logo = props => {
  const { settings } = useSettings()

  return (
    <img
      src={settings.mode === 'dark' ? qubicwebgifwhite.src : qubiclogo.src} // Use the `src` property of the imported object
      style={{
        width: '55px',
        height: '55px',
        objectFit: 'contain',
        flexShrink: 0 // Prevent shrinking in flex containers
      }}
      alt='Logo'
      {...props}
    />
  )
}

export default Logo
