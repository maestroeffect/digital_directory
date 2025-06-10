'use client'

import { useEffect, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { Bookmark, BookmarkBorder } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

import PerfectScrollbarWrapper from './PerfectScrollbar'

import qubicwebgifwhite from '@assets/img/logo_white.gif'
import qubicwebgif from '../assets/img/logo.gif'

import { useSettings } from '@core/hooks/useSettings'
import { useNews } from '@/context/NewsContext'

const NewsList = ({ loading, onScroll }) => {
  const { newsData, setNewsData, activeId, setActiveId, handleNewsClick, filtering } = useNews()
  const { data: session, status } = useSession()
  const { settings } = useSettings()

  const searchParams = useSearchParams()
  const [sourceUrl, setSourceUrl] = useState(null)
  const [bookmarked, setBookmarked] = useState(new Set())

  const sourceUrlParam = searchParams.get('sourceUrl')
  const queryNewsId = searchParams.get('newsId')

  // Load bookmarked from localStorage
  useEffect(() => {
    const savedBookmarks = JSON.parse(window.localStorage.getItem('bookmarkedNews'))

    setBookmarked(new Set(savedBookmarks))
  }, [])

  // Save bookmarks to localStorage
  useEffect(() => {
    window.localStorage.setItem('bookmarkedNews', JSON.stringify([...bookmarked]))
  }, [bookmarked])

  // Set source URL and reset data when source changes
  useEffect(() => {
    if (sourceUrlParam) {
      setSourceUrl(sourceUrlParam)

      // setNewsData([])
      setActiveId(null)
    }
  }, [sourceUrlParam])

  useEffect(() => {
    // Only run if items are missing IDs
    if (newsData.length > 0 && newsData.every(item => !item.id)) {
      const numberedNews = newsData.map((item, index) => ({
        ...item,
        id: index + 1
      }))

      setNewsData(numberedNews)
    }
  }, [newsData])

  // Select news if query param provided
  useEffect(() => {
    if (queryNewsId) {
      setActiveId(queryNewsId)
      handleNewsClick(queryNewsId)
    }
  }, [queryNewsId])

  // Show login reminder if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated' && !sessionStorage.getItem('bookmark_warned')) {
      toast.info('🔔 You have to login to bookmark.', { autoClose: 4000 })
      sessionStorage.setItem('bookmark_warned', 'true')
    }
  }, [status])

  // Fetch bookmarks once when user is authenticated and newsData has valid source
  useEffect(() => {
    const shouldFetch =
      status === 'authenticated' && session?.user?.id && newsData.length > 0 && typeof newsData[0]?.source === 'string'

    if (shouldFetch) {
      fetchBookmarkedNews(newsData[0].source)
    }
  }, [status, session?.user?.id, newsData.length > 0 && newsData[0]?.source])

  const fetchBookmarkedNews = async selectedSource => {
    if (!selectedSource || typeof selectedSource !== 'string') return

    try {
      const response = await fetch(`/api/auth/bookmarks?source=${encodeURIComponent(selectedSource)}`)

      if (!response.ok) throw new Error('Failed to fetch bookmarks')

      const data = await response.json()
      const filteredBookmarks = new Set([...data.bookmarks.map(bookmark => bookmark.news.uuid)])

      setBookmarked(filteredBookmarks)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    }
  }

  const toggleBookmark = async newsItem => {
    if (!newsItem.id || !newsItem.title || !newsItem.source || !newsItem.uuid) {
      toast.error('Invalid or missing news data.')

      return
    }

    const isBookmarked = bookmarked.includes(newsItem.uuid)

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

      return updated
    })

    try {
      const response = await fetch(
        isBookmarked
          ? `/api/auth/bookmarks?newsId=${newsItem.id}&newsUuid=${newsItem.uuid}&source=${encodeURIComponent(newsItem.source)}`
          : `/api/auth/bookmarks`,
        {
          method: isBookmarked ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          ...(isBookmarked
            ? {}
            : {
                body: JSON.stringify({
                  newsId: newsItem.id,
                  newsUuid: newsItem.uuid,
                  title: newsItem.title,
                  content: newsItem.contentSnippet || 'No content available.',
                  source: newsItem.source,
                  newsUrl: newsItem.link,
                  sourceUrl,
                  publishedAt: newsItem.publishedDate || new Date().toISOString()
                })
              })
        }
      )

      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`)

      toast.success(isBookmarked ? 'Bookmark removed successfully' : 'News bookmarked successfully')
    } catch (error) {
      console.error('❌ Bookmark update error:', error.message)
      toast.error('Something went wrong!')

      // Rollback
      setBookmarked(prev => {
        const rollback = new Set(prev)

        isBookmarked ? rollback.add(newsItem.uuid) : rollback.delete(newsItem.uuid)

        return rollback
      })
    }
  }

  return (
    <PerfectScrollbarWrapper onScroll={onScroll}>
      <div className='space-y-2'>
        {newsData
          .filter(news => news.id !== 0)
          .map(news => {
            {
              /* console.log('Rendering news item with id:', news.id, 'and uuid:', news.uuid) // 👈 Log the id and uuid */
            }

            return (
              <div
                key={news.uuid}
                onClick={() => handleNewsClick(news.uuid)}
                className={`p-3 border rounded-lg relative cursor-pointer ${settings.mode === 'dark' ? 'hover:bg-[#fff]' : 'bg-transparent hover:bg-black'}
              ${
                settings.mode === 'dark' && news.uuid === activeId
                  ? 'border-orange-500 text-[#000]'
                  : settings.mode === 'light' && news.uuid === activeId
                    ? 'bg-orange-100 border-orange-500'
                    : 'bg-dark border-gray-300'
              } transition group`}
              >
                <div
                  className={`absolute top-4 left-3 ${settings.mode === 'dark' ? 'bg-white text-black group-hover:bg-black group-hover:text-white' : 'bg-black text-white group-hover:bg-white group-hover:text-black'} font-bold text-sm flex items-center justify-center`}
                  style={{
                    width: '32px',
                    height: '28px',
                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                  }}
                >
                  {news.id}
                </div>

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

                  {status === 'unauthenticated' ? null : (
                    <div
                      onClick={e => {
                        e.stopPropagation()
                        toggleBookmark(news)
                      }}
                      className='text-orange-500 hover:text-gray-500 cursor-pointer opacity-1 group-hover:opacity-100 transition-opacity'
                    >
                      {bookmarked.has(news.uuid) ? <Bookmark fontSize='small' /> : <BookmarkBorder fontSize='small' />}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

        {(filtering || loading) && (
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

        {!loading && !activeId && newsData.length > 0 && (
          <div
            className={`p-2 text-center rounded-lg flex flex-col items-center mt-2 ${settings.mode === 'dark' ? 'bg-dark border border-orange-300' : 'border-gray-300 border'} text-gray-500`}
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
