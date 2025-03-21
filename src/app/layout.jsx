'use client'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import { SessionProvider } from 'next-auth/react'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

import { ToastContainer } from 'react-toastify'

import MobileBlocker from '@/components/MobileBlocker'
import { NewsProvider } from '@/context/NewsContext'
import Provider from '@/components/Provider'

const RootLayout = ({ children }) => {
  return (
    <html id='__next' lang='en' dir='ltr' suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <Provider>
          <InitColorSchemeScript attribute='data' defaultMode='light' />
          <SessionProvider>
            <MobileBlocker>
              <NewsProvider>
                {children}
                <ToastContainer position='top-right' autoClose={5000} />
              </NewsProvider>
            </MobileBlocker>
          </SessionProvider>
        </Provider>
      </body>
    </html>
  )
}

export default RootLayout
