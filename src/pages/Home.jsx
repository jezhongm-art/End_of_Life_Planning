import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ProgressBar } from '../components/ProgressBar'
import { StatusBadge } from '../components/StatusBadge'
import { Icon } from '../components/SvgIcons'
import { STATE } from '../data/items'

export default function Home() {
  const { state, calcProgress } = useApp()
  const progress = calcProgress()
  const nextItem = progress.nextItem
  const nextItemState = (state.items[nextItem.id] && state.items[nextItem.id].state) || 'unknown'

  return (
    <div className="screen-anim">
      {/* 挨拶 & サブタイトル */}
      <div style={{ marginBottom: '.9rem' }}>
        <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
          {state.name || '利用者'} さん、こんにちは
        </h2>
        <p className="card-sub">
          焦らず、気になる項目から少しずつ準備を進めていきましょう。
        </p>
      </div>

      {/* 初回・未診断案内バナー */}
      {!state.quizDone && (
        <div className="notice notice-teal">
          <div className="n-ic">
            <Icon name="bulb" />
          </div>
          <div className="n-body">
            <p className="n-title">何から始めるか迷ったら</p>
            <p className="n-sub">
              簡単な質問に答えると、あなたに今必要な準備を自動で見つけます。
            </p>
            <div style={{ marginTop: '.65rem' }}>
              <Link to="/survey" className="btn btn-primary btn-small">
                質問に答えてみる（約3分）
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
              有効 {progress.applicableCount} 項目中 {progress.doneCount} 項目が完了
            </p>
          </div>
          <span className="big-num">{progress.pct}%</span>
        </div>

        <ProgressBar pct={progress.pct} showPct={false} />

        {progress.pct === 100 && (
          <div className="celebrate" style={{ marginTop: '.8rem' }}>
            <p style={{ fontWeight: 800, color: 'var(--amber)' }}>
              🎉 すべての準備が完了しました！ご家族との対話や楽しみを大切に過ごしましょう。
            </p>
          </div>
        )}
      </section>

      {/* 次の一歩 Heroカード */}
      {nextItem && (
        <section className="hero" style={{ marginTop: '1rem' }}>
          <div className="h-eyebrow">
            <Icon name="star" style={{ width: '1rem', height: '1rem' }} /> 次に取り組む一歩
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
              この項目の手順を見る
            </Link>
          </div>
        </section>
      )}

      {/* クイックメニュータイル */}
      <h3 className="sec-title">主なメニュー</h3>
      <div className="tiles">
        <Link to="/survey" className="tile">
          <div className="t-ic t-teal">
            <Icon name="bulb" />
          </div>
          <span className="t-title">生活状況アンケート</span>
          <span className="t-desc">
            {state.quizDone ? '回答を見直す・再診断' : '必要な準備を見つける'}
          </span>
        </Link>

        <Link to="/items" className="tile">
          <div className="t-ic t-slate">
            <Icon name="clip" />
          </div>
          <span className="t-title">準備項目リスト</span>
          <span className="t-desc">7つの項目を一覧・進捗管理</span>
        </Link>

        <Link to="/wishes" className="tile">
          <div className="t-ic t-amber">
            <Icon name="star" />
          </div>
          <span className="t-title">やってみたいこと</span>
          <span className="t-desc">楽しみや挑戦の目標管理</span>
        </Link>

        <Link to="/memories" className="tile">
          <div className="t-ic t-rose">
            <Icon name="heart" />
          </div>
          <span className="t-title">思い出・メッセージ</span>
          <span className="t-desc">家族に伝えたい気持ちを記録</span>
        </Link>
      </div>

      {/* 状態の内訳 */}
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
            <div className="stat s-review">
              <span className="s-lb">{STATE.review.t}</span>
              <span className="s-num">{progress.countByState.review}</span>
            </div>
            <div className="stat s-notyet">
              <span className="s-lb">{STATE.notyet.t}</span>
              <span className="s-num">{progress.countByState.notyet}</span>
            </div>
            <div className="stat s-unknown">
              <span className="s-lb">{STATE.unknown.t}</span>
              <span className="s-num">{progress.countByState.unknown}</span>
            </div>
            <div className="stat s-na">
              <span className="s-lb">{STATE.na.t}</span>
              <span className="s-num">{progress.countByState.na}</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}
