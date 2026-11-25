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

  // 質問が切り替わったときに質問文へフォーカスを移動し、読み上げ中なら止める
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
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
      toast('お使いのブラウザは音声読み上げに対応していません')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      toast('読み上げを止めました')
      return
    }

    if (!node) return
    window.speechSynthesis.cancel()
    const optionsText = node.opts.map((o, i) => `${i + 1}番、${o.t}`).join('。')
    const textToSpeak = `${node.label}についての質問です。${node.text}。選択肢は、${optionsText}、です。`
    const u = new SpeechSynthesisUtterance(textToSpeak)
    u.lang = 'ja-JP'
    u.rate = 0.9
    u.onend = () => setIsSpeaking(false)
    u.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(u)
    toast('質問と選択肢を読み上げています')
  }

  // 画面離脱時に読み上げを止める
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

  const selectedOpt = answers[curQId]
  const isLastQuestion = curIdx + 1 >= flow.length
  const answeredCount = flow.filter((qId) => answers[qId] !== undefined).length

  // 誤タップ防止：選択肢タップ時は選択状態の記録と分岐更新のみ行い、自動では進まない
  const handleSelectOption = (optIdx) => {
    const mergedAnswers = { ...answers, [curQId]: optIdx }
    const { flow: nextFlow, answers: cleanedAnswers } = pruneAnswersToFlow(mergedAnswers)

    setAnswers(cleanedAnswers)
    setFlow(nextFlow)
    saveQuizProgress(cleanedAnswers)
  }

  // 「次の質問へ」または「完了して結果を見る」
  const handleNext = () => {
    if (selectedOpt === undefined) {
      toast('上の選択肢からひとつお選びください')
      return
    }
    const { flow: nextFlow, answers: cleanedAnswers } = pruneAnswersToFlow(answers)
    const currentPos = nextFlow.indexOf(curQId)
    const nextIdx = currentPos >= 0 ? currentPos + 1 : curIdx + 1

    if (nextIdx < nextFlow.length) {
      setFlow(nextFlow)
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
      toast('途中まで保存しました。「続きから答える」で再開できます')
    }
    navigate('/survey')
  }

  const handlePreviewPartial = () => {
    const { answers: cleanedAnswers } = pruneAnswersToFlow(answers)
    previewPartialQuiz(cleanedAnswers)
    navigate('/survey/result')
  }

  return (
    <div className="screen-anim">
      {/* 上部進捗バー */}
      <QuizProgressBar
        current={curIdx + 1}
        total={flow.length}
        answeredCount={answeredCount}
      />
      <p className="note" style={{ marginTop: '-.4rem', marginBottom: '.7rem', fontSize: '.82rem' }}>
        ※ お答えに合わせて質問数が変わります（選んでから下の「{isLastQuestion ? '結果を見る' : '次の質問へ'}」を押してください）
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
            style={{ minHeight: '2.35rem', padding: '0 .75rem', fontSize: '.84rem' }}
            onClick={handleToggleSpeak}
            aria-pressed={isSpeaking}
          >
            <Icon name="speaker" />
            {isSpeaking ? '読み上げを止める' : '音声で聴く'}
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

        {/* 確認してから進む主ボタン */}
        <div style={{ marginTop: '1.1rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={selectedOpt === undefined}
            onClick={handleNext}
          >
            {selectedOpt === undefined
              ? '上の選択肢からひとつお選びください'
              : isLastQuestion
                ? '回答を完了して結果を見る'
                : '次の質問へ進む'}
          </button>
        </div>
      </section>

      {/* サブ操作ボタン */}
      <div className="btn-row" style={{ marginTop: '1rem' }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handlePrev}
        >
          {curIdx > 0 ? '前の質問にもどる' : '案内にもどる'}
        </button>

        <button
          type="button"
          className="btn btn-sub"
          onClick={handlePauseAndSave}
        >
          途中保存して休む
        </button>
      </div>

      {answeredCount > 0 && (
        <div style={{ textAlign: 'center', marginTop: '.75rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={handlePreviewPartial}
          >
            ここまでの答えで仮の結果を見る（{answeredCount}問回答済み）
          </button>
        </div>
      )}
    </div>
  )
}
