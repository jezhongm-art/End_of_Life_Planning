import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { Icon } from '../shared/components/SvgIcons'

export default function Settings() {
  const navigate = useNavigate()
  const { state, updateSettings, setTextSize, resetAllData } = useApp()

  const [nameInput, setNameInput] = useState(state.name || '')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSaveName = (e) => {
    e.preventDefault()
    updateSettings({ name: nameInput.trim() })
  }

  const handleReset = () => {
    resetAllData()
    setShowConfirm(false)
    navigate('/')
  }

  return (
    <div className="screen-anim">
      <section className="card">
        <h2 className="card-title">基本設定</h2>
        <p className="card-sub">
          お名前や文字サイズの変更、保存データの管理を行います。
        </p>
      </section>

      {/* お名前設定 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>お名前</h3>
        <p className="card-sub">ホーム画面などで表示されるお名前です。</p>

        <form onSubmit={handleSaveName} style={{ marginTop: '.6rem' }}>
          <input
            type="text"
            className="input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="山田 花子"
          />
          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: '.7rem' }}
          >
            お名前を保存する
          </button>
        </form>
      </section>

      {/* 文字サイズ変更 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>文字サイズ</h3>
        <p className="card-sub">アプリ全体の文字サイズを切り替えます。</p>

        <div className="segtabs" style={{ marginTop: '.7rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <button
            type="button"
            className={`segtab ${state.textSize === '1' ? 'on' : ''}`}
            onClick={() => setTextSize('1')}
          >
            標準（17px）
          </button>
          <button
            type="button"
            className={`segtab ${state.textSize === '2' ? 'on' : ''}`}
            onClick={() => setTextSize('2')}
          >
            大きめ（19px）
          </button>
          <button
            type="button"
            className={`segtab ${state.textSize === '3' ? 'on' : ''}`}
            onClick={() => setTextSize('3')}
          >
            特大（21.5px）
          </button>
        </div>
      </section>

      {/* 初回案内の見直し */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>初回案内の見直し</h3>
        <p className="card-sub">
          アプリの概要や3ステップの流れをもう一度確認できます。
        </p>
        <div style={{ marginTop: '.7rem' }}>
          <Link to="/guide" className="btn btn-ghost btn-block">
            初回案内を見直す
          </Link>
        </div>
      </section>

      {/* データ削除 */}
      <section className="card" style={{ marginTop: '1rem', borderColor: 'var(--rose)' }}>
        <h3 className="card-title" style={{ color: 'var(--rose)', fontSize: '1.04rem' }}>
          データの全削除（初期化）
        </h3>
        <p className="card-sub">
          このブラウザに保存されている進捗・アンケート回答・メモをすべて消去します。
        </p>
        <div style={{ marginTop: '.7rem' }}>
          <button
            type="button"
            className="btn btn-danger btn-block"
            onClick={() => setShowConfirm(true)}
          >
            保存データをすべて初期化する
          </button>
        </div>
      </section>

      {/* 確認ダイアログ */}
      {showConfirm && (
        <div className="overlay center" role="dialog" aria-modal="true">
          <div className="dialog">
            <h2>すべてのデータを削除しますか？</h2>
            <p>
              この操作を行うと、これまでに登録した準備の進捗、アンケートの回答、思い出などのデータがすべて消去され、初期状態に戻ります。
            </p>
            <div className="btn-row" style={{ marginTop: '1.2rem' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowConfirm(false)}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleReset}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
