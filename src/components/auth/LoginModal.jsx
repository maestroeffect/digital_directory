'use client'

import { useState, useEffect } from 'react'

import { signIn, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AuthModal = ({ isOpen, onClose }) => {
  const { data: session } = useSession()
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setIsLogin(true)
    }
  }, [isOpen])

  const handleAuth = async () => {
    setLoading(true)

    try {
      if (isLogin) {
        // console.log('Toast should have been triggered')
        const response = await signIn('credentials', {
          redirect: false,
          email,
          password
        })

        // toast.success('Login successful!')
        console.log('Login Response:', response) // Log the full response

        if (response.error) {
          throw new Error(response.error)
        } else if (response.ok && response.status === 200) {
          toast.success('Login successful!')

          setTimeout(() => {
            window.location.href = response.url // Handle redirect after toast
          }, 20000) // Increase delay to 2 seconds to give toast time to show
        }

        // toast.success('Login successful!')
        setTimeout(onClose, 3000)
      } else {
        const res = await fetch('/api/auth/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            confirmPassword
          })
        })

        const data = await res.json()

        if (!res.ok) {
          if (data.errors) {
            Object.values(data.errors)
              .flat()
              .forEach((err, index) => toast.error(err, { toastId: `error-${email}-${name}-${index}` }))
          } else {
            toast.error(data.message || 'Sign-up failed')
          }

          throw new Error(data.message || 'Sign-up failed')
        }

        toast.success('Sign-up successful! Logging in...')

        await signIn('credentials', { redirect: false, email, password })
        setTimeout(onClose, 1500)
      }
    } catch (error) {
      // Customize the error message
      const errorMessage =
        error.message === 'CredentialsSignin'
          ? 'Invalid email or password. Please try again.'
          : error.message || 'Something went wrong. Please try again.'

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <ToastContainer position='top-right' autoClose={3000} />

      {isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <motion.div
            key={`auth-modal-${isOpen}`} // Dynamic key
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className='relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg w-[90%] max-w-md'
          >
            <button className='absolute top-4 right-4 cursor-pointer' onClick={onClose}>
              <X size={24} className='text-gray-500 hover:text-red-500' />
            </button>
            <h2 className='text-xl font-bold text-white text-center mb-4'>{isLogin ? 'Login' : 'Sign Up'}</h2>

            {!isLogin && (
              <input
                type='text'
                placeholder='Full Name'
                className='w-full p-3 border rounded-lg mb-3'
                value={name}
                onChange={e => setName(e.target.value)}
              />
            )}

            <input
              type='email'
              placeholder='Email Address'
              className='w-full p-3 border rounded-lg mb-3'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type='password'
              placeholder='Password'
              className='w-full p-3 border rounded-lg mb-3'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {!isLogin && (
              <input
                type='password'
                placeholder='Confirm Password'
                className='w-full p-3 border rounded-lg mb-4'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            )}

            <button
              className='w-full py-3 bg-orange-600 cursor-pointer text-white rounded-lg hover:bg-orange-800'
              onClick={handleAuth}
              disabled={loading}
            >
              {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : isLogin ? 'Login' : 'Sign Up'}
            </button>

            <div className='flex items-center my-4'>
              <hr className='flex-grow border-[#ffff]' />
              <span className='mx-3 text-gray-500'>OR</span>
              <hr className='flex-grow border-[#fff]' />
            </div>

            {/* --- Sign in with Google --- */}
            <div className='flex items-center justify-center mt-4'>
              <button
                onClick={() => signIn('google')}
                className='flex items-center gap-2 cursor-pointer border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition'
              >
                <i className='ri-google-fill text-lg'></i> Sign in with Google
              </button>
            </div>

            <p className='text-center text-gray-500 mt-3'>
              {isLogin ? 'New here?' : 'Already have an account?'}
              <span
                className='text-orange-500 cursor-pointer ml-1 hover:underline'
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign up' : 'Login'}
              </span>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AuthModal
