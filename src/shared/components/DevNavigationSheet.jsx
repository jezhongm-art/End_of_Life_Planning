import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SCREENS_INFO } from '../wishes'
import { useApp } from '../context/AppContext'
import { Icon } from './SvgIcons'

export function DevNavigationSheet({ isOpen, onClose }) {
  const location = useLocation()
  const { loadBlankPreset, loadSamplePreset } = useApp()

  if (!isOpen) return null

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sh-head">
          <h2>画面一覧・テストデータ切り替え</h2>
          <button
            type="button"
            className="iconbtn"
            onClick={onClose}
            aria-label="閉じる"
          >
            <Icon name="back" stroke />
          </button>
        </div>

        <p className="note" style={{ marginTop: '.45rem' }}>
          3人での分担開発・画面検証用メニューです。担当画面へ直接アクセスできます。
        </p>

        <div className="btn-row" style={{ marginTop: '.65rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => {
              loadBlankPreset()
              onClose()
            }}
          >
            初期・未開始状態にする
          </button>
          <button
            type="button"
            className="btn btn-sub btn-small"
            onClick={() => {
              loadSamplePreset()
              onClose()
            }}
          >
            途中状態のサンプルを適用
          </button>
        </div>

        <ul className="sheetlist">
          {SCREENS_INFO.map((s) => {
            const isCur = location.pathname === s.path
            return (
              <li key={s.path}>
                <Link
                  to={s.path}
                  onClick={onClose}
                  className={isCur ? 'active' : ''}
                >
                  <span className="no">{s.no}</span>
                  <div style={{ flex: 1 }}>
                    <span className="sl-t">
                      {s.name}
                      {s.kind === 'plus' && (
                        <span className="tag tag-plus" style={{ marginLeft: '.45rem' }}>+α</span>
                      )}
                    </span>
                    <span className="sl-d">{s.note}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
