'use client'

import { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Bookmark, BookmarkBorder } from '@mui/icons-material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

import PerfectScrollbarWrapper from './PerfectScrollbar'

import qubicwebgifwhite from '@assets/img/logo_white.gif'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import qubicwebgif from '../assets/img/logo.gif'
import { useNews } from '@/context/NewsContext'

const NewsList = ({ loading, onScroll }) => {
  const { newsData, setNewsData, activeId, setActiveId, handleNewsClick } = useNews()
  const { data: session, status } = useSession()
  const { settings } = useSettings()

  const searchParams = useSearchParams()
  const [sourceUrl, setSourceUrl] = useState(null)

  useEffect(() => {
    const sourceUrlParam = searchParams.get('sourceUrl')

    if (sourceUrlParam) {
      setSourceUrl(sourceUrlParam)
      setNewsData([]) // ✅ Clear the old news list
      setActiveId(null) // ✅ Reset active news when the source changes
    }
  }, [searchParams])

  const [bookmarked, setBookmarked] = useState(new Set())

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && newsData.length > 0) {
      // Check if the current news is bookmarked
      fetchBookmarkedNews(newsData) // Pass the entire list of news to check
    }
  }, [status, session, newsData])
  useEffect(() => {
    if (newsData.length > 0 && newsData[0]?.source && typeof newsData[0].source === 'string') {
      setBookmarked(new Set()) // Clear previous bookmarks
      fetchBookmarkedNews(newsData[0].source) // Fetch bookmarks for the new
      // ✅ Reset activeId ONLY when the source actually changes
      setActiveId(prevId => (newsData.some(news => news.id === prevId) ? prevId : null))
    }
  }, [newsData])

  const fetchBookmarkedNews = async selectedSource => {
    if (!selectedSource || typeof selectedSource !== 'string') {
      // console.error('Invalid source provided for bookmarks:', selectedSource)

      return
    }

    try {
      const response = await fetch(`/api/auth/bookmarks?source=${encodeURIComponent(selectedSource)}`)

      if (!response.ok) throw new Error('Failed to fetch bookmarks')

      const data = await response.json()

      // Only store bookmarks that belong to the selected source
      const filteredBookmarks = new Set(data.bookmarks.map(bookmark => bookmark.news.id))

      setBookmarked(filteredBookmarks)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    }
  }

  const toggleBookmark = async newsItem => {
    // console.log(sourceUrl)

    console.log('News Item in Bookmark:', newsItem)

    if (!newsItem.id || !newsItem.title || !newsItem.source) {
      toast.error('Invalid news data.')

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
          newsUrl: newsItem.link, // 🔹 Add URL here
          sourceUrl,
          publishedAt: newsItem.publishedDate || new Date().toISOString()
        })
      })

      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`)

      toast.success(isBookmarked ? 'Bookmark removed successfully' : 'News bookmarked successfully')
    } catch (error) {
      console.error('❌ Bookmark update error:', error)
      toast.error('Something went wrong!')

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
                className={`absolute top-4 left-3 ${settings.mode === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} font-bold text-sm flex items-center justify-center`}
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
                      toggleBookmark(news, sourceUrl)
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
            <div
              className={`p-3 border rounded-lg ${settings.mode === 'dark' ? qubicwebgifwhite.src : qubicwebgif.src} border-gray-300`}
            >
              <div className='text-center flex flex-col items-center text-gray-500'>
                <img
                  src={settings.mode === 'dark' ? qubicwebgifwhite.src : qubicwebgif.src}
                  className='w-[50px] h-[50px]'
                />
                <span className='animate-pulse'>Loading...</span>
              </div>
            </div>
          </div>
        )}

        {/* "Select a News Feed" Message */}
        {/* {!loading && !activeId && (
          <div
            className={`p-3 text-center flex flex-col items-center mt-3 {settings.mode === 'dark' ? 'bg-dark border border-orange-300' : 'border-gray-300 border'} text-gray-500`}
          >
            <img
              src={settings.mode === 'dark' ? qubicwebgifwhite.src : qubicwebgif.src}
              className='w-[50px] h-[50px]'
              alt='Select a News Feed'
            />
            <span className='text-lg font-semibold'>Select a News Feed</span>
          </div>
        )} */}

        {/* "No More Content" Message */}
        {!loading && !activeId && newsData.length > 0 && (
          <div
            className={`p-2 text-center rounded-lg flex flex-col items-center mt-2 ${settings.mode === 'dark' ? 'bg-dark border border-orange-300' : 'border-gray-300 border'}  text-gray-500`}
          >
            <img
              src={settings.mode === 'dark' ? qubicwebgifwhite.src : qubicwebgif.src}
              className='w-[50px] h-[50px]'
              alt='No More Content'
            />
            <span className='text-lg font-semibold'>End of News List</span>
          </div>
        )}
      </div>
    </PerfectScrollbarWrapper>
  )
}

export default NewsList
