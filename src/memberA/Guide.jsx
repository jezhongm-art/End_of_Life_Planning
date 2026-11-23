import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { Icon } from '../shared/components/SvgIcons'

export default function Guide() {
  const navigate = useNavigate()
  const { state, updateSettings } = useApp()
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
            終活は、これからの人生を安心して、自分らしく楽しむための前向きな準備です。
            一度に全部やろうとせず、できるところから進めていきましょう。
          </p>
        </div>
      </div>

      {/* 3ステップの流れ図 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title">アプリの使いかた（3ステップ）</h3>
        <p className="card-sub">迷わず進められるよう、アプリがナビゲートします。</p>

        <div className="flow">
          <div className="flow-step">
            <span className="flow-num">1</span>
            <div>
              <p style={{ fontWeight: 800, color: 'var(--ink)' }}>簡単な質問に答える</p>
              <p className="note" style={{ marginTop: '.2rem' }}>
                全8問の質問に答えるだけ。分からない質問はパスしても大丈夫です。
              </p>
            </div>
          </div>

          <div className="flow-arrow">▼</div>

          <div className="flow-step">
            <span className="flow-num">2</span>
            <div>
              <p style={{ fontWeight: 800, color: 'var(--ink)' }}>必要な準備が自動で分かる</p>
              <p className="note" style={{ marginTop: '.2rem' }}>
                回答に合わせて、いま優先してやるべきことと理由をご案内します。
              </p>
            </div>
          </div>

          <div className="flow-arrow">▼</div>

          <div className="flow-step">
            <span className="flow-num">3</span>
            <div>
              <p style={{ fontWeight: 800, color: 'var(--ink)' }}>手順と相談先を見て進める</p>
              <p className="note" style={{ marginTop: '.2rem' }}>
                具体的な準備手順や公的窓口の案内をチェックしながら、マイペースに進められます。
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
            <strong>入力データはこの端末のみに保存されます</strong><br />
            外部サーバーには送信されず、設定画面からいつでも一括削除できます。
          </li>
          <li>
            <strong>アンケートを受けなくても使えます</strong><br />
            準備項目一覧から、気になる項目を直接選んで確認することも可能です。
          </li>
          <li>
            <strong>文字サイズはお好みの大きさに変更できます</strong><br />
            右上の文字ボタンまたは設定から、いつでも読みやすい大きさに調節できます。
          </li>
        </ul>
      </section>

      {/* お名前の登録 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>お名前の登録（任意）</h3>
        <p className="card-sub">
          ホーム画面などでご自身に向けた呼びかけとして使用します。ニックネームでも構いません（未入力の場合は「ご利用者」様と表示されます）。
        </p>
        <div style={{ marginTop: '.65rem' }}>
          <input
            type="text"
            className="input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="例：山田 太郎"
            aria-label="お名前"
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
          質問に答えて準備を見つける（推奨）
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={handleGoHome}
        >
          アンケートを受けずにホームへ進む
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
