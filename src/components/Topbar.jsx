'use client'

import { useState, useRef, useEffect } from 'react'

import {
  Chat,
  Star,
  FontDownload,
  Share,
  Visibility,
  Email,
  Twitter,
  Facebook,
  OpenInNew,
  X
} from '@mui/icons-material'
import { Tooltip } from '@mui/material'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const TopBar = ({ setActiveTab, activeTab, fontSize, setFontSize, activeLink }) => {
  const [showFontPopup, setShowFontPopup] = useState(false) // Track font popup visibility
  const [showSharePopup, setShowSharePopup] = useState(false) // Track share popup visibility
  const sharePopupRef = useRef(null) // Reference to the share popup
  const fontPopupRef = useRef(null) // Reference to the font popup

  // Settings hook
  const { settings } = useSettings()

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 32)) // Increase font size, max 24px
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 16)) // Decrease font size, min 12px

  // Function to check if the popup is overflowing the screen
  const handlePopupPosition = () => {
    const popup = sharePopupRef.current

    if (popup) {
      const rect = popup.getBoundingClientRect()
      const isOverflowingRight = rect.right > window.innerWidth

      if (isOverflowingRight) {
        popup.style.left = '-60px'
        popup.style.right = '0'
      } else {
        // popup.style.left = '50%'
        // popup.style.right = 'auto'
      }
    }
  }

  const handleClickOutside = event => {
    if (
      fontPopupRef.current &&
      !fontPopupRef.current.contains(event.target) &&
      sharePopupRef.current &&
      !sharePopupRef.current.contains(event.target)
    ) {
      setShowFontPopup(false)
      setShowSharePopup(false)
    }
  }

  const handleTwitterShare = () => {
    const shareUrl = `https://x.com/intent/tweet?text=Check%20out%20this%20news%20article:%20${encodeURIComponent(activeLink)}`

    window.open(shareUrl, '_blank')
  }

  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activeLink)}`

    window.open(shareUrl, '_blank')
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className={`w-full p-1  flex justify-between items-center relative ${settings.mode === 'dark' ? 'bg-[#282A42] text-white' : 'bg-gray-100 text-black'}`}
    >
      {/* Left Side: Popular and Chat */}
      {/* <div className='w-full lg:w-1/3 flex justify-center items-center space-x-1'>
        <Tooltip title='Showing Popular' arrow placement='left'>
          <div
            className={`flex items-center space-x-1 border px-2 py-1 rounded-md  ${settings.mode === 'dark' ? 'bg-[#282A42]' : 'bg-white'}`}
          >
            <Star fontSize='small' className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`} />
            <span className={`text-xs font-semibold ${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`}>
              Popular
            </span>
          </div>
        </Tooltip>
        <Tooltip title='Report' arrow placement='right'>
          <div
            className={`flex items-center space-x-1 border px-2 py-1 rounded-md  ${settings.mode === 'dark' ? 'bg-[#282A42]' : 'bg-white'}`}
          >
            <Chat fontSize='small' className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`} />
          </div>
        </Tooltip>
      </div> */}

      {/* Right Side: Tabs and Icons */}
      <div className='w-full lg:w-3/3 flex justify-end items-center space-x-6'>
        {/* Tabs: Original and Reader */}
        {/* <div
          className={`flex space-x-0 border ml-[35%] p-1 rounded-lg ${settings.mode === 'dark' ? 'bg-[#282A42]' : 'bg-white'}`}
        >
          <div
            onClick={() => setActiveTab('original')}
            className={`cursor-pointer flex items-center text-[0.65rem] font-semibold uppercase px-1 py-1 rounded-sm ${
              activeTab === 'original' ? 'bg-gray-300 text-gray-700' : 'text-gray-500'
            }`}
          >
            Original
          </div>
          <div
            onClick={() => setActiveTab('reader')}
            className={`cursor-pointer text-[0.65rem] flex items-center font-semibold uppercase px-1 py-1 rounded-sm ${
              activeTab === 'reader' ? 'bg-gray-300 text-gray-700' : 'text-gray-500'
            }`}
          >
            Reader
          </div>
        </div> */}

        {/* Icons: Font Size, Share, View Original */}
        <div className='flex space-x-2 relative'>
          {/* Font Size Icon with Popup */}
          <div
            className={`flex items-center border px-1 py-1 rounded-md ${settings.mode === 'dark' ? 'bg-[#282A42]' : 'bg-white'} cursor-pointer relative`}
            onMouseEnter={() => {
              setShowFontPopup(true)
              setShowSharePopup(false)
            }}
            ref={fontPopupRef}
          >
            <FontDownload
              fontSize='small'
              className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`}
            />
            <div
              className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 ${settings.mode === 'dark' ? 'bg-[#282A42]' : 'bg-white'} border shadow-lg rounded-md p-2 text-center w-40 z-10 transition-all duration-300 ease-in-out ${
                showFontPopup ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <p className={`text-sm font-semibold ${settings.mode === 'dark' ? 'text-white-700' : 'text-gray-700'}`}>
                Font size
              </p>
              <div className='flex gap-1 mt-2'>
                <button
                  className='cursor-pointer border w-[50%] px-2 py-1 text-xs hover:bg-gray-200'
                  onClick={decreaseFontSize}
                >
                  Aa
                </button>
                <button
                  className='cursor-pointer border w-[50%] px-2 py-1 text-xs font-bold hover:bg-gray-200'
                  onClick={increaseFontSize}
                >
                  Aa
                </button>
              </div>
            </div>
          </div>
          {/* View Original Icon */}
          <Tooltip title='View Original' arrow placement='left'>
            <a
              href={activeLink || '#'}
              target='_blank'
              rel='noopener noreferrer'
              className={`flex items-center border px-1 py-1 rounded-md ${settings.mode === 'dark' ? 'bg-[#282A42]' : 'bg-white'} cursor-pointer`}
            >
              <OpenInNew
                fontSize='small'
                className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`}
              />
            </a>
          </Tooltip>
          {/* Share Icon with Popup */}
          <div
            className={`flex items-center border px-1 py-1 rounded-md ${settings.mode === 'dark' ? 'bg-[#282A42]' : 'bg-white'} cursor-pointer relative`}
            onMouseEnter={() => {
              setShowSharePopup(true)
              setShowFontPopup(false)
              handlePopupPosition() // Check and adjust position when the popup is shown
            }}
          >
            <Share fontSize='small' className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`} />
            <div
              ref={sharePopupRef}
              className={`absolute top-full flex justify-center mt-2 left-1/2 transform -translate-x-1/2 ${settings.mode === 'dark' ? 'bg-[#282A42]' : 'bg-white'} border shadow-lg rounded-md p-2 text-left w-40 z-10 transition-all duration-300 ease-in-out ${
                showSharePopup ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <ul className='space-y-2'>
                <li
                  className={`flex items-center gap-2 text-sm ${settings.mode === 'dark' ? 'text-white-700' : 'text-gray-700'} cursor-pointer`}
                >
                  <Email
                    fontSize='small'
                    className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`}
                  />
                  Send To Friend
                </li>
                <li
                  className={`flex items-center gap-2 text-sm ${settings.mode === 'dark' ? 'text-white-700' : 'text-gray-700'} cursor-pointer`}
                >
                  <X
                    fontSize='small'
                    className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`}
                    onClick={handleTwitterShare}
                  />
                  Twitter
                </li>
                <li
                  className={`flex items-center gap-2 text-sm ${settings.mode === 'dark' ? 'text-white-700' : 'text-gray-700'} cursor-pointer`}
                  onClick={handleFacebookShare}
                >
                  <Facebook
                    fontSize='small'
                    className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`}
                  />
                  Facebook
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBar
