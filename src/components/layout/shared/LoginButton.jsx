'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { signIn, useSession } from 'next-auth/react'

import { useSettings } from '@/@core/hooks/useSettings'

const LoginButton = () => {
  const [isModalOpen, setModalOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const router = useRouter()
  const { data: session, update } = useSession() // ✅ Get session update function
  const handleSignUpClick = () => setIsSignUp(true)
  const handleLoginClick = () => setIsSignUp(false)

  const { settings } = useSettings()

  const handleLogin = async e => {
    e.preventDefault()
    const loginToast = toast.loading('Logging in...')

    // Trigger NextAuth.js signIn
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password
    })

    if (res?.error) {
      toast.update(loginToast, {
        render: 'Login failed. Please check your credentials.',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      })
    } else {
      toast.update(loginToast, {
        render: 'Logged in successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })

      // // ✅ Ensure router.refresh() runs after toast disappears
      setTimeout(async () => {
        await update()

        if (router.asPath) {
          router.replace(router.asPath) // Only run if asPath is available
        } else {
          window.location.reload() // Fallback in case router.asPath is undefined
        } // Refresh the session UI
      }, 3000) // Wait for toast to close before refreshing
    }
  }

  const handleSignUp = async e => {
    e.preventDefault()
    const signUpToast = toast.loading('Signing up...')

    // Perform sign-up logic here
    // Perform sign-up logic here
    const signUpData = await fetch('/api/auth/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        confirmPassword
      })
    })

    const data = await signUpData.json()

    if (!signUpData.ok) {
      if (data.errors) {
        Object.values(data.errors)
          .flat()
          .forEach((err, index) => toast.error(err, { toastId: `error-${email}-${name}-${index}` }))
      } else {
        toast.error(data.message || 'Sign-up failed')
      }

      toast.update(signUpToast, {
        render: data.message || 'Sign-up failed',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      })
    } else {
      toast.update(signUpToast, {
        render: 'Sign-up successful! Logging in...',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })

      // ✅ Sign in after successful sign-up
      const loginRes = await signIn('credentials', { redirect: false, email, password })

      if (loginRes?.error) {
        toast.error('Login failed after sign-up. Please try logging in manually.')
      } else {
        await update() // ✅ Refresh session after login

        setTimeout(() => {
          if (router.asPath) {
            router.replace(router.asPath) // Only run if asPath is available
          } else {
            window.location.reload() // Fallback in case router.asPath is undefined
          } // Refresh the session UI
        }, 1000) // Wait for toast to close before refreshing

        setModalOpen(false) // Close modal after successful login
      }
    }
  }

  return (
    <>
      <button
        className={`px-4 py-2 text-sm font-semibold ${settings.mode === 'dark' ? 'bg-white text-[#000] hover:text-white' : 'bg-black text-white  '}   hover:bg-orange-500 transition cursor-pointer`}
        onClick={() => setModalOpen(true)}
      >
        Login
      </button>

      {/* Modal with Framer Motion */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className='fixed inset-0 bg-gray-500 bg-opacity-50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setModalOpen(false)} // Close modal when backdrop is clicked
            />

            {/* Modal */}
            <motion.div
              className='fixed inset-0 flex justify-center items-center'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ zIndex: 500000 }} // Set a very high z-index
            >
              <div
                className={`${settings.mode === 'dark' ? 'border bg-dark border-orange-500 shadow-md' : 'bg-white'} bg-black p-8 rounded-lg w-96 relative`}
              >
                {/* Close Button */}
                <button
                  className={`absolute top-2 right-2 ${settings.mode === 'dark' ? 'bg-white text-black hover:bg-orange-500 transition hover:text-white' : 'bg-black text-white'} text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center cursor-pointer`}
                  onClick={() => setModalOpen(false)}
                >
                  &times;
                </button>

                {/* Toggle between Login and Sign Up */}
                <h2
                  className={`text-2xl ${settings.mode === 'dark' ? 'text-white' : ''} font-semibold mb-4 text-center`}
                >
                  {isSignUp ? 'Sign Up' : 'Login'}
                </h2>

                {/* Form */}
                <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                  {/* Name Field for Sign Up */}
                  {isSignUp && (
                    <input
                      type='text'
                      placeholder='Name'
                      className='block w-full mb-4 p-3 border border-gray-300 rounded text-lg'
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  )}

                  {/* Email Field */}
                  <input
                    type='email'
                    placeholder='Email'
                    className='block w-full mb-4 p-3 border border-gray-300 rounded text-lg'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />

                  {/* Password Field */}
                  <input
                    type='password'
                    placeholder='Password'
                    className='block w-full mb-4 p-3 border border-gray-300 rounded text-lg'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />

                  {/* Confirm Password for Sign Up */}
                  {isSignUp && (
                    <input
                      type='password'
                      placeholder='Confirm Password'
                      className='block w-full mb-4 p-3 border border-gray-300 rounded text-lg'
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  )}

                  {/* Submit Button */}
                  <button
                    type='submit'
                    className='w-full py-3 bg-black dark:border dark:border-orange-500 text-white rounded mb-4 cursor-pointer hover:bg-orange-500 transition'
                  >
                    {isSignUp ? 'Sign Up' : 'Login'}
                  </button>
                </form>

                {/* Toggle between Login and Sign Up */}
                <div className='text-center mb-4'>
                  {isSignUp ? (
                    <span className='text-sm'>
                      Already have an account?{' '}
                      <button
                        className={`${settings.mode === 'dark' ? 'text-orange-500 bg-black' : ''} font-semibold cursor-pointer`}
                        onClick={handleLoginClick}
                      >
                        Login
                      </button>
                    </span>
                  ) : (
                    <span className='text-sm'>
                      Dont have an account?{' '}
                      <button
                        className={`${settings.mode === 'dark' ? 'text-orange-500 bg-black' : ''} font-semibold cursor-pointer`}
                        onClick={handleSignUpClick}
                      >
                        Sign Up
                      </button>
                    </span>
                  )}
                </div>

                {/* Google Login Button */}
                <button
                  className='w-full py-3 bg-red-500 text-white rounded flex items-center justify-center cursor-pointer hover:bg-red-700 transition'
                  onClick={() => signIn('google')}
                >
                  <i className='ri-google-fill text-xl mr-2'></i> Sign in with Google
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default LoginButton
