import { useRef, useState } from 'react'

import { FontDownload } from '@mui/icons-material'

import { useSettings } from '@core/hooks/useSettings'

const FontSizeControl = ({ fontSize, setFontSize }) => {
  const [showFontPopup, setShowFontPopup] = useState(false)
  const fontPopupRef = useRef(null)
  const { settings } = useSettings()

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 32))
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 16))

  return (
    <div
      className={`flex items-center border px-1 py-1 rounded-md ${settings.mode === 'dark' ? 'bg-[#282A42]' : 'bg-white'} cursor-pointer relative`}
      onMouseEnter={() => setShowFontPopup(true)}
      ref={fontPopupRef}
    >
      <FontDownload fontSize='small' className={`${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'}`} />
      {showFontPopup && (
        <div className='absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border shadow-lg rounded-md p-2 text-center w-40 z-10'>
          <p className='text-sm font-semibold text-gray-700'>Font size</p>
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
      )}
    </div>
  )
}

export default FontSizeControl
