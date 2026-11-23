import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { Icon } from '../shared/components/SvgIcons'

/**
 * 生活状況アンケート 開始画面
 * シニア向けに公的機関の案内のような落ち着いた構成とし、
 * 絵文字を排除して番号と簡潔な案内で整理しています。
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
      <div className="notice notice-teal" style={{ padding: '.9rem 1rem' }}>
        <div className="n-ic" style={{ width: '2.4rem', height: '2.4rem' }}>
          <Icon name="post" style={{ width: '1.3rem', height: '1.3rem' }} />
        </div>
        <div className="n-body">
          <h2 className="n-title" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            生活状況アンケート
          </h2>
          <p className="n-sub" style={{ fontSize: '.9rem', marginTop: '.25rem', lineHeight: 1.55 }}>
            現在の状況に合わせた準備項目を確認するための質問です（全8問・約3分）。
          </p>
        </div>
      </div>

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
              <strong style={{ fontSize: '.94rem', color: 'var(--ink)' }}>所要時間：約3分（全8問）</strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.12rem', lineHeight: 1.5 }}>
                大切な項目を短時間で確認できます。専門知識は不要です。
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
              <strong style={{ fontSize: '.94rem', color: 'var(--ink)' }}>いつでも中断・結果確認が可能</strong>
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.12rem', lineHeight: 1.5 }}>
                途中で「終了して結果を見る」を押すと、そこまでの回答内容で項目をご案内します。
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
              <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.12rem', lineHeight: 1.5 }}>
                迷う項目は「分からない」「答えたくない」を選択できます。回答は後から変更も可能です。
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
            border: '1px solid var(--line-strong)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span className="badge badge-done" style={{ fontWeight: 800 }}>回答済み</span>
            <span style={{ fontSize: '.92rem', fontWeight: 800, color: 'var(--ink)' }}>
              前回の回答結果が保存されています
            </span>
          </div>
          <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: '.35rem', lineHeight: 1.5 }}>
            前回の診断結果をそのまま確認するか、回答をリセットして最初から答え直すことができます。
          </p>

          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ minHeight: '3.1rem', fontSize: '1.02rem', fontWeight: 800 }}
              onClick={handleGoResult}
            >
              前回の診断結果を確認する
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              style={{ minHeight: '2.8rem', fontSize: '.9rem' }}
              onClick={handleResetAndStart}
            >
              回答をリセットして最初からやり直す
            </button>
          </div>
        </section>
      ) : (
        /* 初回スタートボタン */
        <div style={{ marginTop: '1.3rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-block"
            style={{
              minHeight: '3.4rem',
              fontSize: '1.1rem',
              fontWeight: 800,
              boxShadow: '0 3px 10px rgba(11, 111, 95, 0.22)'
            }}
            onClick={handleStart}
          >
            アンケートを開始する（約3分）
          </button>

          <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--muted)', marginTop: '.7rem' }}>
            ※ 入力内容はお使いの端末にのみ保存されます。
          </p>
        </div>
      )}
    </div>
  )
}
