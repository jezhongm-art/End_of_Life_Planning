import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { TALK_TOPICS } from '../shared/wishes'
import { Icon } from '../shared/components/SvgIcons'
import { AccessibleDialog } from '../shared/components/AccessibleDialog'

const FAMILY_TABS = [
  { id: 'topics', label: '話題・相談練習' },
  { id: 'write', label: '記録を書く' },
  { id: 'logs', label: (count) => `過去の記録（${count}）` }
]

export default function FamilyTalk() {
  const { state, addTalkLog, deleteTalkLog, updateRewardConsult, toast } = useApp()

  const [activeTab, setActiveTab] = useState('topics') // topics | write | logs
  const [partner, setPartner] = useState('')
  const [decided, setDecided] = useState('')
  const [pending, setPending] = useState('')
  const [memo, setMemo] = useState('')
  const [topicIdx, setTopicIdx] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const rewardWish = state.wishes.find((w) => w.id === state.rewardWishId)
  const consult = state.rewardConsult

  const handleTabKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = FAMILY_TABS[(idx + 1) % FAMILY_TABS.length]
      setActiveTab(next.id)
      document.getElementById(`family-tab-${next.id}`)?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = FAMILY_TABS[(idx - 1 + FAMILY_TABS.length) % FAMILY_TABS.length]
      setActiveTab(prev.id)
      document.getElementById(`family-tab-${prev.id}`)?.focus()
    }
  }

  const handleSaveLog = (e) => {
    e.preventDefault()
    if (!partner.trim()) return
    const ok = addTalkLog({
      partner: partner.trim(),
      decided: decided.trim(),
      pending: pending.trim(),
      memo: memo.trim()
    })
    if (ok) {
      setPartner('')
      setDecided('')
      setPending('')
      setMemo('')
      setActiveTab('logs')
    }
  }

  const handleStartSimulation = () => {
    const targetWish = rewardWish ? rewardWish.text : '家族でのお祝い'
    updateRewardConsult({
      status: 'pending',
      wishText: targetWish,
      message: `準備の区切りがついたので、家族みんなで「${targetWish}」を相談したいです。`,
      replyText: ''
    })
  }

  const handleSimulateReply = () => {
    updateRewardConsult({
      status: 'replied',
      replyText: '準備お疲れさまでした！ぜひみんなでお祝いしましょう。来月の週末に日程を合わせますね。'
    })
  }

  const handleResetSimulation = () => {
    updateRewardConsult({
      status: 'none',
      wishText: '',
      message: '',
      replyText: ''
    })
  }

  const handleCopyDraft = async () => {
    const text = consult.message
    if (!text) return
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        toast('相談メッセージの下書きをコピーしました')
      } else {
        toast('お使いのブラウザでは自動コピーに対応していません。画面の文章を控えてご利用ください')
      }
    } catch {
      toast('コピーに失敗しました。画面の文章を控えてご利用ください')
    }
  }

  const handleConfirmDeleteLog = () => {
    if (deleteTarget) {
      deleteTalkLog(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="screen-anim">
      {/* 画面説明 & 目的別タブ */}
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap' }}>
          <h2 className="card-title">家族との対話・相談練習</h2>
          <span className="tag tag-plus">暮らしのノート</span>
        </div>
        <p className="card-sub">
          話題の準備・相談の練習、話し合いの記録、過去の記録を目的に合わせて使い分けられます。
        </p>

        <div
          className="segtabs segtabs-3"
          style={{ marginTop: '.9rem', marginBottom: 0 }}
          role="tablist"
          aria-label="家族との対話メニュー"
        >
          {FAMILY_TABS.map((tab, idx) => {
            const isSelected = activeTab === tab.id
            const text = typeof tab.label === 'function'
              ? tab.label(state.talkLogs.length)
              : tab.label
            return (
              <button
                key={tab.id}
                id={`family-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={`segtab ${isSelected ? 'on' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
              >
                {text}
              </button>
            )
          })}
        </div>
      </section>

      {/* タブ1：話題・相談練習 */}
      {activeTab === 'topics' && (
        <div role="tabpanel" aria-labelledby="family-tab-topics">
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.02rem' }}>おすすめの話題</h3>
            <p className="card-sub">話し合いを切り出しやすい質問のきっかけです。</p>

            <div className="qbubble" style={{ marginTop: '.65rem' }}>
              {TALK_TOPICS[topicIdx]}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.65rem', gap: '.5rem', flexWrap: 'wrap' }}>
              <span className="note" style={{ marginTop: 0 }}>
                話題 {topicIdx + 1} / {TALK_TOPICS.length}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={() => setTopicIdx((prev) => (prev + 1) % TALK_TOPICS.length)}
              >
                別の話題を見る
              </button>
            </div>
          </section>

          <section className="card" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', flexWrap: 'wrap' }}>
              <h3 className="card-title" style={{ fontSize: '1.02rem' }}>ごほうび相談の練習</h3>
              <span className="tag">模擬体験・送信されません</span>
            </div>
            <p className="card-sub">
              準備の区切りに、ご家族へ楽しみやお願いを切り出す練習ができます。
            </p>

            <div className="notice notice-blue" style={{ marginTop: '.75rem' }}>
              <div className="n-ic">
                <Icon name="bulb" />
              </div>
              <div className="n-body">
                <p className="n-title" style={{ fontSize: '.96rem' }}>
                  アプリ内の練習機能です
                </p>
                <p className="n-sub" style={{ color: 'var(--ink)', fontSize: '.86rem' }}>
                  ボタンを押しても、実際にご家族へメールやメッセージは送信されません。実際に送りたいときは、作成された文面を書き写すかコピーしてご利用ください。
                </p>
              </div>
            </div>

            {consult.status === 'none' ? (
              <div style={{ marginTop: '.85rem' }}>
                <p className="note" style={{ marginTop: 0 }}>
                  目標の楽しみ：<strong>{rewardWish ? rewardWish.text : '家族でのお祝い'}</strong>
                </p>
                <button
                  type="button"
                  className="btn btn-amber btn-block"
                  style={{ marginTop: '.65rem' }}
                  onClick={handleStartSimulation}
                >
                  相談文の下書きを作って試す（送信されません）
                </button>
              </div>
            ) : consult.status === 'pending' ? (
              <div className="preview-box" style={{ marginTop: '.85rem' }}>
                <p style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '.92rem' }}>
                  【模擬体験】作成した相談文の下書き（外部には送信されていません）
                </p>
                <p style={{ marginTop: '.45rem', color: 'var(--ink)', fontSize: '.96rem' }}>
                  「{consult.message}」
                </p>

                <div className="btn-row" style={{ marginTop: '.85rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={handleCopyDraft}
                  >
                    この文面をコピーする
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={handleSimulateReply}
                  >
                    【練習】返答例を見てみる
                  </button>
                </div>
                <div style={{ marginTop: '.55rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={handleResetSimulation}
                  >
                    下書きを最初に戻す
                  </button>
                </div>
              </div>
            ) : (
              <div className="celebrate" style={{ marginTop: '.85rem' }}>
                <p style={{ fontWeight: 800, color: 'var(--amber)' }}>
                  【模擬体験】家族からの返答イメージ
                </p>
                <p style={{ marginTop: '.35rem', fontSize: '.96rem', color: 'var(--ink)' }}>
                  「{consult.replyText}」
                </p>
                <p className="note" style={{ fontSize: '.82rem' }}>
                  ※ これはアプリ内で表示しているイメージ例です。
                </p>
                <div style={{ marginTop: '.65rem' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={handleResetSimulation}
                  >
                    もう一度試す
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* タブ2：記録を書く */}
      {activeTab === 'write' && (
        <div role="tabpanel" aria-labelledby="family-tab-write">
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.02rem' }}>話し合いを記録する</h3>
            <p className="card-sub">
              ご家族と話したことや次回へのメモを、この端末に記録します。
            </p>
            <form onSubmit={handleSaveLog} style={{ marginTop: '.75rem' }}>
              <div>
                <label htmlFor="talk-partner-input" className="card-sub" style={{ fontWeight: 700, display: 'block' }}>
                  話した相手（必須）
                </label>
                <input
                  id="talk-partner-input"
                  type="text"
                  className="input"
                  style={{ marginTop: '.3rem' }}
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  placeholder="例）長女、配偶者など"
                  required
                />
              </div>

              <div style={{ marginTop: '.85rem' }}>
                <label htmlFor="talk-decided-input" className="card-sub" style={{ fontWeight: 700, display: 'block' }}>
                  決まったこと
                </label>
                <input
                  id="talk-decided-input"
                  type="text"
                  className="input"
                  style={{ marginTop: '.3rem' }}
                  value={decided}
                  onChange={(e) => setDecided(e.target.value)}
                  placeholder="例）緊急連絡先を確認した"
                />
              </div>

              <div style={{ marginTop: '.85rem' }}>
                <label htmlFor="talk-pending-input" className="card-sub" style={{ fontWeight: 700, display: 'block' }}>
                  保留・次回話すこと
                </label>
                <input
                  id="talk-pending-input"
                  type="text"
                  className="input"
                  style={{ marginTop: '.3rem' }}
                  value={pending}
                  onChange={(e) => setPending(e.target.value)}
                  placeholder="例）お墓の希望は来月もう一度話す"
                />
              </div>

              <div style={{ marginTop: '.85rem' }}>
                <label htmlFor="talk-memo-input" className="card-sub" style={{ fontWeight: 700, display: 'block' }}>
                  メモ
                </label>
                <div className="field" style={{ marginTop: '.3rem' }}>
                  <textarea
                    id="talk-memo-input"
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
                話し合いの記録を保存する
              </button>
            </form>
          </section>
        </div>
      )}

      {/* タブ3：過去の記録 */}
      {activeTab === 'logs' && (
        <div role="tabpanel" aria-labelledby="family-tab-logs" style={{ marginTop: '1rem' }}>
          {state.talkLogs.length === 0 ? (
            <div className="empty">
              まだ話し合いの記録はありません。<br />
              「記録を書く」からご家族と話した内容を残せます。<br />
              <span style={{ display: 'inline-block', marginTop: '.45rem', fontSize: '.86rem' }}>
                （操作感を試したい場合は <Link to="/settings" style={{ color: 'var(--brand-deep)', fontWeight: 700 }}>基本設定</Link> から入力例を読み込めます）
              </span>
            </div>
          ) : (
            state.talkLogs.map((log) => (
              <article key={log.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1.02rem', color: 'var(--ink)' }}>相手：{log.partner}</strong>
                  <span className="smallcap">{log.date}</span>
                </div>

                {log.decided && (
                  <p className="note" style={{ marginTop: '.45rem', color: 'var(--body)' }}>
                    <strong style={{ color: 'var(--brand-deep)' }}>【決まったこと】</strong> {log.decided}
                  </p>
                )}

                {log.pending && (
                  <p className="note" style={{ marginTop: '.25rem', color: 'var(--body)' }}>
                    <strong style={{ color: 'var(--amber)' }}>【保留】</strong> {log.pending}
                  </p>
                )}

                {log.memo && (
                  <p className="note" style={{ marginTop: '.25rem', color: 'var(--body)' }}>
                    <strong>【メモ】</strong> {log.memo}
                  </p>
                )}

                <div style={{ marginTop: '.7rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    style={{ color: 'var(--rose)' }}
                    onClick={() => setDeleteTarget(log)}
                    aria-label={`${log.partner}との記録を削除`}
                  >
                    削除する
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      <AccessibleDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="この話し合い記録を削除しますか？"
        description={
          deleteTarget
            ? `「相手：${deleteTarget.partner}（${deleteTarget.date}）」の記録を削除します。この操作は取り消せません。`
            : undefined
        }
      >
        <div className="btn-row" style={{ marginTop: '1.2rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setDeleteTarget(null)}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmDeleteLog}
          >
            削除する
          </button>
        </div>
      </AccessibleDialog>
    </div>
  )
}
