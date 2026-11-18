import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { Icon } from '../shared/components/SvgIcons'

/**
 * 生活状況アンケート 開始画面
 * シニア（ご高齢者）にも迷わず操作できるよう、事前の分野・項目選択を廃止し、
 * 最初から全問（約6〜8問）を順番に回答できるシンプルな導線を提供します。
 */
export default function SurveyTopics() {
  const navigate = useNavigate()
  const { state, resetQuiz } = useApp()

  const handleStart = () => {
    navigate('/survey/q')
  }

  const handleResetAndStart = () => {
    resetQuiz()
    navigate('/survey/q')
  }

  const handleGoResult = () => {
    navigate('/survey/result')
  }

  return (
    <div className="screen-anim">
      {/* 導入バナー */}
      <div className="notice notice-teal" style={{ padding: '1rem 1.1rem' }}>
        <div className="n-ic" style={{ width: '2.5rem', height: '2.5rem' }}>
          <Icon name="bulb" style={{ width: '1.4rem', height: '1.4rem' }} />
        </div>
        <div className="n-body">
          <h2 className="n-title" style={{ fontSize: '1.18rem', fontWeight: 800 }}>
            生活状況アンケート
          </h2>
          <p className="n-sub" style={{ fontSize: '.92rem', marginTop: '.35rem', lineHeight: 1.6 }}>
            あなたに合った準備項目を見つけるための簡単な質問です。
            面倒な項目の選択は不要で、最初から順番にお答えいただけます。
          </p>
        </div>
      </div>

      {/* ご高齢者向け 3つの安心ポイント */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <Icon name="heart" style={{ color: 'var(--rose)', width: '1.15rem', height: '1.15rem' }} />
          ご回答にあたっての3つの安心
        </h3>

        <div style={{ marginTop: '.85rem', display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
            <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>⏱️</span>
            <div>
              <strong style={{ fontSize: '.96rem', color: 'var(--ink)' }}>質問は全6〜8問・約3分で完了</strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.15rem', lineHeight: 1.55 }}>
                お金・住まい・お墓・ご家族・ペットなど、大切な項目を短時間で確認できます。専門知識は不要です。
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
            <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>⏸️</span>
            <div>
              <strong style={{ fontSize: '.96rem', color: 'var(--ink)' }}>いつでも途中で終了・結果確認OK</strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.15rem', lineHeight: 1.55 }}>
                途中で疲れた時は「途中で終了して結果を見る」を押せば、そこまでの回答で準備をご案内します。
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
            <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>💡</span>
            <div>
              <strong style={{ fontSize: '.96rem', color: 'var(--ink)' }}>分からない質問はパスできます</strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.15rem', lineHeight: 1.55 }}>
                迷った時は「分からない」「答えたくない」を選んでも大丈夫。回答は後からいつでも見直せます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 診断済みの場合の再開・結果確認ブロック */}
      {state.quizDone ? (
        <section
          className="card"
          style={{
            marginTop: '1rem',
            background: 'var(--surface-2)',
            border: '2px solid var(--teal-line, #cde5db)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span className="badge badge-done" style={{ fontWeight: 800 }}>回答済み</span>
            <span style={{ fontSize: '.92rem', fontWeight: 800, color: 'var(--ink)' }}>
              前回の回答結果が保存されています
            </span>
          </div>
          <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.4rem', lineHeight: 1.55 }}>
            前回の診断結果をそのまま確認するか、回答をリセットして最初から答え直すことができます。
          </p>

          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ minHeight: '3.3rem', fontSize: '1.08rem', fontWeight: 800 }}
              onClick={handleGoResult}
            >
              前回の診断結果を見る
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              style={{ minHeight: '2.9rem', fontSize: '.92rem' }}
              onClick={handleResetAndStart}
            >
              回答をリセットして最初からやり直す
            </button>
          </div>
        </section>
      ) : (
        /* 初回スタートボタン */
        <div style={{ marginTop: '1.35rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-block"
            style={{
              minHeight: '3.5rem',
              fontSize: '1.14rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(11, 111, 95, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5rem'
            }}
            onClick={handleStart}
          >
            <span>アンケートをはじめる（全問回答・約3分）</span>
            <span style={{ fontSize: '1.3rem' }}>→</span>
          </button>

          <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--muted)', marginTop: '.75rem' }}>
            ※ 入力内容はご使用の端末内にのみ保存されます（個人情報は外部に送信されません）
          </p>
        </div>
      )}
    </div>
  )
}
