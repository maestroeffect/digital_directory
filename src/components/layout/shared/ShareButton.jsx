import { useEffect, useRef, useState } from 'react'

import { Share, Email, Facebook, X } from '@mui/icons-material'

import { useSettings } from '@core/hooks/useSettings'

const ShareButton = ({ activeLink }) => {
  const [showSharePopup, setShowSharePopup] = useState(false)
  const sharePopupRef = useRef(null)
  const { settings } = useSettings()

  const handleTwitterShare = () =>
    window.open(`https://x.com/intent/tweet?text=Check%20this%20out:%20${encodeURIComponent(activeLink)}`, '_blank')

  const handleFacebookShare = () =>
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activeLink)}`, '_blank')

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

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
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
            <Email fontSize='small' className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`} />
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
            <Facebook fontSize='small' className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`} />
            Facebook
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ShareButton
