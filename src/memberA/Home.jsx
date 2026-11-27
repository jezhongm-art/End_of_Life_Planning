import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ProgressBar } from '../shared/components/ProgressBar'
import { StatusBadge } from '../memberB/StatusBadge'
import { Icon } from '../shared/components/SvgIcons'
import { STATE } from '../memberB/items'

export default function Home() {
  const navigate = useNavigate()
  const { state, calcProgress, getQuizStatus } = useApp()

  // 初回利用時は自動的に「使い方説明（導入画面）」へナビゲート
  useEffect(() => {
    if (!state.seenGuide) {
      navigate('/guide', { replace: true })
    }
  }, [state.seenGuide, navigate])

  const progress = calcProgress()
  const quizStatus = getQuizStatus()
  const nextItem = progress.nextItem
  const nextItemState = (state.items[nextItem.id] && state.items[nextItem.id].state) || 'notyet'
  const nextItemDoneSteps = (state.items[nextItem.id]?.done || []).filter(Boolean).length

  return (
    <div className="screen-anim">
      {/* 初見でも迷わない挨拶＋進み具合1行 */}
      <div className="plain-head">
        <h2 className="plain-title">{state.name || 'ご利用者'} 様</h2>
        <p className="plain-lead">
          {!quizStatus.isCompleted
            ? 'まずは質問に答えるか、下の「次にすること」からひとつだけ進めましょう。'
            : '下の「次にすること」をひとつずつ進めてみましょう。'}
        </p>
      </div>

      {/* 初回アンケート導線（未完了のときのみ表示） */}
      {!quizStatus.isCompleted && (
        quizStatus.isInProgress ? (
          <div className="notice notice-amber" style={{ marginTop: '.5rem', marginBottom: '1rem' }}>
            <div className="n-ic">
              <Icon name="post" />
            </div>
            <div className="n-body">
              <p className="n-title">
                アンケートの続きがあります（{quizStatus.answeredCount} / {quizStatus.totalCount} 問）
              </p>
              <p className="n-sub">
                前回の続きからすぐ再開できます。
              </p>
              <div style={{ marginTop: '.6rem' }}>
                <Link to="/survey/q" className="btn btn-amber btn-small">
                  続きから答える
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="notice notice-teal" style={{ marginTop: '.5rem', marginBottom: '1rem' }}>
            <div className="n-ic">
              <Icon name="post" />
            </div>
            <div className="n-body">
              <p className="n-title">はじめの質問（約3分）</p>
              <p className="n-sub">
                簡単な質問に答えると、いま優先したい準備がわかります。
              </p>
              <div style={{ marginTop: '.6rem' }}>
                <Link to="/survey" className="btn btn-primary btn-small">
                  質問をはじめる
                </Link>
              </div>
            </div>
          </div>
        )
      )}

      {/* 中心：次にすること（Heroカード） */}
      {progress.pct === 100 ? (
        <section className="celebrate" aria-label="次にすること">
          <div className="h-eyebrow" style={{ background: '#9a5a08', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '.35rem', borderRadius: '999px', padding: '.18rem .7rem', fontSize: '.82rem', fontWeight: 800 }}>
            <Icon name="check" stroke style={{ width: '1rem', height: '1rem' }} /> すべて完了
          </div>
          <h3 className="card-title" style={{ fontSize: '1.22rem', marginTop: '.5rem', color: 'var(--brand-deep)' }}>
            すべての準備項目が完了しました
          </h3>
          <p className="plain-lead">
            お疲れさまでした。やってみたいことやご家族との話し合いもぜひお楽しみください。
          </p>
          <div className="btn-row" style={{ marginTop: '.9rem' }}>
            <Link to="/items" className="btn btn-primary">
              準備項目を見直す
            </Link>
            <Link to="/more" className="btn btn-ghost">
              楽しみ・思い出へ
            </Link>
          </div>
        </section>
      ) : (
        nextItem && (
          <section className="hero" aria-label="次にすること">
            <div className="h-eyebrow">
              <Icon name="star" style={{ width: '1rem', height: '1rem' }} /> 次にすること
            </div>
            <h3 className="h-title">{nextItem.title}</h3>
            <p className="card-sub">{nextItem.desc}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '.65rem', flexWrap: 'wrap' }}>
              <StatusBadge state={nextItemState} />
              <span style={{ fontSize: '.86rem', color: 'var(--muted)', fontWeight: 700 }}>
                手順 {nextItemDoneSteps} / {nextItem.steps.length}
              </span>
            </div>

            <div className="btn-row" style={{ marginTop: '.95rem' }}>
              <Link
                to={`/items/detail?id=${nextItem.id}`}
                className="btn btn-primary btn-block"
              >
                この準備を進める
              </Link>
            </div>
          </section>
        )
      )}

      {/* 全体の進み具合（シンプルな1カード） */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem' }}>
          <div>
            <h3 className="card-title">全体の進み具合</h3>
            <p className="card-sub">
              {progress.total}項目中 {progress.doneCount}項目完了
            </p>
          </div>
          <span className="big-num">{progress.pct}%</span>
        </div>
        <ProgressBar pct={progress.pct} showPct={false} />
      </section>

      {/* 補足情報（折りたたみ） */}
      <details className="acc">
        <summary>詳しい内訳・その他の機能</summary>
        <div className="acc-body">
          <div className="numgrid" style={{ marginTop: 0 }}>
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

          <div style={{ marginTop: '.9rem', display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
            <Link to="/items" className="btn btn-ghost btn-block">
              準備項目の一覧を見る
            </Link>
            <Link to="/more" className="btn btn-ghost btn-block">
              その他の機能・設定へ
            </Link>
          </div>
        </div>
      </details>
    </div>
  )
}
