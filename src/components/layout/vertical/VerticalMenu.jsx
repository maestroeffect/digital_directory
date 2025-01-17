import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Menu, MenuItem } from '@menu/vertical-menu'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Importing react-dnd hooks
import { useDrag, useDrop } from 'react-dnd'

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

  // // Drag-and-drop state
  // const [draggedItem, setDraggedItem] = useState(null)

  // // Handle dragging and dropping
  // const [, drop] = useDrop({
  //   accept: 'menuItem',
  //   drop: item => {
  //     setDraggedItem(item)
  //     // Handle rearranging logic here
  //   }
  // })

  // const [, drag] = useDrag({
  //   type: 'menuItem',
  //   item: { id: 'menuItem1' } // Unique identifier for each item
  // })

  const handleDelete = item => {
    console.log(`Delete ${item}`)
    // Add your delete logic here
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
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* <MenuItem href='/home' icon={<i className='ri-home-smile-line' />} style={{ position: 'relative' }}>
          Home
          <span
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0,
              transition: 'opacity 0.3s'
            }}
            className='ri-delete-bin-line'
            onClick={() => console.log('Delete Home')}
          />
        </MenuItem>

        <MenuItem href='/about' icon={<i className='ri-information-line' />} style={{ position: 'relative' }}>
          About
          <span
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0,
              transition: 'opacity 0.3s'
            }}
            className='ri-delete-bin-line'
            onClick={() => console.log('Delete About')}
          />
        </MenuItem> */}

        <MenuItem
          href='/home'
          icon={<i className='ri-home-smile-line' />}
          style={{
            position: 'relative',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            const trashIcon = e.target.querySelector('.ri-delete-bin-line')
            if (trashIcon) {
              trashIcon.style.opacity = 1
            }
          }}
          onMouseLeave={e => {
            const trashIcon = e.target.querySelector('.ri-delete-bin-line')
            if (trashIcon) {
              trashIcon.style.opacity = 0
            }
          }}
        >
          Home
          <span
            className='ri-delete-bin-line'
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0,
              transition: 'opacity 0.3s'
            }}
            onClick={e => {
              e.stopPropagation() // Prevent click from propagating to the MenuItem
              handleDelete('Home')
            }}
          />
        </MenuItem>

        <MenuItem
          href='/about'
          icon={<i className='ri-information-line' />}
          style={{
            position: 'relative',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            const trashIcon = e.target.querySelector('.ri-delete-bin-line')
            if (trashIcon) {
              trashIcon.style.opacity = 1
            }
          }}
          onMouseLeave={e => {
            const trashIcon = e.target.querySelector('.ri-delete-bin-line')
            if (trashIcon) {
              trashIcon.style.opacity = 0
            }
          }}
        >
          About
          <span
            className='ri-delete-bin-line'
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0,
              transition: 'opacity 0.3s'
            }}
            onClick={e => {
              e.stopPropagation() // Prevent click from propagating to the MenuItem
              handleDelete('About')
            }}
          />
        </MenuItem>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
