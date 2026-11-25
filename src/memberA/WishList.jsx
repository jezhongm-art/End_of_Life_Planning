import React, { useState, useRef } from 'react'
import { useApp } from '../shared/context/AppContext'
import { WISH_PRESETS } from '../shared/wishes'
import { Icon } from '../shared/components/SvgIcons'
import { AccessibleDialog } from '../shared/components/AccessibleDialog'

export default function WishList() {
  const { state, addWish, toggleWish, setRewardWish, deleteWish } = useApp()
  const [inputText, setInputText] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const cancelRef = useRef(null)

  const handleAddCustom = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    const ok = addWish(inputText.trim())
    if (ok) {
      setInputText('')
    }
  }

  const handleAddPreset = (text) => {
    addWish(text)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteWish(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const rewardWish = state.wishes.find((w) => w.id === state.rewardWishId)

  return (
    <div className="screen-anim">
      {/* 画面説明 */}
      <section className="card">
        <h2 className="card-title">やってみたいこと一覧</h2>
        <p className="card-sub">
          行きたい場所や家族と楽しみたいことを書き出しましょう。
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
        <h3 className="card-title" style={{ fontSize: '1rem' }}>
          <label htmlFor="wish-custom-input">自分で自由に入力する</label>
        </h3>
        <form onSubmit={handleAddCustom} style={{ marginTop: '.6rem' }}>
          <input
            id="wish-custom-input"
            type="text"
            className="input"
            placeholder="例）家族と一緒に動物園へ行く"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: '.7rem' }}
            disabled={!inputText.trim()}
          >
            一覧に追加する
          </button>
        </form>
      </section>

      {/* 登録済み一覧 */}
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
                  style={{ width: '1.35rem', height: '1.35rem', marginTop: '.3rem', accentColor: 'var(--brand)', flex: 'none' }}
                  checked={w.done}
                  onChange={() => toggleWish(w.id)}
                  aria-label={`「${w.text}」を達成済みにする`}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
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
                    {w.done && (
                      <span className="tag tag-brand" style={{ fontWeight: 800 }}>
                        ✓ 達成済み
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.6rem', flexWrap: 'wrap', gap: '.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                      {isReward ? (
                        <span className="tag tag-amber">
                          <Icon name="star" style={{ width: '.9rem', height: '.9rem' }} /> ごほうび設定中
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost btn-small"
                          style={{ minHeight: '2.35rem', padding: '0 .75rem', fontSize: '.84rem' }}
                          onClick={() => setRewardWish(w.id)}
                        >
                          ごほうびに設定
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      style={{
                        minHeight: '2.35rem',
                        padding: '0 .75rem',
                        fontSize: '.84rem',
                        color: 'var(--rose)'
                      }}
                      onClick={() => setDeleteTarget(w)}
                      aria-label={`${w.text}を削除`}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}

      <AccessibleDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="やってみたいことを削除しますか？"
        description={
          deleteTarget
            ? `「${deleteTarget.text}」をリストから削除します。`
            : undefined
        }
        initialFocusRef={cancelRef}
      >
        <div className="btn-row" style={{ marginTop: '1.2rem' }}>
          <button
            ref={cancelRef}
            type="button"
            className="btn btn-ghost"
            onClick={() => setDeleteTarget(null)}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmDelete}
          >
            削除する
          </button>
        </div>
      </AccessibleDialog>
    </div>
  )
}
