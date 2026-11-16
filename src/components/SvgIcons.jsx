import React from 'react'

export function SvgSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="i-post" viewBox="0 0 24 24"><path d="M11 2h2v20h-2z"/><path d="M4 5h13l3 2.5L17 10H4z"/><path d="M20 12H7l-3 2.5L7 17h13z"/></symbol>
        <symbol id="i-clip" viewBox="0 0 24 24"><rect x="5.5" y="4" width="13" height="17" rx="2.4"/><path d="M9.2 3h5.6v2.6H9.2z"/><path d="M9 11l1.9 1.9 4-4M9 16l1.9 1.9 4-4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 21.1l-1.4-1.3C5.4 15.1 2 12 2 8.3 2 5.3 4.4 2.9 7.4 2.9c1.7 0 3.4.8 4.6 2.1 1.2-1.3 2.9-2.1 4.6-2.1 3 0 5.4 2.4 5.4 5.4 0 3.7-3.4 6.8-8.6 11.5z"/></symbol>
        <symbol id="i-people" viewBox="0 0 24 24"><circle cx="8.9" cy="7.9" r="3.5"/><path d="M2.6 19.6C3 16.1 5.7 14 8.9 14s5.9 2.1 6.3 5.6z"/><circle cx="17" cy="9.3" r="2.8"/><path d="M15.9 14.6c2.4-.5 4.9 1.1 5.5 5h-5.1c-.1-1.9-.3-3.5-1-4.4z"/></symbol>
        <symbol id="i-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5"/><path d="M10.8 1.8h2.4V6h-2.4zM10.8 18h2.4v4.2h-2.4zM1.8 10.8H6v2.4H1.8zM18 10.8h4.2v2.4H18zM4.6 4.6l1.7-1.7 3 3-1.7 1.7zM14.7 14.7l1.7-1.7 3 3-1.7 1.7zM4.6 19.4l-1.7-1.7 3-3 1.7 1.7zM14.7 9.3l-1.7-1.7 3-3 1.7 1.7z"/></symbol>
        <symbol id="i-home" viewBox="0 0 24 24"><path d="M3.8 11.2 12 4l8.2 7.2M6.4 9.6V20h11.2V9.6" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        <symbol id="i-back" viewBox="0 0 24 24"><path d="M19.5 12H5.4M11 5.4 4.4 12 11 18.6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        <symbol id="i-chev" viewBox="0 0 24 24"><path d="M9 5.4 15.6 12 9 18.6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="M4.5 12.6 9.6 18 19.5 6.6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M12 2.6a6.2 6.2 0 0 1 3.7 11.2c-.7.55-1.1 1.3-1.1 2.2h-5.2c0-.9-.4-1.65-1.1-2.2A6.2 6.2 0 0 1 12 2.6z"/><rect x="9.6" y="17.3" width="4.8" height="1.7" rx=".85"/><rect x="10.3" y="19.7" width="3.4" height="1.5" rx=".75"/></symbol>
        <symbol id="i-photo" viewBox="0 0 24 24"><rect x="3.4" y="4.8" width="17.2" height="14.4" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.9"/><circle cx="9" cy="10" r="1.8" fill="currentColor"/><path d="M5.4 17l4.3-4.8 3.3 3.8 2.4-2.8 3.4 3.8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/></symbol>
        <symbol id="i-pencil" viewBox="0 0 24 24"><path d="M4 20l1.1-4.2L16.4 4.5a2.15 2.15 0 0 1 3.1 3.1L8.2 18.9z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M14.6 6.4l3 3" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></symbol>
        <symbol id="i-share" viewBox="0 0 24 24"><circle cx="6" cy="12" r="3"/><circle cx="17.5" cy="5.5" r="3"/><circle cx="17.5" cy="18.5" r="3"/><path d="M8.7 10.6 15 6.9M8.7 13.4 15 17.1" fill="none" stroke="currentColor" strokeWidth="2"/></symbol>
        <symbol id="i-speaker" viewBox="0 0 24 24"><path d="M4 9.5h3.5L13 5v14l-5.5-4.5H4z"/><path d="M16 9c1.4 1.6 1.4 4.4 0 6M18.5 6.5c2.6 3 2.6 8 0 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></symbol>
        <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9z"/></symbol>
        <symbol id="i-book" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></symbol>
      </defs>
    </svg>
  )
}

export function Icon({ name, stroke = false, className = '' }) {
  const iconClass = stroke ? 'ic-s' : 'ic'
  const id = name.startsWith('i-') ? name : `i-${name}`
  return (
    <svg className={`${iconClass} ${className}`.trim()} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}
