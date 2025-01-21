import qubiclogo from '../../assets/img/logo.png'

const Logo = props => {
  return (
    <img
      src={qubiclogo.src} // Use the `src` property of the imported object
      style={{
        width: '40px',
        height: '40px',
        objectFit: 'contain',
        flexShrink: 0 // Prevent shrinking in flex containers
      }}
      alt='Logo'
      {...props}
    />
  )
}

export default Logo
