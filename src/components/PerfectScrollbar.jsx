// components/PerfectScrollbarWrapper.jsx
'use client'

import React from 'react'

import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-perfect-scrollbar/dist/css/styles.css'

const PerfectScrollbarWrapper = ({ children, onScroll }) => {
  return (
    <PerfectScrollbar
      className='custom-scrollbar'
      onScroll={onScroll}
      style={{ height: 'calc(100vh - 90px)' }} // Fallback for unsupported Tailwind classes
    >
      <div className='h-[calc(100vh-120px)] lg:h-[calc(100vh-100px)] xl:h-[calc(100vh-80px)] 2xl:h-[calc(100vh-60px)]'>
        {children}
      </div>
    </PerfectScrollbar>
  )
}

export default PerfectScrollbarWrapper
