'use client'

import { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Bookmark, BookmarkBorder } from '@mui/icons-material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

import { v4 as uuidv4 } from 'uuid' // Import UUID generator

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
  const [bookmarked, setBookmarked] = useState(new Set())
  const sourceUrlParam = searchParams.get('sourceUrl')
  const queryNewsId = searchParams.get('newsId')

  // Save bookmarked state to localStorage whenever it changes
  useEffect(() => {
    window.localStorage.setItem('bookmarkedNews', JSON.stringify([...bookmarked]))
  }, [bookmarked])

  useEffect(() => {
    const savedBookmarks = JSON.parse(window.localStorage.getItem('bookmarkedNews')) || []

    setBookmarked(new Set(savedBookmarks))

    if (
      status === 'authenticated' &&
      session?.user?.id &&
      newsData.length > 0 &&
      typeof newsData[0]?.source === 'string'
    ) {
      fetchBookmarkedNews(newsData[0].source)
    }
  }, [status, session, newsData, sourceUrl])

  useEffect(() => {
    if (newsData.length > 0) {
      const uniqueNews = Array.from(new Map(newsData.map(item => [item.id, item])).values())

      if (uniqueNews.length !== newsData.length) {
        setNewsData(uniqueNews)
      } else {
        console.log('Heheh')
      }
    }
  }, [newsData])

  //  if (queryNewsId && newsData.length > 0) {
  //    const numericId = parseInt(queryNewsId)

  //    if (!isNaN(numericId)) {
  //      handleNewsClick(numericId)
  //    }
  //  }
  useEffect(() => {
    if (queryNewsId) {
      setActiveId(queryNewsId)
      handleNewsClick(queryNewsId)
    }
  }, [queryNewsId])

  useEffect(() => {
    if (sourceUrlParam) {
      setSourceUrl(sourceUrlParam)
      setNewsData([]) // ✅ Clear the old news list

      setActiveId(null) // ✅ Reset active news when the source changes
    }
  }, [searchParams])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && newsData.length > 0) {
      // Check if the current news is bookmarked
      fetchBookmarkedNews(newsData[0].source) // Pass the source
    }
  }, [status, session, newsData])
  useEffect(() => {
    if (newsData.length > 0 && newsData[0]?.source && typeof newsData[0].source === 'string') {
      // setBookmarked(new Set()) // Clear previous bookmarks
      fetchBookmarkedNews(newsData[0].source) // Fetch bookmarks for the new
      // ✅ Reset activeId ONLY when the source actually changes
      setActiveId(prevId => (newsData.some(news => news.id === prevId) ? prevId : null))
    }
  }, [newsData])

  useEffect(() => {
    if (status === 'unauthenticated' && !sessionStorage.getItem('bookmark_warned')) {
      // Show a notification ring (Toast, can be modified to a modal or floating notification)
      toast.info('🔔 You have to login to bookmark.', { autoClose: 4000 })

      // Prevent showing the toast again in the current session
      sessionStorage.setItem('bookmark_warned', 'true')
    }
  }, [status])

  const fetchBookmarkedNews = async selectedSource => {
    if (status !== 'authenticated' || !session?.user?.id) {
      console.warn('User is not logged in. Skipping bookmark fetch.')

      return
    }

    if (!selectedSource || typeof selectedSource !== 'string') {
      console.error('Invalid source provided for bookmarks:', selectedSource)

      return
    }

    try {
      const response = await fetch(`/api/auth/bookmarks?source=${encodeURIComponent(selectedSource)}`)

      if (!response.ok) throw new Error('Failed to fetch bookmarks')

      const data = await response.json()

      // console.log('Fetched Bookmarks:', data.bookmarks)

      // Only store bookmarks that belong to the selected source
      const filteredBookmarks = new Set([...data.bookmarks.map(bookmark => bookmark.news.uuid)])

      // console.log('Matched Data:', filteredBookmarks)

      setBookmarked(filteredBookmarks)

      // ✅ Save fetched bookmarks to localStorage
      window.localStorage.setItem('bookmarkedNews', JSON.stringify([...filteredBookmarks]))
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    }
  }

  const toggleBookmark = async newsItem => {
    // console.log(sourceUrl)
    // console.log('News Item in Bookmark:', newsItem)
    // console.log('Fetching bookmarks for news ID:', newsItem.id)
    // console.log('Bookmarking news:', newsItem.title)
    // console.log(sourceUrl)

    // Validate required fields
    if (!newsItem.id || !newsItem.title || !newsItem.source || !sourceUrl) {
      toast.error('Invalid or missing news data.')

      return
    }

    const isBookmarked = bookmarked.has(newsItem.uuid)

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

      isBookmarked ? updated.delete(newsItem.uuid) : updated.add(newsItem.uuid)

      // ✅ Persist changes to localStorage
      window.localStorage.setItem('bookmarkedNews', JSON.stringify([...updated]))

      return updated
    })

    try {
      // console.log('About to enter:', newsItem.id)
      // In your API handler
      const newsUuid = uuidv4() // Generate a new UUID for the news item

      // console.log('Request Body:', {
      //   newsId: newsItem.id,
      //   newsUuid,
      //   title: newsItem.title,
      //   content: newsItem.contentSnippet || 'No content available.',
      //   source: newsItem.source,

      //   // sourceId:
      //   newsUrl: newsItem.link,
      //   sourceUrl,
      //   publishedAt: newsItem.publishedDate || new Date().toISOString()
      // })

      const response = await fetch('/api/auth/bookmarks', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsId: newsItem.id,
          newsUuid,
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
              key={`${news.source}-${news.id}`}
              onClick={() => handleNewsClick(news.id)}
              className={`p-3 border rounded-lg relative cursor-pointer ${settings.mode === 'dark' ? 'hover:bg-[#fff]' : 'bg-transparent hover:bg-black'}
              ${
                settings.mode === 'dark' && news.id === activeId
                  ? 'border-orange-500 text-[#000]'
                  : settings.mode === 'light' && news.id === activeId
                    ? 'bg-orange-100 border-orange-500'
                    : 'bg-dark border-gray-300'
              } transition group`}
            >
              {/* ID Badge */}
              <div
                className={`absolute top-4 left-3 ${settings.mode === 'dark' ? 'bg-white text-black group-hover:bg-black group-hover:text-white' : 'bg-black text-white group-hover:bg-white group-hover:text-black'} font-bold text-sm flex items-center justify-center`}
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
                    className={`text-sm font-semibold ${settings.mode === 'dark' ? 'text-white group-hover:text-orange-500' : 'text-gray-800 group-hover:text-orange-500'}`}
                  >
                    {news.title}
                  </h3>
                  <div
                    className={`text-xs ${settings.mode === 'dark' ? 'text-white group-hover:text-orange-500' : 'text-gray-500 group-hover:text-orange-500'} flex space-x-2 mt-1`}
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
                    {/* Ensure the icon activates based on bookmark state */}
                    {/* {console.log('Hiinews,', news.id)} */}
                    {bookmarked.has(news.id) ? <Bookmark fontSize='small' /> : <BookmarkBorder fontSize='small' />}
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
