import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ProgressBar } from '../shared/components/ProgressBar'
import { StatusBadge } from '../memberB/StatusBadge'
import { Icon } from '../shared/components/SvgIcons'
import { STATE } from '../memberB/items'

export default function Home() {
  const { state, calcProgress } = useApp()
  const progress = calcProgress()
  const nextItem = progress.nextItem
  const nextItemState =(state.items[nextItem.id] && state.items[nextItem.id].state) || 'notyet'

  return (
    <div className="screen-anim">
      {/* 挨拶 & サブタイトル */}
      <div style={{ marginBottom: '.9rem' }}>
        <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
          {state.name || 'ご利用者'} 様
        </h2>
        <p className="card-sub">
          準備の進み具合を確認し、必要な項目から進めましょう。
        </p>
      </div>

      {/* 初回・未診断案内バナー */}
      {!state.quizDone && (
        <div className="notice notice-teal">
          <div className="n-ic">
            <Icon name="post" />
          </div>
          <div className="n-body">
            <p className="n-title">生活状況アンケート</p>
            <p className="n-sub">
              簡単な質問（所要約3分）で、今必要な準備項目を確認できます。
            </p>
            <div style={{ marginTop: '.65rem' }}>
              <Link to="/survey" className="btn btn-primary btn-small">
                アンケートを開始する（約3分）
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 進捗概要カード */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">準備の進み具合</h3>
            <p className="card-sub">
              対象 {progress.applicableCount} 項目中 {progress.doneCount} 項目完了
            </p>
          </div>
          <span className="big-num">{progress.pct}%</span>
        </div>

        <ProgressBar pct={progress.pct} showPct={false} />

        {progress.pct === 100 && (
          <div className="celebrate" style={{ marginTop: '.8rem' }}>
            <p style={{ fontWeight: 800, color: 'var(--brand-deep)' }}>
              すべての準備項目が完了しました。
            </p>
            <p className="note" style={{ color: 'var(--muted)', marginTop: '.15rem' }}>
              ご家族との対話や日々の暮らしを大切にお過ごしください。
            </p>
          </div>
        )}
      </section>

      {/* 次の一歩 Heroカード */}
      {nextItem && (
        <section className="hero" style={{ marginTop: '1rem' }}>
          <div className="h-eyebrow">
            <Icon name="star" style={{ width: '1rem', height: '1rem' }} /> 次の取り組み
          </div>
          <h3 className="h-title">{nextItem.title}</h3>
          <p className="card-sub">{nextItem.desc}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '.6rem' }}>
            <span style={{ fontSize: '.86rem', color: 'var(--muted)' }}>現在の状態:</span>
            <StatusBadge state={nextItemState} />
          </div>

          <div className="btn-row" style={{ marginTop: '.9rem' }}>
            <Link
              to={`/items/detail?id=${nextItem.id}`}
              className="btn btn-primary btn-block"
            >
              手順を確認する
            </Link>
          </div>
        </section>
      )}

      {/* クイックメニュータイル */}
      <h3 className="sec-title">主なメニュー</h3>
      <div className="tiles">
        <Link to="/survey" className="tile">
          <div className="t-ic t-teal">
            <Icon name="post" />
          </div>
          <span className="t-title">生活状況アンケート</span>
          <span className="t-desc">
            {state.quizDone ? '回答の確認・再診断' : '必要な準備の確認'}
          </span>
        </Link>

        <Link to="/items" className="tile">
          <div className="t-ic t-slate">
            <Icon name="clip" />
          </div>
          <span className="t-title">準備項目リスト</span>
          <span className="t-desc">全項目の一覧と進捗管理</span>
        </Link>

        <Link to="/wishes" className="tile">
          <div className="t-ic t-amber">
            <Icon name="star" />
          </div>
          <span className="t-title">やってみたいこと</span>
          <span className="t-desc">楽しみや希望の記録</span>
        </Link>

        <Link to="/memories" className="tile">
          <div className="t-ic t-rose">
            <Icon name="heart" />
          </div>
          <span className="t-title">思い出・メッセージ</span>
          <span className="t-desc">家族へ伝えたい言葉の記録</span>
        </Link>
      </div>

      -      {/* 状態の内訳 */}
      <details className="acc">
        <summary>準備状況の内訳を見る</summary>
        <div className="acc-body">
          <div className="numgrid">
            <div className="stat s-done">
              <span className="s-lb">{STATE.done.t}</span>
              <span className="s-num">{progress.countByState.done}</span>
            </div>
            <div className="stat s-doing">
              <span className="s-lb">{STATE.doing.t}</span>
              <span className="s-num">{progress.countByState.doing}</span>
            </div>
            <div className="stat s-notyet">
              <span className="s-lb">{STATE.notyet.t}</span>
              <span className="s-num">{progress.countByState.notyet}</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}
