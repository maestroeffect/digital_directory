'use client'

// React Imports
import { useRef, useState } from 'react'

// Next Imports
import { usePathname, useRouter } from 'next/navigation'

import { signOut, useSession } from 'next-auth/react'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Hook Imports
import { toast, ToastContainer } from 'react-toastify'

import { useSettings } from '@core/hooks/useSettings'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: 'var(--mui-palette-success-main)',
  border: '2px solid var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef(null)
  const pathname = usePathname()

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()

  const handleDropdownOpen = () => setOpen(!open)

  const handleDropdownClose = (event, url) => {
    if (url) router.push(url)
    if (anchorRef.current && anchorRef.current.contains(event?.target)) return
    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/home' })
      toast.success('Sign out successful')
    } catch (error) {
      toast.error('Error signing out. Please try again.')
    }
  }

  const handleBookmarkClick = () => {
    router.push('/my-bookmarks')
  }

  return (
    <>
      <ToastContainer position='top-right' autoClose={3000} />
      <Badge
        overlap='circular'
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
        ref={anchorRef}
      >
        <Avatar
          alt={session?.user?.name || 'User'}
          src={session?.user?.image || '/images/avatars/default.png'}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper
              elevation={settings.skin === 'bordered' ? 0 : 8}
              {...(settings.skin === 'bordered' && { className: 'border' })}
            >
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar
                      alt={session?.user?.name || 'User'}
                      src={session?.user?.image || '/images/avatars/default.png'}
                    />
                    <div className='flex items-start flex-col'>
                      <Typography variant='body2' className='font-medium' color='text.primary'>
                        {session?.user?.name || 'Guest'}
                      </Typography>
                      <Typography variant='caption'>{session?.user?.email || 'No email'}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem
                    className={`gap-3 pli-4 mx-3 ${pathname === '/my-bookmarks' ? 'bg-black rounded-lg text-white' : ''}`}
                    onClick={handleBookmarkClick}
                  >
                    <i className={`ri-bookmark-2-fill `} />
                    <Typography color='text.primary '>My Bookmarks</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-1.5 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleUserLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
