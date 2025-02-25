import { OpenInNew } from '@mui/icons-material'
import { Tooltip } from '@mui/material'

import { useSettings } from '@core/hooks/useSettings'

const ViewOriginal = ({ activeLink }) => {
  const { settings } = useSettings()

  return (
    <Tooltip title='View Original' arrow placement='left'>
      <a
        href={activeLink || '#'}
        target='_blank'
        rel='noopener noreferrer'
        className={`flex items-center border px-1 py-1 rounded-md ${settings.mode === 'dark' ? 'bg-[#282A42]' : 'bg-white'} cursor-pointer`}
      >
        <OpenInNew fontSize='small' className='text-gray-500' />
      </a>
    </Tooltip>
  )
}

export default ViewOriginal
