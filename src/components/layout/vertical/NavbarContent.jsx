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

const NavbarContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        <NavSearch />
      </div>
      <div className='flex items-center gap-3'>
        <LanguageDropdown />
        <ModeDropdown />
        <LoginButton />
        <SignUpButton />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
