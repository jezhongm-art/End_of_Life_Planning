import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Icon } from './SvgIcons'

export function Header({ title, showBack }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, cycleTextSize } = useApp()

  const isHome = location.pathname === '/'
  const shouldShowBack = showBack !== undefined ? showBack : !isHome

  const textSizeLabel = {
    '1': '文字:標準',
    '2': '文字:大',
    '3': '文字:特大'
  }[state.textSize || '2']

  return (
    <header className="top">
      {shouldShowBack ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flex: 1, minWidth: 0 }}>
          <button
            type="button"
            className="iconbtn"
            aria-label="前の画面に戻る"
            onClick={() => navigate(-1)}
          >
            <Icon name="back" stroke />
          </button>
          <h1 className="vtitle">{title}</h1>
        </div>
      ) : (
        <Link to="/" className="brandrow">
          <div className="brandmark">
            <Icon name="post" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="brandname">終活みちしるべ</div>
            <span className="brandtag">一歩ずつ進める準備ノート</span>
          </div>
        </Link>
      )}

      <div className="top-actions">
        <button
          type="button"
          className="textsize-btn"
          onClick={cycleTextSize}
          title="文字サイズを切り替える"
          aria-label="文字サイズを切り替える"
        >
          {textSizeLabel}
        </button>

        <Link to="/settings" className="iconbtn" aria-label="設定画面を開く">
          <Icon name="gear" />
        </Link>
      </div>
    </header>
  )
}
