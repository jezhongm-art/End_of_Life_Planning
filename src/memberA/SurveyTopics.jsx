import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { QUIZ_FLOW_RANGE } from '../memberC/rules'
import { Icon } from '../shared/components/SvgIcons'
import { AccessibleDialog } from '../shared/components/AccessibleDialog'

/**
 * 生活状況アンケート 開始・再開案内画面
 */
export default function SurveyTopics() {
  const navigate = useNavigate()
  const { state, getQuizStatus, resetQuiz, previewPartialQuiz } = useApp()
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)

  const quizStatus = getQuizStatus()

  const handleStartOrResume = () => {
    navigate('/survey/q')
  }

  const handleViewPartialResult = () => {
    previewPartialQuiz(state.quizAnswers)
    navigate('/survey/result')
  }

  const handleConfirmReset = () => {
    resetQuiz()
    setConfirmResetOpen(false)
    navigate('/survey/q')
  }

  const handleGoResult = () => {
    navigate('/survey/result')
  }

  return (
    <div className="screen-anim">
      {/* シンプルな導入 */}
      <div className="plain-head">
        <p className="plain-lead" style={{ marginTop: 0 }}>
          お答えに合わせて質問が変わり、いま必要な準備がわかります（{QUIZ_FLOW_RANGE.min}〜{QUIZ_FLOW_RANGE.max}問・約3〜4分）。
        </p>
      </div>

      {/* 回答状態に応じたアクションブロック */}
      {quizStatus.isCompleted ? (
        <section
          className="card"
          style={{
            marginTop: '1rem',
            background: 'var(--surface-2)',
            border: '2px solid var(--brand-tint-2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
            <span className="st s-done">
              <span className="mk" aria-hidden="true">✓</span>
              回答完了
            </span>
            <span style={{ fontSize: '.94rem', fontWeight: 800, color: 'var(--ink)' }}>
              全{quizStatus.totalCount}問のお答えが終わっています
            </span>
          </div>
          <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginTop: '.45rem', lineHeight: 1.55 }}>
            前回の結果を見返すか、質問を見直してお答えを変えることができます。
          </p>

          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleGoResult}
            >
              結果を確認する
            </button>
          </div>
          <div className="btn-row" style={{ marginTop: '.6rem' }}>
            <button
              type="button"
              className="btn btn-sub"
              onClick={handleStartOrResume}
            >
              お答えを見直す
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfirmResetOpen(true)}
            >
              はじめからやり直す
            </button>
          </div>
        </section>
      ) : quizStatus.isInProgress ? (
        <section
          className="card"
          style={{
            marginTop: '1rem',
            background: 'var(--amber-tint)',
            border: '2px solid #e4cd97'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
            <span className="st s-doing">
              <span className="mk" aria-hidden="true">▶</span>
              回答途中
            </span>
            <span style={{ fontSize: '.94rem', fontWeight: 800, color: 'var(--ink)' }}>
              {quizStatus.answeredCount} / {quizStatus.totalCount} 問まで保存されています
            </span>
          </div>
          <p style={{ fontSize: '.88rem', color: 'var(--body)', marginTop: '.45rem', lineHeight: 1.55 }}>
            前回の続きの質問からすぐに再開できます。ここまでの答えで仮の結果を見ることもできます。
          </p>

          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleStartOrResume}
            >
              続きから答える（残り{quizStatus.remainingCount}問）
            </button>
          </div>
          <div className="btn-row" style={{ marginTop: '.6rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleViewPartialResult}
            >
              ここまでの仮結果を見る
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfirmResetOpen(true)}
            >
              はじめからやり直す
            </button>
          </div>
        </section>
      ) : (
        <div style={{ marginTop: '1.1rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-block"
            style={{
              minHeight: '3.4rem',
              fontSize: '1.08rem',
              fontWeight: 800,
              boxShadow: '0 3px 10px rgba(11, 111, 95, 0.22)'
            }}
            onClick={handleStartOrResume}
          >
            アンケートを始める（約3〜4分）
          </button>

          <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'var(--muted)', marginTop: '.65rem' }}>
            ※ お答えはお使いの端末の中だけに保存されます。
          </p>
        </div>
      )}

      {/* ご回答にあたっての案内 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <Icon name="check" stroke style={{ width: '1.1rem', height: '1.1rem', color: 'var(--brand)' }} />
          ご回答にあたっての安心ポイント
        </h3>

        <div style={{ marginTop: '.85rem', display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.7rem' }}>
            <span
              style={{
                width: '1.45rem',
                height: '1.45rem',
                borderRadius: '50%',
                background: 'var(--brand-tint)',
                color: 'var(--brand-deep)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: '.82rem',
                flex: 'none'
              }}
            >
              1
            </span>
            <div>
              <strong style={{ fontSize: '.94rem', color: 'var(--ink)' }}>
                暮らしに合わせた質問（{QUIZ_FLOW_RANGE.min}〜{QUIZ_FLOW_RANGE.max}問）
              </strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.12rem', lineHeight: 1.55 }}>
                住まいやペット、スマホなどの状況に合わせて、関係のある詳しい質問だけが出ます。
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.7rem' }}>
            <span
              style={{
                width: '1.45rem',
                height: '1.45rem',
                borderRadius: '50%',
                background: 'var(--brand-tint)',
                color: 'var(--brand-deep)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: '.82rem',
                flex: 'none'
              }}
            >
              2
            </span>
            <div>
              <strong style={{ fontSize: '.94rem', color: 'var(--ink)' }}>選んで確認してから進めるので安心</strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.12rem', lineHeight: 1.55 }}>
                答えを選んだあと、「次の質問へ進む」ボタンを押して進みます。途中でお休みして続きから答えることもできます。
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.7rem' }}>
            <span
              style={{
                width: '1.45rem',
                height: '1.45rem',
                borderRadius: '50%',
                background: 'var(--brand-tint)',
                color: 'var(--brand-deep)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: '.82rem',
                flex: 'none'
              }}
            >
              3
            </span>
            <div>
              <strong style={{ fontSize: '.94rem', color: 'var(--ink)' }}>わからない質問は飛ばせます</strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.12rem', lineHeight: 1.55 }}>
                迷うときは「わからない」「答えたくない」を選べます。あとからやり直すこともできます。
              </p>
            </div>
          </div>
        </div>
      </section>

      <AccessibleDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="アンケートを最初からやり直しますか？"
        description="これまでのアンケートのお答えを消して、最初の質問からやり直します。"
      >
        <div className="btn-row" style={{ marginTop: '1.2rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setConfirmResetOpen(false)}
          >
            やめる
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmReset}
          >
            はじめからやり直す
          </button>
        </div>
      </AccessibleDialog>
    </div>
  )
}
