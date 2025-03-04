'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Button, Typography } from '@mui/material'

// Hook Imports
// import { useImageVariant } from '@core/hooks/useImageVariant'

const MobileBlocker = ({ children, mode }) => {
  const [isMobile, setIsMobile] = useState(false)

  // Vars
  const darkImg = '/images/pages/misc-mask-1-dark.png'
  const lightImg = '/images/pages/misc-mask-1-light.png'

  // Hooks
  // const miscBackground = useImageVariant(mode, lightImg, darkImg)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900) // Adjust breakpoint as needed
    }

    checkMobile() // Run on mount
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
        <div className='flex items-center flex-col text-center gap-10'>
          <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset]'>
            <Typography className='font-medium text-8xl' color='text.primary'>
              404
            </Typography>
            <Typography variant='h4'>Page Not Found ⚠️</Typography>
            <Typography>We couldn&#39;t find the page you are looking for.</Typography>
          </div>
          <img
            alt='error-illustration'
            src='/images/illustrations/characters/3.png'
            className='object-cover bs-[400px] md:bs-[450px] lg:bs-[500px]'
          />
          <Button href='/' component={Link} variant='contained'>
            Back to Home
          </Button>
        </div>
        <img src={''} className='absolute bottom-0 z-[-1] is-full max-md:hidden' />
        {/* //{' '}
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '18px' }}>
          // 🚧 Not yet available for mobile devices 🚧 //{' '}
        </div> */}
      </div>
    )
  }

  return children
}

export default MobileBlocker
