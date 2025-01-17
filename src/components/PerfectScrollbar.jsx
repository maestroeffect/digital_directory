// components/PerfectScrollbarWrapper.jsx
'use client'

import React from 'react'

import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-perfect-scrollbar/dist/css/styles.css'

const PerfectScrollbarWrapper = ({ children, onScroll }) => {
  return (
    <PerfectScrollbar className='h-[calc(100vh-120px)] custom-scrollbar' onScroll={onScroll}>
      {children}
    </PerfectScrollbar>
  )
}

export default PerfectScrollbarWrapper
