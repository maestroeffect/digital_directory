// CustomScrollbar.jsx (Client Component)
'use client'

import React from 'react'

const CustomScrollbar = () => {
  return (
    <div>
      <style jsx global>{`
        .custom-scrollbar {
          overflow-y: hidden !important;
        }
        .custom-scrollbar > .ps__rail-y {
          display: none !important;
        }
        .custom-scrollbar > .ps__thumb-y {
          display: none !important;
        }
      `}</style>
    </div>
  )
}

export default CustomScrollbar
