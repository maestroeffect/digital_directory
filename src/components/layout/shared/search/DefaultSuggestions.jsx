// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

const DefaultSuggestions = ({ setOpen, searchHistory }) => {
  const defaultSuggestions = [
    {
      sectionLabel: 'Popular Searches',
      items: searchHistory.map(search => ({
        label: search,
        href: '#',
        icon: 'ri-history-line'
      }))
    }
  ]

  return (
    <div className='flex flex-wrap gap-8 overflow-y-auto'>
      {defaultSuggestions.map((section, index) => (
        <div key={index} className='container p-4 flex flex-col gap-4 basis-full sm:basis-1/2'>
          <p className='text-xs uppercase text-textDisabled'>{section.sectionLabel}</p>
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={item.href}
                  className='flex items-center gap-2 hover:text-primary'
                  onClick={() => setOpen(false)}
                >
                  <i className={classnames(item.icon, 'text-xl')} />
                  <p className='text-[15px]'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
