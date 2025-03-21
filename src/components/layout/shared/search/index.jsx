'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter, usePathname } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk'
import { Title, Description } from '@radix-ui/react-dialog'

// Component Imports
import DefaultSuggestions from './DefaultSuggestions'
import NoResult from './NoResult'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Context Imports
import { useNews } from '@/context/NewsContext'

// Style Imports
import './styles.css'

// Helper function to filter results globally
const filterResultsGlobally = (newsData, query) => {
  if (!newsData || !Array.isArray(newsData)) return [] // Ensure newsData exists

  const searchQuery = query.trim().toLowerCase()

  return newsData
    .filter(news => {
      const title = news?.title?.toLowerCase() || ''
      const snippet = news?.contentSnippet?.toLowerCase() || ''

      return title.includes(searchQuery) || snippet.includes(searchQuery)
    })
    .map(news => ({
      ...news,
      source: news.source || 'Unknown Source'
    }))
}

// Get search history from localStorage
const getSearchHistory = () => {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('searchHistory')) || []
  }

  return []
}

// Save search history to localStorage
const saveSearchHistory = searchQuery => {
  if (!searchQuery) return

  let history = getSearchHistory()

  // Remove duplicates and keep only the latest 5 searches
  history = [searchQuery, ...history.filter(item => item !== searchQuery)].slice(0, 5)

  localStorage.setItem('searchHistory', JSON.stringify(history))
}

const NavSearch = () => {
  // States
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchHistory, setSearchHistory] = useState(getSearchHistory())

  // Hooks
  const router = useRouter()
  const pathName = usePathname()
  const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav()

  // Context
  const { newsData, handleNewsClick } = useNews()

  const CommandFooter = () => {
    return (
      <div cmdk-footer=''>
        <div className='flex items-center gap-1'>
          <kbd>
            <i className='ri-arrow-up-line text-base' />
          </kbd>
          <kbd>
            <i className='ri-arrow-down-line text-base' />
          </kbd>
          <span>to navigate</span>
        </div>
        <div className='flex items-center gap-1'>
          <kbd>
            <i className='ri-corner-down-left-line text-base' />
          </kbd>
          <span>to open</span>
        </div>
        <div className='flex items-center gap-1'>
          <kbd>esc</kbd>
          <span>to close</span>
        </div>
      </div>
    )
  }

  // Handle search item selection
  const onSearchItemSelect = feed => {
    saveSearchHistory(feed.title) // Save search to history
    setSearchHistory(getSearchHistory()) // Update history in state
    handleNewsClick(feed.id) // Update the active news item in context
    setOpen(false) // Close search dialog
  }

  const hasNewsFeed = newsData && newsData.length > 0
  const filteredFeeds = filterResultsGlobally(newsData, searchValue)

  useEffect(() => {
    const down = e => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)

    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!open && searchValue !== '') {
      setSearchValue('')
    }
  }, [open])

  return (
    <>
      {isBreakpointReached || settings.layout === 'horizontal' ? (
        <IconButton className='text-textPrimary' onClick={() => setOpen(true)}>
          <i className='ri-search-line' />
        </IconButton>
      ) : (
        <div className='flex items-center gap-2 cursor-pointer' onClick={() => setOpen(true)}>
          <IconButton className='text-textPrimary' onClick={() => setOpen(true)}>
            <i className='ri-search-line' />
          </IconButton>
          <div className='whitespace-nowrap w-[200px] bg-gray select-none text-textDisabled'>Search Feeds ⌘K</div>
        </div>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className='flex items-center justify-between border-be pli-4 plb-3 gap-2'>
          <Title hidden />
          <Description hidden />
          <i className='ri-search-line' />
          <CommandInput value={searchValue} onValueChange={setSearchValue} />
          <span className='text-textDisabled'>[esc]</span>
          <i className='ri-close-line cursor-pointer' onClick={() => setOpen(false)} />
        </div>
        <CommandList>
          {!hasNewsFeed ? (
            <div className='p-4 text-center text-gray-500'>Please select a News Feed before searching.</div>
          ) : searchValue ? (
            filteredFeeds.length > 0 ? (
              <CommandGroup heading='News' className='text-xs'>
                {filteredFeeds.map((feed, index) => (
                  <CommandItem key={index} value={feed.title} onSelect={() => onSearchItemSelect(feed)}>
                    <div className='flex'>
                      <div>{feed.title}</div>
                      <div className='text-xs text-gray-500'>Source: {feed.source}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>
                <NoResult searchValue={searchValue} setOpen={setOpen} />
              </CommandEmpty>
            )
          ) : (
            <DefaultSuggestions setOpen={setOpen} searchHistory={searchHistory} />
          )}
        </CommandList>
        <CommandFooter />
      </CommandDialog>
    </>
  )
}

export default NavSearch
