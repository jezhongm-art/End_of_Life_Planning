import React, { useState } from 'react'
import { useApp } from '../shared/context/AppContext'
import { TALK_TOPICS } from '../shared/wishes'
import { Icon } from '../shared/components/SvgIcons'

export default function FamilyTalk() {
  const { state, addTalkLog, updateRewardConsult } = useApp()

  const [partner, setPartner] = useState('長女')
  const [decided, setDecided] = useState('')
  const [pending, setPending] = useState('')
  const [memo, setMemo] = useState('')
  const [topicIdx, setTopicIdx] = useState(0)

  // ごほうび相談
  const rewardWish = state.wishes.find((w) => w.id === state.rewardWishId)
  const consult = state.rewardConsult

  const handleSaveLog = (e) => {
    e.preventDefault()
    if (!partner.trim()) return
    addTalkLog({
      partner: partner.trim(),
      decided: decided.trim(),
      pending: pending.trim(),
      memo: memo.trim()
    })
    setDecided('')
    setPending('')
    setMemo('')
  }

  const handleSendConsult = () => {
    updateRewardConsult({
      status: 'pending',
      wishText: rewardWish ? rewardWish.text : '温泉旅行',
      message: `準備の区切りがついたので、家族みんなで「${rewardWish ? rewardWish.text : 'お祝い'}」を相談したいです。`
    })
  }

  const handleSimulateReply = () => {
    updateRewardConsult({
      status: 'replied',
      replyText: '準備お疲れさまでした！ぜひみんなでお祝いしましょう。来月の週末に日程を合わせますね。'
    })
  }

  return (
    <div className="screen-anim">
      {/* 画面説明 */}
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <h2 className="card-title">家族との対話・ごほうび相談</h2>
          <span className="tag tag-plus">+α機能</span>
        </div>
        <p className="card-sub">
          話し合った内容を記録し、準備の達成後に楽しみを家族にお願いできます。
        </p>
      </section>

      {/* 話題のきっかけ */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1rem' }}>おすすめの話題</h3>
        <p className="card-sub">切り出しやすい質問のきっかけです。</p>

        <div className="qbubble" style={{ marginTop: '.6rem' }}>
          {TALK_TOPICS[topicIdx]}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '.5rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => setTopicIdx((prev) => (prev + 1) % TALK_TOPICS.length)}
          >
            別の話題を見る
          </button>
        </div>
      </section>

      {/* ごほうび相談カード */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1rem' }}>ごほうび相談（家族へのお願い）</h3>
        <p className="card-sub">
          準備の達成をきっかけに、家族にお祝いや楽しみを相談できます。
        </p>

        {consult.status === 'none' ? (
          <div style={{ marginTop: '.7rem' }}>
            <p className="note">
              目標：<strong>{rewardWish ? rewardWish.text : '家族でのお祝い'}</strong>
            </p>
            <button
              type="button"
              className="btn btn-amber btn-block"
              style={{ marginTop: '.6rem' }}
              onClick={handleSendConsult}
            >
              家族にごほうびのお願いを送信する（相談）
            </button>
          </div>
        ) : consult.status === 'pending' ? (
          <div className="notice notice-amber" style={{ marginTop: '.7rem' }}>
            <div className="n-ic">
              <Icon name="star" />
            </div>
            <div className="n-body">
              <p className="n-title">家族へのお願いを送信中</p>
              <p className="n-sub">「{consult.wishText}」について家族へ相談中です。</p>
              <div style={{ marginTop: '.6rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={handleSimulateReply}
                >
                  【シミュレーション】家族からの返答を受信する
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="celebrate" style={{ marginTop: '.7rem' }}>
            <p style={{ fontWeight: 800, color: 'var(--amber)' }}>
              💌 家族からお返事が届きました！
            </p>
            <p style={{ marginTop: '.3rem', fontSize: '.96rem' }}>
              「{consult.replyText}」
            </p>
          </div>
        )}
      </section>

      {/* 話し合いの記録フォーム */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1rem' }}>話し合いを記録する</h3>
        <form onSubmit={handleSaveLog} style={{ marginTop: '.7rem' }}>
          <div>
            <label className="card-sub" style={{ fontWeight: 700 }}>話した相手</label>
            <input
              type="text"
              className="input"
              style={{ marginTop: '.3rem' }}
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              placeholder="例）結子（長女）"
            />
          </div>

          <div style={{ marginTop: '.8rem' }}>
            <label className="card-sub" style={{ fontWeight: 700 }}>決まったこと</label>
            <input
              type="text"
              className="input"
              style={{ marginTop: '.3rem' }}
              value={decided}
              onChange={(e) => setDecided(e.target.value)}
              placeholder="例）緊急連絡先は長女にすることにした"
            />
          </div>

          <div style={{ marginTop: '.8rem' }}>
            <label className="card-sub" style={{ fontWeight: 700 }}>保留・次回話すこと</label>
            <input
              type="text"
              className="input"
              style={{ marginTop: '.3rem' }}
              value={pending}
              onChange={(e) => setPending(e.target.value)}
              placeholder="例）お墓の希望は来月もう一度話す"
            />
          </div>

          <div style={{ marginTop: '.8rem' }}>
            <label className="card-sub" style={{ fontWeight: 700 }}>メモ</label>
            <div className="field" style={{ marginTop: '.3rem' }}>
              <textarea
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="話して感じたことや補足など"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: '1rem' }}
            disabled={!partner.trim()}
          >
            対話ログを記録する
          </button>
        </form>
      </section>

      {/* 過去の記録 */}
      <h3 className="sec-title" style={{ marginTop: '1.4rem' }}>
        これまでの話し合い記録（{state.talkLogs.length}件）
      </h3>

      {state.talkLogs.length === 0 ? (
        <div className="empty">まだ記録はありません。</div>
      ) : (
        state.talkLogs.map((log) => (
          <div key={log.id} className="card" style={{ marginTop: '.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1.02rem' }}>相手：{log.partner}</strong>
              <span className="smallcap">{log.date}</span>
            </div>

            {log.decided && (
              <p className="note" style={{ marginTop: '.4rem' }}>
                <strong style={{ color: 'var(--brand-deep)' }}>【決まったこと】</strong> {log.decided}
              </p>
            )}

            {log.pending && (
              <p className="note" style={{ marginTop: '.2rem' }}>
                <strong style={{ color: 'var(--amber)' }}>【保留】</strong> {log.pending}
              </p>
            )}

            {log.memo && (
              <p className="note" style={{ marginTop: '.2rem' }}>
                <strong>【メモ】</strong> {log.memo}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  )
}
