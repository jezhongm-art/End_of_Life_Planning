import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from './SvgIcons'

export function BottomNav() {
  const location = useLocation()
  const p = location.pathname

  const tabs = [
    { to: '/', label: 'ホーム', icon: 'home', stroke: true, active: p === '/' },
    { to: '/items', label: '準備', icon: 'clip', stroke: false, active: p.startsWith('/items') },
    { to: '/wishes', label: '楽しみ', icon: 'star', stroke: false, active: p.startsWith('/wishes') },
    { to: '/memories', label: '思い出', icon: 'heart', stroke: false, active: p.startsWith('/memories') },
    { to: '/family', label: '家族', icon: 'people', stroke: false, active: p.startsWith('/family') }
  ]

  return (
    <nav className="bottomnav" aria-label="主なメニュー">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={`navbtn ${tab.active ? 'on' : ''}`}
        >
          <Icon name={tab.icon} stroke={tab.stroke} />
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
