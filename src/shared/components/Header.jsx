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

  const currentSize = state.textSize || '2'
  const textSizeLabel = {
    '1': '文字:標準',
    '2': '文字:大',
    '3': '文字:特大'
  }[currentSize]

  const textSizeName = {
    '1': '標準',
    '2': '大きめ',
    '3': '特大'
  }[currentSize]

  return (
    <header className="top">
      {shouldShowBack ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flex: 1, minWidth: 0 }}>
          <button
            type="button"
            className="backbtn"
            aria-label="前の画面にもどる"
            onClick={() => navigate(-1)}
          >
            <Icon name="back" stroke />
            <span>もどる</span>
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
          title="文字の大きさを切り替える"
          aria-label={`文字の大きさを切り替える（現在：${textSizeName}）`}
        >
          {textSizeLabel}
        </button>
      </div>
    </header>
  )
}
