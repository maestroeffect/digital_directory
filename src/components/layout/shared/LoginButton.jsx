// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const LoginButton = () => {
  const { settings } = useSettings()

  return (
    <button
      className='px-4 py-2 text-sm font-semibold text-white bg-black hover:bg-[#f73] transition cursor-pointer'
      onClick={() => {
        // Handle login logic here
        console.log('Login button clicked')
      }}
    >
      Login
    </button>
  )
}

export default LoginButton
