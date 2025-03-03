import React, { useState } from 'react'

import { Divider } from '@mui/material'

import TopBar from '@/components/Topbar'

const FeedLayout = ({ children, activeLink }) => {
  // Ensure children is always an array for easier handling
  const childrenArray = Array.isArray(children) ? children : [children]

  const leftContent = childrenArray[0] || <div>No Left Content</div>
  const rightContent = childrenArray[1] || <div>No Right Content</div>

  // State for active tab, defaulting to 'reader'
  const [activeTab, setActiveTab] = useState('reader')
  const [fontSize, setFontSize] = useState(15)

  // console.log(activeLink)

  return (
    <div>
      {/* <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fontSize={fontSize}
        setFontSize={setFontSize}
        activeLink={activeLink}
      /> */}
      <div className='p-1 flex gap-3 flex-col md:flex-row'>
        {/* Left Side */}
        <div className='w-full lg:w-1/3'>
          {leftContent} {/* Left content goes here */}
        </div>
        <Divider orientation='vertical' flexItem />
        {/* Right Side */}
        <div className='w-full lg:w-2/3'>
          {React.cloneElement(rightContent, { activeTab, fontSize })}
          {/* {rightContent} Right content goes here */}
        </div>
      </div>
    </div>
  )
}

export default FeedLayout
