'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import NavSearch from '@components/layout/shared/search'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import LoginButton from '../shared/LoginButton'
import SignUpButton from '../shared/SignUpButton'
import FontSizeControl from '../shared/FontSizeControl'
import ViewOriginal from '../shared/ViewOriginal'
import ShareButton from '../shared/ShareButton'

const NavbarContent = ({ fontSize, setFontSize, activeLink }) => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        <NavSearch />

        {/* <FontSizeControl fontSize={fontSize} setFontSize={setFontSize} />
        <ViewOriginal activeLink={activeLink} />
        <ShareButton activeLink={activeLink} /> */}
      </div>
      <div className='flex items-center gap-3'>
        <LanguageDropdown />
        <ModeDropdown />
        <LoginButton />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
