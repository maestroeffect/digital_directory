'use client'

import { useState, useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'

import { Menu, MenuItem } from '@menu/vertical-menu'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import { useNews } from '@/context/NewsContext'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  const { allNews } = useNews() // Now using allNews from context
  const theme = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [feedSources, setFeedSources] = useState([])

  useEffect(() => {
    console.log('📦 allNews length:', allNews?.length)
    console.log('📦 allNews sample:', allNews?.[0])
  }, [allNews])

  // Generate unique feed sources from allNews
  useEffect(() => {
    if (allNews?.length > 0) {
      const sources = Array.from(new Set(allNews.map(item => item?.source)))
        .filter(source => source) // Remove any undefined/null sources
        .map(source => {
          const newsItem = allNews.find(item => item.source === source)
          const slug = source.toLowerCase().replace(/\s+/g, '-')

          return {
            name: source,
            slug,
            favicon: newsItem?.favicon || `https://icons.duckduckgo.com/ip3/${slug}.com.ico`,
            sourceUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}`
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name))

      setFeedSources(sources)
    }
  }, [allNews]) // Update when allNews changes

  const handleMenuClick = (slug, name, sourceUrl) => {
    router.push(`/${slug}?source=${encodeURIComponent(name)}&sourceUrl=${encodeURIComponent(sourceUrl)}`, {
      scroll: false
    })
  }

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(useVerticalNav(), theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        menuSectionStyles={menuSectionStyles(useVerticalNav(), theme)}
      >
        {feedSources.map((feed, index) => {
          const isActive = pathname === `/${feed.slug}`
          const isHovered = hoveredIndex === index

          return (
            <MenuItem
              key={`${feed.name}-${index}`}
              href={`/${feed.slug}?source=${encodeURIComponent(feed.name)}&sourceUrl=${encodeURIComponent(feed.sourceUrl)}`}
              icon={<img src={feed.favicon} alt={feed.name} width={24} height={24} />}
              style={{
                cursor: 'pointer',
                color: theme.palette.mode === 'dark' ? '#fff' : 'black',
                fontWeight: isActive ? 'bold' : 'normal',
                backgroundColor: isActive ? '#F97316' : isHovered ? '#e5debc' : 'transparent',
                borderRadius: '8px',
                transition: 'background-color 0.3s ease'
              }}
              onClick={() => handleMenuClick(feed.slug, feed.name, feed.sourceUrl)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {feed.name}
            </MenuItem>
          )
        })}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
