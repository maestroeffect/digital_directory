import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'
import axios from 'axios'

import { Menu, MenuItem } from '@menu/vertical-menu'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const [feedSources, setFeedSources] = useState([])
  const router = useRouter()

  // Function to generate slugs from source names
  const generateSlug = name => name.toLowerCase().replace(/\s+/g, '-')

  // Fetch JSON feed
  useEffect(() => {
    const fetchFeedSources = async () => {
      try {
        const response = await axios.get('https://api2.qubicweb.com/v2/feed')

        console.log('API Response:', response.data)

        const feedItems = Array.isArray(response.data.items) ? response.data.items : [] // Ensure array

        console.log('Fetched News Items:', feedItems)

        const feedsMap = new Map()

        feedItems.forEach(item => {
          if (!item.source) return // Skip if source is missing

          const title = item.source
          const slug = generateSlug(title)
          const favicon = item.favicon || `https://icons.duckduckgo.com/ip3/${slug}.com.ico`

          if (!feedsMap.has(title)) {
            feedsMap.set(title, { name: title, slug, favicon })
          }
        })

        const feeds = Array.from(feedsMap.values()).sort((a, b) => a.name.localeCompare(b.name))

        setFeedSources(feeds)
      } catch (error) {
        console.error('Error fetching feed sources:', error)
        setFeedSources([]) // Ensure state is an array
      }
    }

    fetchFeedSources()
  }, [])

  const handleMenuClick = (slug, name) => {
    router.push(`/${slug}?source=${encodeURIComponent(name)}`)
  }

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
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {feedSources.map((feed, index) => (
          <MenuItem
            key={`${feed.name}-${index}`}
            href={`/${feed.slug}`}
            icon={<img src={feed.favicon} alt={feed.name} width='24' height='24' />}
            style={{
              position: 'relative',
              cursor: 'pointer',
              color: theme.palette.mode === 'dark' ? '#fff' : 'inherit'
            }}
            onClick={() => handleMenuClick(feed.slug, feed.name)}
          >
            {feed.name}
          </MenuItem>
        ))}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
