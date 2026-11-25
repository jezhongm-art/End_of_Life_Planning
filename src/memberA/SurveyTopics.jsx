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
      {/* 導入バナー */}
      <div className="notice notice-teal" style={{ padding: '.9rem 1rem' }}>
        <div className="n-ic" style={{ width: '2.4rem', height: '2.4rem' }}>
          <Icon name="post" style={{ width: '1.3rem', height: '1.3rem' }} />
        </div>
        <div className="n-body">
          <h2 className="n-title" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            生活状況アンケート
          </h2>
          <p className="n-sub" style={{ fontSize: '.9rem', marginTop: '.25rem', lineHeight: 1.55 }}>
            ご回答に合わせて質問が分岐し、今の状況に必要な準備項目を確認できます（{QUIZ_FLOW_RANGE.min}〜{QUIZ_FLOW_RANGE.max}問・約3分）。
          </p>
        </div>
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
              全{quizStatus.totalCount}問の回答が完了しています
            </span>
          </div>
          <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginTop: '.45rem', lineHeight: 1.55 }}>
            前回の診断結果を確認するか、質問を見直して回答を変更できます。
          </p>

          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleGoResult}
            >
              診断結果を確認する
            </button>
          </div>
          <div className="btn-row" style={{ marginTop: '.6rem' }}>
            <button
              type="button"
              className="btn btn-sub"
              onClick={handleStartOrResume}
            >
              回答を見直す
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfirmResetOpen(true)}
            >
              最初からやり直す
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
              {quizStatus.answeredCount} / {quizStatus.totalCount} 問まで途中保存されています
            </span>
          </div>
          <p style={{ fontSize: '.88rem', color: 'var(--body)', marginTop: '.45rem', lineHeight: 1.55 }}>
            前回の続きの質問からすぐに再開できます。ここまでの回答で仮の結果を見ることもできます。
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
              最初からやり直す
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
            アンケートを開始する（約3分）
          </button>

          <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'var(--muted)', marginTop: '.65rem' }}>
            ※ 入力内容はお使いの端末にのみ保存されます。
          </p>
        </div>
      )}

      {/* ご回答にあたっての案内 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <Icon name="check" stroke style={{ width: '1.1rem', height: '1.1rem', color: 'var(--brand)' }} />
          ご回答にあたっての確認事項
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
                回答に応じた分岐質問（{QUIZ_FLOW_RANGE.min}〜{QUIZ_FLOW_RANGE.max}問・約3分）
              </strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.12rem', lineHeight: 1.55 }}>
                住まいやペットなどの回答に合わせて、関係のある詳しい質問だけが表示されます。
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
              <strong style={{ fontSize: '.94rem', color: 'var(--ink)' }}>途中保存して、続きから再開可能</strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.12rem', lineHeight: 1.55 }}>
                途中で「途中保存して中断する」を押すと、そこまでの回答が保存され、後から「続きから答える」で再開できます。
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
              <strong style={{ fontSize: '.94rem', color: 'var(--ink)' }}>分からない質問はスキップ可能</strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.12rem', lineHeight: 1.55 }}>
                迷う項目は「分からない」「答えたくない」を選択できます。回答は後から変更も可能です。
              </p>
            </div>
          </div>
        </div>
      </section>

      <AccessibleDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="アンケートの回答をやり直しますか？"
        description="これまでのアンケート回答を消去して、最初の質問からやり直します。"
      >
        <div className="btn-row" style={{ marginTop: '1.2rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setConfirmResetOpen(false)}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmReset}
          >
            最初からやり直す
          </button>
        </div>
      </AccessibleDialog>
    </div>
  )
}
