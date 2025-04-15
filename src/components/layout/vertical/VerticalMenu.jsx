import { useState, useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'
import axios from 'axios'

import { hover } from 'motion'

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
  const pathname = usePathname() // ✅ Get the current pathname
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Function to generate slugs from source names
  const generateSlug = name => name.toLowerCase().replace(/\s+/g, '-')

  // Fetch JSON feed
  const fetchFeedSources = async () => {
    try {
      const response = await axios.get('https://api2.qubicweb.com:8082/v2/feed')

      console.log('API Response:', response.data)

      const feedItems = Array.isArray(response.data.items) ? response.data.items : [] // Ensure array

      // console.log('Fetched News Items:', feedItems)

      const feedsMap = new Map()

      feedItems.forEach(item => {
        if (!item.source) return // Skip if source is missing

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'

        const title = item.source
        const slug = generateSlug(title)
        const favicon = item.favicon || `https://icons.duckduckgo.com/ip3/${slug}.com.ico`

        // Generate dynamic source URL
        const sourceUrl = `${baseUrl}/${slug}`

        if (!feedsMap.has(title)) {
          feedsMap.set(title, { name: title, slug, favicon, sourceUrl })
        }
      })

      const feeds = Array.from(feedsMap.values()).sort((a, b) => a.name.localeCompare(b.name))

      setFeedSources(feeds)

      // Store the data in localStorage with the current timestamp
      localStorage.setItem('feedSources', JSON.stringify({ data: feeds, timestamp: new Date().toISOString() }))
    } catch (error) {
      console.error('Error fetching feed sources:', error)
      setFeedSources([]) // Ensure state is an array
    }
  }

  useEffect(() => {
    const now = new Date()
    const cachedData = JSON.parse(localStorage.getItem('feedSources'))
    const cachedTime = cachedData ? new Date(cachedData.timestamp) : null
    const nigeriaTime = now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' })
    const currentHour = new Date(nigeriaTime).getHours()
    const currentMinute = new Date(nigeriaTime).getMinutes()

    if (!cachedData || (cachedTime && new Date() - cachedTime > 24 * 60 * 60 * 1000)) {
      // If cache is expired or doesn't exist, fetch the data
      fetchFeedSources()
    }

    // Only update the cache at 2:30 AM Nigerian time
    if (currentHour === 2 && currentMinute === 30) {
      fetchFeedSources()
    } else if (cachedData && cachedData.data) {
      setFeedSources(cachedData.data)

      // const parsedData = JSON.parse(cachedData)

      // console.log('Found cached data:', cachedData)
    }
  }, [])

  const handleMenuClick = (slug, name, sourceUrl) => {
    router.push(`/${slug}?source=${encodeURIComponent(name)}&sourceUrl=${encodeURIComponent(sourceUrl)}`, {
      scroll: false
    })
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
        {feedSources.map((feed, index) => {
          const isActive = pathname === `/${feed.slug}` // ✅ Check if active
          const isHovered = hoveredIndex === index

          return (
            <MenuItem
              key={`${feed.name}-${index}`}
              href={`/${feed.slug}?source=${encodeURIComponent(feed.name)}&sourceUrl=${encodeURIComponent(feed.sourceUrl)}`}
              icon={<img src={feed.favicon} alt={feed.name} width='24' height='24' />}
              style={{
                position: 'relative',
                cursor: 'pointer',
                color: theme.palette.mode === 'dark' ? '#fff' : 'black',
                fontWeight: isActive ? 'bold' : 'normal', // ✅ Highlight active link
                backgroundColor: isActive ? '#F97316' : isHovered ? 'pink' : 'transparent',
                borderRadius: '8px' // Optional: Smooth highlight
              }}
              onClick={() => handleMenuClick(feed.slug, feed.name, feed.sourceUrl)}
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
