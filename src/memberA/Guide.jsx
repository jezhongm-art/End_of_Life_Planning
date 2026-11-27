import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { QUIZ_FLOW_RANGE } from '../memberC/rules'

const TEXT_SIZE_OPTIONS = [
  { id: '1', label: '標準' },
  { id: '2', label: '大きめ' },
  { id: '3', label: '特大' }
]

export default function Guide() {
  const navigate = useNavigate()
  const { state, updateSettings, setTextSize } = useApp()
  const [nameInput, setNameInput] = useState(state.name || '')

  const saveNameAndComplete = () => {
    updateSettings({
      name: nameInput.trim(),
      seenGuide: true
    })
  }

  const handleStartSurvey = () => {
    saveNameAndComplete()
    navigate('/survey')
  }

  const handleGoHome = () => {
    saveNameAndComplete()
    navigate('/')
  }

  return (
    <div className="screen-anim">
      <div className="plain-head">
        <h2 className="plain-title">終活みちしるべへようこそ</h2>
        <p className="plain-lead">
          これからの毎日を安心して楽しむための準備ノートです。できることから一つずつ進められます。
        </p>
      </div>

      {/* 文字の大きさ調整 */}
      <section className="card" style={{ marginTop: '.5rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>
          文字の大きさ（いつでも変えられます）
        </h3>
        <div
          className="segtabs segtabs-3"
          style={{ marginTop: '.6rem', marginBottom: 0 }}
          role="group"
          aria-label="文字の大きさの選択"
        >
          {TEXT_SIZE_OPTIONS.map((opt) => {
            const isSelected = (state.textSize || '2') === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                className={`segtab ${isSelected ? 'on' : ''}`}
                aria-pressed={isSelected}
                onClick={() => setTextSize(opt.id)}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* 3つの流れをすっきり表示 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title">このアプリの流れ</h3>
        <ol className="stepnum" style={{ marginTop: '.5rem' }}>
          <li>
            <strong>簡単な質問に答える</strong>（{QUIZ_FLOW_RANGE.min}〜{QUIZ_FLOW_RANGE.max}問・わからない所は飛ばせます）
          </li>
          <li>
            <strong>いま必要な準備がわかる</strong>（優先して始めるものが決まります）
          </li>
          <li>
            <strong>1手順ずつ進める</strong>（お答えはこの端末内だけに安全に保存されます）
          </li>
        </ol>
      </section>

      {/* お名前（任意） */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.02rem' }}>
          <label htmlFor="guide-name-input">お名前（書かなくても進めます）</label>
        </h3>
        <div style={{ marginTop: '.55rem' }}>
          <input
            id="guide-name-input"
            type="text"
            className="input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="例：ニックネームやお名前"
          />
        </div>
      </section>

      {/* 迷わない誘導ボタン */}
      <div style={{ marginTop: '1.15rem', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={handleStartSurvey}
        >
          質問に答えてはじめる（おすすめ）
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={handleGoHome}
        >
          質問を飛ばしてホームへ進む
        </button>
      </div>
    </div>
  )
}
