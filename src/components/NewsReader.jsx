// components/NewsReader.js\

import { useState } from 'react'

import { Divider } from '@mui/material'

import PerfectScrollbar from 'react-perfect-scrollbar'

import { toast } from 'react-toastify'

import { useNews } from '@/context/NewsContext'

import qubicwebgif from '@assets/img/logo.gif'

import qubicwebgifwhite from '@assets/img/logo_white.gif'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// import PerfectScrollbarWrapper from './PerfectScrollbar'

const NewsReader = () => {
  const { newsData, activeId, setActiveId, loadingArticle, fontSize, handleNewsClick } = useNews()

  // console.log(activeId)

  const activeNews = newsData.find(news => news.uuid === activeId)

  // Settings hook
  const { settings } = useSettings()
  const [retrying, setRetrying] = useState(false)

  if (!activeNews) {
    return (
      <div className='p-8 flex flex-col items-center'>
        <img src={settings.mode === 'dark' ? qubicwebgifwhite.src : qubicwebgif.src} className='w-[30%] h-[30%]' />
        <p
          className={`text-center border p-2 ${settings.mode === 'dark' ? 'text-white border-white' : 'text-gray-500'} mt-4`}
        >
          Select a news item to view its details.
        </p>
      </div>
    )
  }

  // console.log(activeNews)

  return (
    <div className={`p-4 rounded-lg`}>
      {loadingArticle ? (
        <div className='flex justify-center items-center mt-40'>
          <img
            src={settings.mode === 'dark' ? qubicwebgifwhite.src : qubicwebgif.src}
            alt='Loading...'
            className='w-[200px] h-[200px]'
          />
          <p className='text-lg text-orange-500 mt-4'>Fetching article...</p>
        </div>
      ) : (
        <div style={{ fontSize: `${fontSize}px` }}>
          <h1 className={`text-2xl font-bold ${settings.mode === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
            {activeNews.title}
          </h1>

          <Divider orientation='horizontal' className='mb-4' />
          <PerfectScrollbar className='h-[calc(78vh-30px)] lg:h-[calc(78vh-30px)] xl:h-[calc(90vh-30px)] 2xl:h-[calc(90vh-30px)]'>
            {/* If it's a YouTube video, embed the player */}
            {activeNews.videoId ? (
              <>
                <div className='flex justify-center mt-4'>
                  <iframe
                    width='100%'
                    height='400'
                    src={`https://www.youtube.com/embed/${activeNews.videoId}`}
                    frameBorder='0'
                    allowFullScreen
                  ></iframe>
                </div>
                {/* <div>
                  <p className='text-sm text-gray-600'>Video duration: {activeNews.contentSnippet}</p>
                </div> */}
              </>
            ) : (
              <div
                className={`${settings.mode === 'dark' ? 'text-white' : 'text-gray-700'}`}
                dangerouslySetInnerHTML={{ __html: activeNews.fullContent }}
              />
            )}
          </PerfectScrollbar>
        </div>
      )}
    </div>
  )
}

export default NewsReader
