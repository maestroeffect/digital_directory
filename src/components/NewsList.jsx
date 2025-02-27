'use client'

import { useEffect, useState } from 'react'

import { Bookmark, BookmarkBorder } from '@mui/icons-material'

import PerfectScrollbar from 'react-perfect-scrollbar'

import PerfectScrollbarWrapper from './PerfectScrollbar'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

import qubicwebgif from '../assets/img/logo.gif'

const NewsList = ({ newsData, onClick, activeId, loading, onScroll }) => {
  // Settings hook
  const { settings } = useSettings()

  const [bookmarked, setBookmarked] = useState([])

  const toggleBookmark = id => {
    setBookmarked(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  return (
    <PerfectScrollbarWrapper onScroll={onScroll}>
      <div className='space-y-2'>
        {newsData.map(news => (
          <div
            key={news.id}
            onClick={() => onClick(news.id)}
            className={`p-3 border rounded-lg relative cursor-pointer hover:${settings.mode === 'dark' ? 'bg-gray-100 hover:text-[#F97316]' : 'bg-gray-100'}
            ${
              settings.mode === 'dark' && news.id === activeId
                ? 'bg-orange-100 border-orange-500 text-[#000]'
                : settings.mode === 'light' && news.id === activeId
                  ? 'bg-orange-100 border-orange-500'
                  : 'bg-dark border-gray-300'
            } transition group`}
          >
            {/* ID Badge */}
            <div
              className='absolute top-4 left-3 bg-black text-white font-bold text-sm flex items-center justify-center'
              style={{
                width: '32px', // Adjust size as needed
                height: '28px',
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' // Hexagon shape
              }}
            >
              {news.id + 1}
            </div>

            {/* Content section with enough padding on the left to avoid overlap with the ID badge */}
            <div className='flex justify-between pl-10'>
              <div className='flex-1'>
                <h3
                  className={`text-sm font-semibold ${settings.mode === 'dark' ? 'text-white-800' : 'text-gray-800'}`}
                >
                  {news.title}
                </h3>
                <div
                  className={`text-xs ${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'} flex space-x-2 mt-1`}
                >
                  <span>{news.source}</span>
                  <span>·</span>
                  <span>{news.publishedDate}</span>
                  {/* <span>·</span>
                  <span>{news.time}</span> */}
                </div>
              </div>

              {/* Bookmark icon will only show on hover of the card */}
              <div
                onClick={e => {
                  e.stopPropagation()
                  toggleBookmark(news.id)
                }}
                className='text-orange-500 hover:text-gray-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity'
              >
                {bookmarked.includes(news.id) ? <Bookmark fontSize='small' /> : <BookmarkBorder fontSize='small' />}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className='space-y-2 my-2'>
            <div className='p-4 border rounded-lg bg-white border-gray-300'>
              <div className='text-center flex flex-col items-center text-gray-500'>
                <img src={qubicwebgif.src} className='w-[50px] h-[50px]' />
                <span className='animate-pulse'>Loading...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PerfectScrollbarWrapper>
  )
}

export default NewsList
