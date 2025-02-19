import { useSettings } from '@/@core/hooks/useSettings'

const SignUpButton = () => {
  const { settings } = useSettings()

  return (
    <button
      className={`px-4 py-2 text-sm font-semibold ${settings.mode === 'dark' ? 'text-white bg-[#282A42]' : 'text-gray-600'} border border-orange-600 cursor-pointer transition`}
      onClick={() => {
        // Handle signup logic here
        console.log('SignUp button clicked')
      }}
    >
      SignUp
    </button>
  )
}

export default SignUpButton
