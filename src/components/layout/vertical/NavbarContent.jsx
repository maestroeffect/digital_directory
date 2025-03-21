'use client'

// Third-party Imports
import classnames from 'classnames'

import { useSession } from 'next-auth/react'

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
import FontControl from '../shared/FontControl'
import { useNews } from '@/context/NewsContext'

const NavbarContent = () => {
  const { fontSize, setFontSize, newsData, activeId } = useNews() // ✅ Get fontSize from context

  // Get the active news item
  const activeNews = newsData.find(news => news.id === activeId)
  const activeLink = activeNews ? activeNews.link : ''

  // Use the `useSession` hook from next-auth to get session data client-side
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return null // Or return null to show nothing while loading
  }

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
        <FontControl fontSize={fontSize} setFontSize={setFontSize} />
        {/* ✅ Pass the active link to ViewOriginal & ShareButton */}
        <ViewOriginal activeLink={activeLink} />
        <ShareButton activeLink={activeLink} />
        {/* <LoginButton /> */}
        {status === 'unauthenticated' ? <LoginButton /> : <UserDropdown />}
        {/* <UserDropdown /> */}
      </div>
    </div>
  )
}

export default NavbarContent
