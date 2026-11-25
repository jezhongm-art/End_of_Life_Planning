import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { QUIZ_NODES } from '../memberC/questions'
import { computeQuizFlow, pruneAnswersToFlow } from '../memberC/rules'
import { QuizProgressBar } from '../shared/components/ProgressBar'
import { Icon } from '../shared/components/SvgIcons'

export default function SurveyQuestions() {
  const navigate = useNavigate()
  const { state, saveQuizProgress, previewPartialQuiz, finishQuiz, toast } = useApp()

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [answers, setAnswers] = useState(() => ({ ...state.quizAnswers }))
  const [flow, setFlow] = useState(() => computeQuizFlow(state.quizAnswers))
  const [curIdx, setCurIdx] = useState(() => {
    const initialFlow = computeQuizFlow(state.quizAnswers)
    const firstUnanswered = initialFlow.findIndex((qId) => state.quizAnswers[qId] === undefined)
    return firstUnanswered >= 0 ? firstUnanswered : 0
  })

  const questionHeadingRef = useRef(null)
  const hasMountedRef = useRef(false)

  const curQId = flow[curIdx]
  const node = curQId ? QUIZ_NODES[curQId] : null

  // 質問が切り替わったときに質問文へフォーカスを移動
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    if (questionHeadingRef.current) {
      questionHeadingRef.current.focus()
    }
  }, [curQId])

  // 音声読み上げ
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      toast('このブラウザは音声読み上げに対応していません')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      toast('読み上げを停止しました')
      return
    }

    if (!node) return
    window.speechSynthesis.cancel()
    const textToSpeak = `${node.label}についての質問です。${node.text}。選択肢をお答えください。`
    const u = new SpeechSynthesisUtterance(textToSpeak)
    u.lang = 'ja-JP'
    u.rate = 0.92
    u.onend = () => setIsSpeaking(false)
    u.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(u)
    toast('読み上げています')
  }

  // 画面遷移時に読み上げを止める
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (!node) {
    return (
      <div className="card text-center" style={{ marginTop: '2rem' }}>
        <p>質問が見つかりませんでした。</p>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate('/survey')}
        >
          アンケート案内に戻る
        </button>
      </div>
    )
  }

  const handleSelectOption = (optIdx) => {
    const mergedAnswers = { ...answers, [curQId]: optIdx }
    const { flow: nextFlow, answers: cleanedAnswers } = pruneAnswersToFlow(mergedAnswers)

    setAnswers(cleanedAnswers)
    setFlow(nextFlow)

    const currentPos = nextFlow.indexOf(curQId)
    const nextIdx = currentPos >= 0 ? currentPos + 1 : curIdx + 1

    if (nextIdx < nextFlow.length) {
      saveQuizProgress(cleanedAnswers)
      setCurIdx(nextIdx)
      window.scrollTo(0, 0)
    } else {
      finishQuiz(cleanedAnswers)
      navigate('/survey/result')
    }
  }

  const handlePrev = () => {
    if (curIdx > 0) {
      setCurIdx(curIdx - 1)
      window.scrollTo(0, 0)
    } else {
      navigate('/survey')
    }
  }

  const handlePauseAndSave = () => {
    const { answers: cleanedAnswers } = pruneAnswersToFlow(answers)
    const ok = saveQuizProgress(cleanedAnswers)
    if (ok) {
      toast('回答を途中保存しました。「続きから答える」で再開できます')
    }
    navigate('/survey')
  }

  const handlePreviewPartial = () => {
    const { answers: cleanedAnswers } = pruneAnswersToFlow(answers)
    previewPartialQuiz(cleanedAnswers)
    navigate('/survey/result')
  }

  const selectedOpt = answers[curQId]
  const answeredCount = flow.filter((qId) => answers[qId] !== undefined).length

  return (
    <div className="screen-anim">
      {/* 上部プログレスバー */}
      <QuizProgressBar
        current={curIdx + 1}
        total={flow.length}
        answeredCount={answeredCount}
      />
      <p className="note" style={{ marginTop: '-.4rem', marginBottom: '.7rem', fontSize: '.82rem' }}>
        ※ ご回答の内容に合わせて質問数が変わります
      </p>

      {/* 質問カード */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.35rem',
              padding: '.2rem .65rem',
              borderRadius: '999px',
              background: 'var(--brand-tint)',
              fontSize: '.84rem',
              fontWeight: 700,
              color: 'var(--brand-deep)'
            }}
          >
            <span>分野：</span>
            <span>{node.label}</span>
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            style={{ minHeight: '2.2rem', padding: '0 .65rem', fontSize: '.82rem' }}
            onClick={handleToggleSpeak}
            aria-pressed={isSpeaking}
          >
            <Icon name="speaker" />
            {isSpeaking ? '停止' : '読み上げる'}
          </button>
        </div>

        <h2
          ref={questionHeadingRef}
          tabIndex={-1}
          className="qbig screen-focus"
          style={{ marginTop: '.65rem' }}
        >
          {node.text}
        </h2>

        {/* 選択肢 */}
        <div style={{ marginTop: '.8rem' }} role="group" aria-label={node.text}>
          {node.opts.map((opt, idx) => {
            const isSelected = selectedOpt === idx
            return (
              <button
                key={idx}
                type="button"
                className={`opt ${isSelected ? 'on' : ''}`}
                aria-pressed={isSelected}
                onClick={() => handleSelectOption(idx)}
              >
                <span className="mk" aria-hidden="true">
                  {isSelected ? '✓' : ''}
                </span>
                <span className="opt-t">{opt.t}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ナビゲーション操作ボタン */}
      <div className="btn-row" style={{ marginTop: '1.1rem' }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handlePrev}
        >
          {curIdx > 0 ? '前の質問へ' : '案内へ戻る'}
        </button>

        <button
          type="button"
          className="btn btn-sub"
          onClick={handlePauseAndSave}
        >
          途中保存して中断する
        </button>
      </div>

      {answeredCount > 0 && (
        <div style={{ textAlign: 'center', marginTop: '.75rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={handlePreviewPartial}
          >
            ここまでの回答で仮の結果を見る（{answeredCount}問回答済み）
          </button>
        </div>
      )}
    </div>
  )
}
