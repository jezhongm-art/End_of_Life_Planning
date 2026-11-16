import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { WISH_PRESETS } from '../data/wishes'
import { Icon } from '../components/SvgIcons'

export default function WishList() {
  const { state, addWish, toggleWish, setRewardWish } = useApp()
  const [inputText, setInputText] = useState('')

  const handleAddCustom = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    addWish(inputText.trim())
    setInputText('')
  }

  const handleAddPreset = (text) => {
    addWish(text)
  }

  const rewardWish = state.wishes.find((w) => w.id === state.rewardWishId)

  return (
    <div className="screen-anim">
      {/* 画面説明 */}
      <section className="card">
        <h2 className="card-title">やってみたいことリスト</h2>
        <p className="card-sub">
          行きたい場所や家族と楽しみたいことを登録しましょう。
          準備が進んだときのごほうびとして設定することもできます。
        </p>

        {rewardWish && (
          <div className="celebrate" style={{ marginTop: '.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <Icon name="star" style={{ color: 'var(--amber)' }} />
              <strong style={{ color: 'var(--amber)' }}>現在のごほうび目標</strong>
            </div>
            <p style={{ fontWeight: 800, fontSize: '1.08rem', marginTop: '.3rem' }}>
              {rewardWish.text}
            </p>
          </div>
        )}
      </section>

      {/* 候補から簡単に追加 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1rem' }}>人気の楽しみから選ぶ</h3>
        <p className="card-sub">タップするだけですぐにリストへ追加できます。</p>
        <div className="chips">
          {WISH_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="chip"
              onClick={() => handleAddPreset(p)}
            >
              ＋ {p}
            </button>
          ))}
        </div>
      </section>

      {/* 自由入力フォーム */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1rem' }}>自分で自由に入力する</h3>
        <form onSubmit={handleAddCustom} style={{ marginTop: '.6rem' }}>
          <input
            type="text"
            className="input"
            placeholder="例）孫と一緒に動物園へ行く"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: '.7rem' }}
            disabled={!inputText.trim()}
          >
            リストに追加する
          </button>
        </form>
      </section>

      {/* 登録済みリスト */}
      <h3 className="sec-title" style={{ marginTop: '1.4rem' }}>
        登録したやってみたいこと（{state.wishes.length}件）
      </h3>

      {state.wishes.length === 0 ? (
        <div className="empty">まだ登録された楽しみはありません。上の候補や入力欄から追加してみましょう。</div>
      ) : (
        state.wishes.map((w) => {
          const isReward = state.rewardWishId === w.id
          return (
            <div
              key={w.id}
              className={`wishcard ${isReward ? 'is-reward' : ''} ${w.done ? 'is-done' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.65rem' }}>
                <input
                  type="checkbox"
                  style={{ width: '1.35rem', height: '1.35rem', marginTop: '.3rem', accentColor: 'var(--brand)' }}
                  checked={w.done}
                  onChange={() => toggleWish(w.id)}
                />
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: '1.02rem',
                      fontWeight: 700,
                      textDecoration: w.done ? 'line-through' : 'none',
                      color: w.done ? 'var(--muted)' : 'var(--ink)'
                    }}
                  >
                    {w.text}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                    {isReward ? (
                      <span className="tag tag-amber">
                        <Icon name="star" style={{ width: '.9rem', height: '.9rem' }} /> ごほうび設定中
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        style={{ minHeight: '2.2rem', padding: '0 .7rem', fontSize: '.8rem' }}
                        onClick={() => setRewardWish(w.id)}
                      >
                        ごほうびに設定
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
