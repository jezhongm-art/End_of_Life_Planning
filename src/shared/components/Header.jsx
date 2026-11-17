import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Icon } from './SvgIcons'

export function Header({ title, showBack, onOpenSheet }) {
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
        <button
          type="button"
          className="iconbtn"
          aria-label="前の画面に戻る"
          onClick={() => navigate(-1)}
        >
          <Icon name="back" stroke />
        </button>
      ) : (
        <Link to="/settings" className="iconbtn" aria-label="設定画面を開く">
          <Icon name="gear" />
        </Link>
      )}

      {title ? (
        <h1 className="vtitle">{title}</h1>
      ) : (
        <Link to="/" className="brandrow">
          <div className="brandmark">
            <Icon name="post" />
          </div>
          <div>
            <div className="brandname">終活みちしるべ</div>
            <span className="brandtag">一歩ずつ進める準備ノート</span>
          </div>
        </Link>
      )}

      <button
        type="button"
        className="iconbtn"
        style={{ width: 'auto', padding: '0 .7rem', fontSize: '.84rem', fontWeight: 800 }}
        onClick={cycleTextSize}
        title="文字サイズを切り替える"
      >
        {textSizeLabel}
      </button>

      {onOpenSheet && (
        <button
          type="button"
          className="iconbtn"
          onClick={onOpenSheet}
          title="画面一覧・開発メニュー"
          aria-label="画面一覧を開く"
        >
          <Icon name="clip" />
        </button>
      )}
    </header>
  )
}
