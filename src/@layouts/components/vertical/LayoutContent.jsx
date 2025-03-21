'use client'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Styled Component Imports
import StyledMain from '@layouts/styles/shared/StyledMain'

const LayoutContent = ({ children }) => {
  // Hooks
  const { settings } = useSettings()

  // Vars
  const contentCompact = settings.contentWidth === 'compact'
  const contentWide = settings.contentWidth === 'wide'

  return (
    <StyledMain
      className={classnames(verticalLayoutClasses.content, 'flex-auto p-0 overflow-hidden full-body-content', {
        [`${verticalLayoutClasses.contentCompact} is-full`]: contentCompact,
        [verticalLayoutClasses.contentWide]: contentWide
      })}

      // isContentCompact={contentCompact}
    >
      {children}
    </StyledMain>
  )
}

export default LayoutContent
