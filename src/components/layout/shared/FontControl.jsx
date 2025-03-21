'use client'

import { useState } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import ClickAwayListener from '@mui/material/ClickAwayListener'

const FontControl = ({ fontSize, setFontSize }) => {
  const [open, setOpen] = useState(false)

  const toggleOpen = () => setOpen(prev => !prev)
  const increaseFont = () => setFontSize(prev => prev + 2, 100)
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 2, 10))

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div style={{ position: 'relative' }}>
        <Tooltip title='Font Control'>
          <IconButton onClick={toggleOpen} className='text-textPrimary'>
            <i className='ri-font-size' />
          </IconButton>
        </Tooltip>
        {open && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: 'white',
              padding: '10px',
              borderRadius: '5px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'row',
              gap: '10px'
            }}
          >
            <IconButton onClick={increaseFont}>
              <i className='ri-add-line' />
            </IconButton>
            <IconButton onClick={decreaseFont}>
              <i className='ri-subtract-line' />
            </IconButton>
          </div>
        )}
      </div>
    </ClickAwayListener>
  )
}

export default FontControl
