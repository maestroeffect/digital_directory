'use client'

import { useEffect, useState } from 'react'

import { BarChart3, Newspaper, Users, MessageSquare } from 'lucide-react'

import { Divider } from '@mui/material'

import { toast } from 'react-toastify'

import { useSession } from 'next-auth/react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import qubicwebgif from '@assets/img/logo.gif'

import qubicwebgifwhite from '@assets/img/logo_white.gif'

import FeedLayout from '@/components/layout/vertical/FeedLayout'
import NewsList from '@/components/NewsList'
import { useNews } from '@/context/NewsContext'
import PerfectScrollbarWrapper from '@/components/PerfectScrollbar'
import { useSettings } from '@/@core/hooks/useSettings'

const Home = () => {
  const { newsData, onScroll } = useNews()
  const [loading, setLoading] = useState(false)
  const [totalNewsCount, setTotalNewsCount] = useState(0)
  const [uniqueSourcesCount, setUniqueSourcesCount] = useState(0)
  const [uniqueCategoriesCount, setUniqueCategoriesCount] = useState(0)
  const [totalCommentsCount, setTotalCommentsCount] = useState(0)
  const [totalBookmarksCount, setTotalBookmarksCount] = useState(0)

  const { settings } = useSettings()

  const session = useSession()

  useEffect(() => {
    // console.log('newsData:', newsData)

    if (newsData.length > 0) {
      const totalNews = newsData.length
      const uniqueSources = new Set(newsData.map(n => n.source)).size
      const uniqueCategories = new Set(newsData.map(n => n.category)).size
      const totalComments = newsData.reduce((sum, n) => sum + (n.comments || 0), 0)

      let i = 0

      const intervalId = setInterval(() => {
        if (i <= totalNews) {
          setTotalNewsCount(i)
          i++
        } else {
          clearInterval(intervalId)
        }
      }, 10)

      let j = 0

      const intervalId2 = setInterval(() => {
        if (j <= uniqueSources) {
          setUniqueSourcesCount(j)
          j++
        } else {
          clearInterval(intervalId2)
        }
      }, 10)

      let k = 0

      const intervalId3 = setInterval(() => {
        if (k <= uniqueCategories) {
          setUniqueCategoriesCount(k)
          k++
        } else {
          clearInterval(intervalId3)
        }
      }, 10)

      let l = 0

      const intervalId4 = setInterval(() => {
        if (l <= totalComments) {
          setTotalCommentsCount(l)
          l++
        } else {
          clearInterval(intervalId4)
        }
      }, 10)
    }
  }, [newsData])

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await fetch('/api/auth/bookmarks/all')
        const data = await response.json()

        if (response.ok) {
          console.log(data)

          setTotalBookmarksCount(data.bookmarks.length)
        } else {
          console.log('Failed to fetch bookmarks:', data.error)
          toast.error('Not Yet Logged In')
        }
      } catch (error) {
        console.log('Error fetching bookmarks:', error.message)
      }
    }

    fetchBookmarks()
  }, [])

  const totalComments = newsData.reduce((sum, n) => sum + (n.comments || 0), 0)

  return (
    <PerfectScrollbarWrapper onScroll={onScroll}>
      <div className='flex flex-col items-center justify-center p-4 space-y-6'>
        <h1 className={`flex items-center gap-2 text-3xl font-bold ${settings.mode === 'dark' ? 'text-white' : ''}`}>
          <img
            src={settings.mode === 'dark' ? qubicwebgifwhite.src : qubicwebgif.src}
            alt='QubicWeb Logo'
            className='w-20 h-20'
          />
          Digital Directory
        </h1>

        {/* Analytics Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
          <Card
            className={`bg-black ${settings.mode === 'dark' ? 'border border-orange-500 shadow-md' : ''} w-full h-[200px]`}
          >
            <CardContent className='flex items-center gap-4 py-6'>
              <Newspaper className='w-12 h-12 text-white' />
              <div>
                <p className='text-lg text-orange-600'>Total News Feeds</p>
                <p className='text-2xl text-white font-bold'>{totalNewsCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-white-500 ${settings.mode === 'dark' ? 'border border-white shadow-md' : ''}  w-full h-[200px]`}
          >
            <CardContent className='flex items-center gap-4 py-6'>
              <Users className='w-12 h-12 text-green-600' />
              <div>
                <p className={`text-lg ${settings.mode === 'dark' ? 'text-white' : 'text-gray-600'} `}>Sources</p>
                <p className={`text-2xl ${settings.mode === 'dark' ? 'text-white' : 'text-gray-600'} font-bold`}>
                  {uniqueSourcesCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-[#000] ${settings.mode === 'dark' ? 'border border-orange-500 shadow-md' : ''} w-full h-[200px]`}
          >
            <CardContent className='flex items-center gap-4 py-6'>
              <BarChart3 className='w-12 h-12 text-white' />
              <div>
                <p className={`text-lg ${settings.mode === 'dark' ? 'text-white' : 'text-orange-600'} `}>Categories</p>
                <p className={`text-2xl ${settings.mode === 'dark' ? 'text-white' : 'text-gray-600'} font-bold`}>
                  {uniqueCategoriesCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`${settings.mode === 'dark' ? 'bg-black border border-white shadow-md' : 'bg-white'} w-full h-[200px]`}
          >
            <CardContent className='flex items-center gap-4 py-6'>
              <MessageSquare className='w-12 h-12 text-purple-600' />
              <div>
                <p className={`text-lg ${settings.mode === 'dark' ? 'text-orange-600' : 'text-orange-600'} `}>
                  Total Bookmarks
                </p>
                <p className={`text-2xl ${settings.mode === 'dark' ? 'text-white' : 'text-gray-600'} font-bold`}>
                  {totalBookmarksCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest News Section */}
        <div className='w-full'>
          <h2
            className={`text-xl text-center font-semibold mt-6 mb-2 ${settings.mode === 'dark' ? 'text-white' : 'text-black'}`}
          >
            📰 Latest News
          </h2>
          {/* Horizontal Line */}
          <Divider className='border-gray-300 my-3' />

          {/* News from Different Sources */}
          {/* Grid layout for 3 columns */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from(new Set(newsData.map(news => news.source)))
              .slice(0, 3)
              .map(source => (
                <div key={source} className='bg-white p-4 rounded-lg shadow-md'>
                  <h3 className='text-lg font-bold mb-3'>{source}</h3>
                  {newsData
                    .filter(news => news.source === source)
                    .slice(0, 3) // Display up to 3 articles per source
                    .map(news => (
                      <div key={news.id} className='border-b border-gray-300 py-2'>
                        <a
                          href={news.link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-orange-500 hover:underline font-medium'
                        >
                          {news.title}
                        </a>
                        {/* <p className='text-sm text-gray-600'>{news.contentSnippet.slice(0, 50)}</p> */}
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </PerfectScrollbarWrapper>
  )
}

export default Home
