'use client'

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import { SessionProvider } from 'next-auth/react'
import 'react-perfect-scrollbar/dist/css/styles.css'
import '@/app/globals.css'
import '@assets/iconify-icons/generated-icons.css'
import { ToastContainer } from 'react-toastify'

import MobileBlocker from '@/components/MobileBlocker'
import { NewsProvider } from '@/context/NewsContext'
import Provider from '@/components/Provider'

const ClientLayout = ({ children }) => {
  return (
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
  )
}

export default ClientLayout
