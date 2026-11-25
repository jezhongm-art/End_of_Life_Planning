import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ITEMS } from '../memberB/items'
import { StatusBadge } from '../memberB/StatusBadge'
import { Icon } from '../shared/components/SvgIcons'

export default function SurveyResult() {
  const { state, getQuizStatus, setItemPriority } = useApp()

  const analysis = state.analysis
  const quizStatus = getQuizStatus()

  if (!analysis) {
    return (
      <div className="screen-anim">
        <div className="empty">
          まだアンケートのお答えがありません。<br />
          質問に答えると、いまの状況に合った準備をご案内します。
        </div>
        <div className="btn-row" style={{ marginTop: '1rem' }}>
          <Link to="/survey" className="btn btn-primary btn-block">
            アンケートを始める
          </Link>
        </div>
      </div>
    )
  }

  // 提案項目リストの組み立て
  const newlyItems = (analysis.newly || []).map((n) => {
    const item = ITEMS.find((it) => it.id === n.id)
    return { ...n, item }
  }).filter((n) => !!n.item)

  const knownItems = (analysis.known || []).map((k) => {
    const item = ITEMS.find((it) => it.id === k.id)
    return { ...k, item }
  }).filter((k) => !!k.item)

  const topPick = newlyItems.length > 0
    ? newlyItems[0]
    : (ITEMS[0] ? { id: ITEMS[0].id, item: ITEMS[0], reason: '基本となる準備から始めましょう' } : null)

  const handleSetPriority = (id) => {
    setItemPriority(id)
  }

  return (
    <div className="screen-anim">
      {/* 途中結果か完了結果かのバナー */}
      {!state.quizDone ? (
        <div className="notice notice-amber">
          <div className="n-ic">
            <Icon name="bulb" />
          </div>
          <div className="n-body">
            <h2 className="n-title">
              途中の答えによる仮の結果（{quizStatus.answeredCount} / {quizStatus.totalCount} 問）
            </h2>
            <p className="n-sub">
              まだ最後まで終わっていません。残りの質問に答えると、より合った案内になります。
            </p>
            <div style={{ marginTop: '.65rem' }}>
              <Link to="/survey/q" className="btn btn-amber btn-small">
                続きから答える（残り{quizStatus.remainingCount}問）
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="notice notice-teal">
          <div className="n-ic">
            <Icon name="check" stroke />
          </div>
          <div className="n-body">
            <h2 className="n-title">アンケートの結果</h2>
            <p className="n-sub">
              お答えいただいた内容をもとに、まず確認をおすすめする項目をまとめました。
            </p>
          </div>
        </div>
      )}

      {/* 最初におすすめする次の一歩 */}
      {topPick && topPick.item && (
        <section className="hero" style={{ marginTop: '1rem' }}>
          <div className="h-eyebrow">
            <Icon name="star" style={{ width: '1rem', height: '1rem' }} /> まず取り組みたいこと
          </div>
          <h3 className="h-title">{topPick.item.title}</h3>
          <p className="card-sub">{topPick.item.desc}</p>
          <div className="h-reason">
            <strong>理由：</strong> {topPick.reason}
          </div>

          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <Link
              to={`/items/detail?id=${topPick.item.id}`}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              進め方を見る
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => handleSetPriority(topPick.item.id)}
            >
              ホームの「次にすること」に設定
            </button>
          </div>
        </section>
      )}

      {/* 新しく見つかった準備 */}
      <h3 className="sec-title">確認をおすすめする項目（{newlyItems.length}件）</h3>
      {newlyItems.length === 0 ? (
        <div className="empty">
          お答えいただいた範囲では、新しく急いで確認が必要な項目はありません。
        </div>
      ) : (
        newlyItems.map(({ item, reason }) => {
          const itemState = state.items[item.id]?.state || 'notyet'
          return (
            <Link
              key={item.id}
              to={`/items/detail?id=${item.id}`}
              className="rowitem"
            >
              <div className="r-main">
                <span className="r-title">{item.title}</span>
                <span className="r-sub">{reason}</span>
                <div style={{ marginTop: '.4rem' }}>
                  <StatusBadge state={itemState} />
                </div>
              </div>
              <Icon name="chev" stroke className="chev" />
            </Link>
          )
        })
      )}

      {/* すでに把握・対応できている項目 */}
      {knownItems.length > 0 && (
        <details className="acc" style={{ marginTop: '1.2rem' }}>
          <summary>すでに整理できている・進めている項目（{knownItems.length}件）</summary>
          <div className="acc-body">
            {knownItems.map(({ item, reason }) => {
              const itemState = state.items[item.id]?.state || 'notyet'
              return (
                <div key={item.id} className="card" style={{ marginTop: '.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800 }}>{item.title}</span>
                    <StatusBadge state={itemState} />
                  </div>
                  <p className="note" style={{ marginTop: '.3rem' }}>{reason}</p>
                </div>
              )
            })}
          </div>
        </details>
      )}

      {/* 家族に伝えるまとめカード */}
      <details className="acc" style={{ marginTop: '1rem' }}>
        <summary>家族に相談するときの伝え方例を見る</summary>
        <div className="acc-body">
          <p className="card-sub">
            ご家族に話すとき、そのまま使っていただける言葉の例です。
          </p>
          <div className="qbubble" style={{ marginTop: '.7rem' }}>
            「終活みちしるべで確かめたところ、まずは『
            {topPick?.item?.title || '準備項目'}』から整理を始めようと思っています。
            {newlyItems.length > 0 && `あわせて${newlyItems.map((n) => n.item.title).join('、')}も確認していく予定です。`}
            無理のないペースで進めるので、相談に乗ってくれると助かります。」
          </div>
        </div>
      </details>

      {/* アクションボタン */}
      <div className="btn-row" style={{ marginTop: '1.3rem' }}>
        <Link to="/items" className="btn btn-primary btn-block">
          準備項目の一覧へ進む
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '.7rem' }}>
        <Link to="/" className="btn btn-ghost btn-small">
          ホームにもどる
        </Link>
      </div>
    </div>
  )
}
