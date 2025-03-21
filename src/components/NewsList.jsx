'use client'

import { useEffect, useState } from 'react'

import { Bookmark, BookmarkBorder } from '@mui/icons-material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

import PerfectScrollbarWrapper from './PerfectScrollbar'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import qubicwebgif from '../assets/img/logo.gif'
import { useNews } from '@/context/NewsContext'

const NewsList = ({ loading, onScroll }) => {
  const { newsData, activeId, setActiveId, handleNewsClick } = useNews()
  const { data: session, status } = useSession()
  const { settings } = useSettings()

  const [bookmarked, setBookmarked] = useState(new Set())

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchBookmarkedNews()
    }
  }, [status, session])

  useEffect(() => {
    // Reset active news item when the feed changes
    setActiveId(null)
    setBookmarked(new Set()) // Reset bookmarks when switching feeds
  }, [newsData, setActiveId])

  const fetchBookmarkedNews = async () => {
    try {
      const response = await fetch('/api/auth/bookmarks')

      if (!response.ok) throw new Error('Failed to fetch bookmarks')
      const data = await response.json()

      setBookmarked(new Set(data.bookmarks.map(bookmark => bookmark.newsId)))
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    }
  }

  const toggleBookmark = async newsItem => {
    if (!newsItem || newsItem.id === undefined || newsItem.id === null || !newsItem.title || !newsItem.source) {
      toast.error('Missing news data. Please try again.')
      console.error('❌ Missing news data:', newsItem)

      return
    }

    if (status !== 'authenticated' || !session?.user?.id) {
      toast.error('You must be logged in to bookmark news.')

      return
    }

    const isBookmarked = bookmarked.has(newsItem.id)

    const confirmAction = await Swal.fire({
      title: isBookmarked ? 'Remove Bookmark?' : 'Bookmark this news?',
      text: 'Are you sure you want to proceed?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    })

    if (!confirmAction.isConfirmed) return

    // Optimistic UI update
    setBookmarked(prev => {
      const updated = new Set(prev)

      isBookmarked ? updated.delete(newsItem.id) : updated.add(newsItem.id)

      return updated
    })

    try {
      const response = await fetch('/api/auth/bookmarks', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsId: newsItem.id,
          title: newsItem.title,
          content: newsItem.contentSnippet || 'No content available.',
          source: newsItem.source,
          publishedAt: newsItem.publishedDate || new Date().toISOString()
        })
      })

      const text = await response.text()

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${text}`)
      }

      toast.success(isBookmarked ? 'Bookmark removed successfully' : 'News bookmarked successfully')
    } catch (error) {
      console.error('❌ Bookmark update error:', error)
      toast.error('Something went wrong!')

      // Rollback UI if API call fails
      setBookmarked(prev => {
        const rollback = new Set(prev)

        isBookmarked ? rollback.add(newsItem.id) : rollback.delete(newsItem.id)

        return rollback
      })
    }
  }

  return (
    <PerfectScrollbarWrapper onScroll={onScroll}>
      <div className='space-y-2'>
        {newsData
          .filter(news => news.id !== 0)
          .map(news => (
            <div
              key={news.id}
              onClick={() => handleNewsClick(news.id)}
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
                {news.id}
              </div>

              {/* Content section */}
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
                  </div>
                </div>

                {/* Bookmark icon */}
                {status === 'unauthenticated' ? null : (
                  <div
                    onClick={e => {
                      e.stopPropagation()
                      toggleBookmark(news)
                    }}
                    className='text-orange-500 hover:text-gray-500 cursor-pointer opacity-1 group-hover:opacity-100 transition-opacity'
                  >
                    {bookmarked.has(news.id) ? <Bookmark fontSize='medium' /> : <BookmarkBorder fontSize='medium' />}
                  </div>
                )}
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

        {/* "Select a News Feed" Message */}
        {!loading && !activeId && (
          <div className='p-4 text-center flex flex-col items-center mt-5 bg-white border-gray-300 text-gray-500'>
            <img src={qubicwebgif.src} className='w-[80px] h-[80px]' alt='Select a News Feed' />
            <span className='text-lg font-semibold'>Select a News Feed</span>
          </div>
        )}

        {/* "No More Content" Message */}
        {!loading && activeId && newsData.length === 0 && (
          <div className='p-4 text-center flex flex-col items-center mt-5 bg-white border-gray-300 text-gray-500'>
            <img src={qubicwebgif.src} className='w-[80px] h-[80px]' alt='No More Content' />
            <span className='text-lg font-semibold'>No more content</span>
          </div>
        )}
      </div>
    </PerfectScrollbarWrapper>
  )
}

export default NewsList
