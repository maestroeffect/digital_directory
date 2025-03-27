'use client'

import { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'
import { RiDeleteBin6Line } from 'react-icons/ri'

import { toast } from 'react-toastify'

import PerfectScrollbarWrapper from '@/components/PerfectScrollbar'
import { useSettings } from '@/@core/hooks/useSettings'

const Bookmarks = ({ onScroll }) => {
  const { data: session, status } = useSession()
  const [bookmarks, setBookmarks] = useState({})
  const [sourcesMap, setSourcesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState({})

  const settings = useSettings()

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookmarks()
    }
  }, [status])

  const fetchBookmarks = async () => {
    try {
      const sourcesRes = await fetch(`/api/auth/sources`)

      if (!sourcesRes.ok) throw new Error('Failed to fetch sources')

      const { sources } = await sourcesRes.json()

      const sourceMapping = {}

      sources.forEach(source => {
        sourceMapping[source.name] = source.sourceUrl
      })
      setSourcesMap(sourceMapping)

      const bookmarksBySource = {}

      for (const source of sources) {
        const res = await fetch(`/api/auth/bookmarks?source=${encodeURIComponent(source.name)}`)

        if (res.ok) {
          const { bookmarks } = await res.json()

          if (bookmarks.length > 0) {
            bookmarksBySource[source.name] = bookmarks
          }
        }
      }

      setBookmarks(bookmarksBySource)

      // Fetch images for each bookmark
      fetchImages(bookmarksBySource)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      setBookmarks({})
    } finally {
      setLoading(false)
    }
  }

  const fetchImages = async bookmarksBySource => {
    const newImages = {}

    for (const [source, newsList] of Object.entries(bookmarksBySource)) {
      for (const bookmark of newsList) {
        if (!bookmark.news.image) {
          try {
            const res = await fetch(`/api/extract-image?url=${encodeURIComponent(bookmark.news.url)}`)

            if (res.ok) {
              const { image } = await res.json()

              newImages[bookmark.id] = image || 'https://placehold.co/600x400'
            }
          } catch (error) {
            console.error('Error fetching image:', error)
          }
        }
      }
    }

    setImages(prevImages => ({ ...prevImages, ...newImages }))
  }

  const handleDelete = async bookmarkId => {
    try {
      const res = await fetch(`/api/auth/bookmarks`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newsId: bookmarkId }) // Send newsId in request body
      })

      if (!res.ok) throw new Error('Failed to delete bookmark')

      // Update state to remove the deleted bookmark
      setBookmarks(prevBookmarks => {
        const updatedBookmarks = {}

        Object.entries(prevBookmarks).forEach(([source, newsList]) => {
          const filteredNewsList = newsList.filter(bookmark => bookmark.id !== bookmarkId)

          if (filteredNewsList.length > 0) {
            updatedBookmarks[source] = filteredNewsList
          }
        })

        return updatedBookmarks
      })

      toast.success('Bookmark deleted successfully')
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      toast.error('Failed to delete bookmark')
    }
  }

  if (status === 'loading' || loading) return <p>Loading bookmarks...</p>
  if (!session) return <p>Please log in to view bookmarks.</p>

  return (
    <div className='p-5 max-w-6xl mx-auto'>
      <PerfectScrollbarWrapper onScroll={onScroll}>
        <h2 className='text-center text-2xl font-semibold mb-3'>My Bookmarks</h2>
        {Object.keys(bookmarks).length === 0 ? (
          <p>No bookmarks found.</p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Object.entries(bookmarks).map(([source, newsList]) =>
              newsList.map(bookmark => (
                <div
                  key={bookmark.id}
                  className={`group relative ${settings.mode === 'dark' ? '' : ''} bg-white border border-orang-300 rounded-lg shadow-sm p-4 transition-all duration-300 hover:shadow-orange-400/50 hover:shadow-lg flex flex-col h-full`}
                >
                  <img
                    src={images[bookmark.id] || bookmark.news.image || 'https://placehold.co/600x400'}
                    alt='News'
                    className='w-full h-48 object-cover rounded-lg'
                  />
                  <h3 className='text-lg font-semibold mt-3'>
                    <a
                      href={bookmark.news.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-black cursor-pointer hover:text-orange-500 transition'
                    >
                      {bookmark.news.title}
                    </a>
                  </h3>
                  {/* <p className='text-gray-600 mt-2 text-sm'>{bookmark.news.content.slice(0, 100)}...</p> */}
                  <div className='mt-auto flex justify-between items-center bg-white pt-4 rounded-b-lg'>
                    <a
                      href={sourcesMap[source] || '#'}
                      rel='noopener noreferrer'
                      className='text-orange-500 font-semibold hover:underline'
                    >
                      {source}
                    </a>
                    <RiDeleteBin6Line
                      size={20}
                      className='text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                      onClick={() => handleDelete(bookmark.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        <div className='flex justify-center mt-6'>
          <button className='px-5 py-2 text-lg bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer'>
            Load More
          </button>
        </div>
      </PerfectScrollbarWrapper>
    </div>
  )
}

export default Bookmarks
