import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from './SvgIcons'

const MORE_PREFIXES = ['/more', '/wishes', '/memories', '/family', '/guide', '/settings']

export function BottomNav() {
  const location = useLocation()
  const p = location.pathname

  const tabs = [
    { to: '/', label: 'ホーム', icon: 'home', stroke: true, active: p === '/' },
    { to: '/items', label: '準備', icon: 'clip', stroke: false, active: p.startsWith('/items') },
    { to: '/survey', label: 'アンケート', icon: 'post', stroke: false, active: p.startsWith('/survey') },
    {
      to: '/more',
      label: 'その他',
      icon: 'menu',
      stroke: false,
      active: MORE_PREFIXES.some((prefix) => p.startsWith(prefix))
    }
  ]

  return (
    <nav className="bottomnav" aria-label="主なメニュー">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={`navbtn ${tab.active ? 'on' : ''}`}
          aria-current={tab.active ? 'page' : undefined}
        >
          <Icon name={tab.icon} stroke={tab.stroke} />
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
