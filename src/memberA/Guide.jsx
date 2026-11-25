import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { QUIZ_FLOW_RANGE } from '../memberC/rules'
import { Icon } from '../shared/components/SvgIcons'

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
    const trimmed = nameInput.trim()
    updateSettings({
      name: trimmed,
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

  const handleGoItems = () => {
    saveNameAndComplete()
    navigate('/items')
  }

  return (
    <div className="screen-anim">
      {/* 導入 */}
      <div className="notice notice-teal">
        <div className="n-ic">
          <Icon name="post" />
        </div>
        <div className="n-body">
          <h2 className="n-title">終活みちしるべへようこそ</h2>
          <p className="n-sub">
            これからの毎日を安心して楽しむための準備ノートです。一度に全部やらず、できることから一つずつ進められます。
          </p>
        </div>
      </div>

      {/* 文字の大きさ調整（最初に選べるように上部に配置） */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>
          文字の大きさ（いつでも変えられます）
        </h3>
        <p className="card-sub">読みやすい大きさをお選びください。</p>
        <div
          className="segtabs segtabs-3"
          style={{ marginTop: '.65rem', marginBottom: 0 }}
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

      {/* 3つの流れ（簡潔に整理） */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title">使いかた（3つの流れ）</h3>

        <div className="flow">
          <div className="flow-step">
            <span className="flow-num">1</span>
            <div>
              <p style={{ fontWeight: 800, color: 'var(--ink)' }}>簡単な質問に答える</p>
              <p className="note" style={{ marginTop: '.15rem' }}>
                暮らしに合わせて{QUIZ_FLOW_RANGE.min}〜{QUIZ_FLOW_RANGE.max}問の質問が出ます。わからない質問は飛ばせます。
              </p>
            </div>
          </div>

          <div className="flow-step">
            <span className="flow-num">2</span>
            <div>
              <p style={{ fontWeight: 800, color: 'var(--ink)' }}>いま必要な準備がわかる</p>
              <p className="note" style={{ marginTop: '.15rem' }}>
                お答えに合わせて、優先したい準備と理由をご案内します。
              </p>
            </div>
          </div>

          <div className="flow-step">
            <span className="flow-num">3</span>
            <div>
              <p style={{ fontWeight: 800, color: 'var(--ink)' }}>手順と相談先を見て進める</p>
              <p className="note" style={{ marginTop: '.15rem' }}>
                最初の一歩から、ご自身のペースで進められます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 安心のポイント */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title">安心してご利用いただくために</h3>
        <ul className="stepnum" style={{ marginTop: '.4rem' }}>
          <li>
            <strong>入力した内容はこの端末の中だけに保存されます</strong><br />
            外に送信されることはなく、設定からいつでもすべて消去できます。
          </li>
          <li>
            <strong>アンケートを受けなくても使えます</strong><br />
            準備項目の一覧から、気になる項目を直接選んで確認できます。
          </li>
        </ul>
      </section>

      {/* お名前の登録 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>
          <label htmlFor="guide-name-input">お名前の登録（書かなくても進めます）</label>
        </h3>
        <p className="card-sub">
          ホーム画面の呼びかけに使います。ニックネームでも構いません。
        </p>
        <div style={{ marginTop: '.65rem' }}>
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

      {/* アクションボタン */}
      <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={handleStartSurvey}
        >
          質問に答えて準備を見つける（おすすめ）
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={handleGoHome}
        >
          質問を飛ばしてホームへ進む
        </button>

        <div style={{ textAlign: 'center', marginTop: '.3rem' }}>
          <button
            type="button"
            onClick={handleGoItems}
            className="note"
            style={{
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '.9rem',
              color: 'var(--muted)',
              fontFamily: 'inherit'
            }}
          >
            準備項目の一覧を直接見る →
          </button>
        </div>
      </div>
    </div>
  )
}
