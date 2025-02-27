// components/NewsReader.js
import { Divider } from '@mui/material'

import PerfectScrollbar from 'react-perfect-scrollbar'

import qubicwebgif from '@assets/img/logo.gif'

import qubicwebgifwhite from '@assets/img/logo_white.gif'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// import PerfectScrollbarWrapper from './PerfectScrollbar'

const NewsReader = ({ newsData, activeId, activeTab, fontSize }) => {
  const activeNews = newsData.find(news => news.id === activeId)

  // Settings hook
  const { settings } = useSettings()

  if (!activeNews) {
    return (
      <div className='p-8 flex flex-col items-center'>
        <img src={settings.mode === 'dark' ? qubicwebgifwhite.src : qubicwebgif.src} className='w-[30%] h-[30%]' />
        <p className={`text-center border p-2 ${settings.mode === 'dark' ? 'text-white-500' : 'text-gray-500'} mt-4`}>
          Select a news item to view its details.
        </p>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg`}>
      {activeNews ? (
        <>
          {activeTab === 'original' ? (
            <div className='flex justify-center items-center mt-40'>
              {/* Loading gif */}
              <img src={qubicwebgif.src} alt='Loading...' className='w-[200px] h-[200px]' />

              {/* Link to open in new tab */}
              <a
                href={activeNews.link}
                target='_blank'
                className='text-lg text-orange-500 border p-2 rounded-sm hover:bg-orange-100'
              >
                Open in a new tab
              </a>
            </div>
          ) : activeTab === 'reader' ? (
            <div style={{ fontSize: `${fontSize}px` }}>
              <h1
                className={`text-2xl font-bold ${settings.mode === 'dark' ? 'text-white-800' : 'text-gray-800'} mb-2`}
              >
                {activeNews.title}
              </h1>

              <Divider orientation='horizontal' className='mb-4' />
              <PerfectScrollbar className='h-[calc(76vh-60px)]'>
                <div
                  className={`${settings.mode === 'dark' ? 'text-white-700' : 'text-gray-700'}`}
                  dangerouslySetInnerHTML={{ __html: activeNews.fullContent }}
                />
              </PerfectScrollbar>
            </div>
          ) : (
            <p className='text-center text-gray-500 mt-4'>Select a news item to view its details.</p>
          )}
        </>
      ) : (
        <p className='text-center text-gray-500 mt-4'>Select a news item to view its details.</p>
      )}
    </div>
  )
}

export default NewsReader
