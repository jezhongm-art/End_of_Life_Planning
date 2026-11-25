import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { QUIZ_NODES } from '../memberC/questions'
import {
  computeQuizFlow,
  computeQuizProgress,
  findOrphanedAnswerIds,
  pruneAnswersToFlow,
  resolveAnswerOption
} from '../memberC/rules'
import { QuizProgressBar } from '../shared/components/ProgressBar'
import { Icon } from '../shared/components/SvgIcons'
import { AccessibleDialog } from '../shared/components/AccessibleDialog'

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

  // 分岐変更で流れから外れた回答の消去確認ダイアログ
  const [orphanDialogOpen, setOrphanDialogOpen] = useState(false)
  const [orphanList, setOrphanList] = useState([])
  const [pendingAction, setPendingAction] = useState(null) // 'next' | 'preview'
  const [acknowledgedOrphansSig, setAcknowledgedOrphansSig] = useState('')
  const keepOrphanBtnRef = useRef(null)

  const questionHeadingRef = useRef(null)
  const hasMountedRef = useRef(false)

  const curQId = flow[curIdx]
  const node = curQId ? QUIZ_NODES[curQId] : null

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

  const selectedOptObj = resolveAnswerOption(curQId, answers[curQId])
  const selectedValue = selectedOptObj?.value
  const isLastQuestion = curIdx + 1 >= flow.length
  const progressInfo = computeQuizProgress(answers, flow)

  // 選択肢タップ：明示的な value を保存し、分岐変化があっても既存回答は勝手に削除しない
  const handleSelectOption = (optValue) => {
    const mergedAnswers = { ...answers, [curQId]: optValue }
    const nextFlow = computeQuizFlow(mergedAnswers)

    setAnswers(mergedAnswers)
    setFlow(nextFlow)
    saveQuizProgress(mergedAnswers)
  }

  const executeAdvance = (targetAnswers, actionType) => {
    if (actionType === 'preview') {
      previewPartialQuiz(targetAnswers)
      navigate('/survey/result')
      return
    }

    const nextFlow = computeQuizFlow(targetAnswers)
    const currentPos = nextFlow.indexOf(curQId)
    const nextIdx = currentPos >= 0 ? currentPos + 1 : curIdx + 1

    if (nextIdx < nextFlow.length) {
      setFlow(nextFlow)
      setCurIdx(nextIdx)
      window.scrollTo(0, 0)
    } else {
      finishQuiz(targetAnswers)
      navigate('/survey/result')
    }
  }

  const checkOrphansAndProceed = (actionType) => {
    const orphans = findOrphanedAnswerIds(answers)
    const sig = orphans.slice().sort().join(',')
    if (orphans.length > 0 && sig !== acknowledgedOrphansSig) {
      setOrphanList(orphans)
      setPendingAction(actionType)
      setOrphanDialogOpen(true)
      return
    }
    executeAdvance(answers, actionType)
  }

  const handleNext = () => {
    if (!selectedValue) {
      toast('上の選択肢からひとつお選びください')
      return
    }
    checkOrphansAndProceed('next')
  }

  const handlePreviewPartial = () => {
    checkOrphansAndProceed('preview')
  }

  const handlePruneOrphansAndProceed = () => {
    const { answers: pruned } = pruneAnswersToFlow(answers)
    setAnswers(pruned)
    setOrphanDialogOpen(false)
    setAcknowledgedOrphansSig('')
    saveQuizProgress(pruned)
    executeAdvance(pruned, pendingAction || 'next')
  }

  const handleKeepOrphansAndProceed = () => {
    const sig = orphanList.slice().sort().join(',')
    setAcknowledgedOrphansSig(sig)
    setOrphanDialogOpen(false)
    executeAdvance(answers, pendingAction || 'next')
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
    saveQuizProgress(answers, '途中まで保存しました。「続きから答える」で再開できます')
    navigate('/survey')
  }

  const orphanNamesText = orphanList
    .map((id) => QUIZ_NODES[id]?.label || id)
    .join('、')

  return (
    <div className="screen-anim">
      {/* 上部進捗バー（分岐で割合が下がらない計算） */}
      <QuizProgressBar
        current={curIdx + 1}
        total={flow.length}
        pct={progressInfo.pct}
      />
      <p className="note" style={{ marginTop: '-.4rem', marginBottom: '.7rem', fontSize: '.82rem' }}>
        ※ お答えに合わせて質問数が変わります（選んでから下の「{isLastQuestion ? '結果を見る' : '次の質問へ進む'}」を押してください）
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

        {/* 選択肢（valueベースで選択状態を管理） */}
        <div style={{ marginTop: '.8rem' }} role="group" aria-label={node.text}>
          {node.opts.map((opt) => {
            const isSelected = selectedValue === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                className={`opt ${isSelected ? 'on' : ''}`}
                aria-pressed={isSelected}
                onClick={() => handleSelectOption(opt.value)}
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
            disabled={!selectedValue}
            onClick={handleNext}
          >
            {!selectedValue
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

      {progressInfo.answeredCount > 0 && (
        <div style={{ textAlign: 'center', marginTop: '.75rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={handlePreviewPartial}
          >
            ここまでの答えで仮の結果を見る（{progressInfo.answeredCount}問回答済み）
          </button>
        </div>
      )}

      {/* 分岐変更で流れから外れた回答の取り扱い確認ダイアログ */}
      <AccessibleDialog
        isOpen={orphanDialogOpen}
        onClose={() => setOrphanDialogOpen(false)}
        title="前の回答の変更により、使われないお答えがあります"
        description={`前の質問の選び直しにより、「${orphanNamesText}」へのお答えは現在の流れでは使われなくなりました。このお答えを整理（削除）してから進みますか？`}
        initialFocusRef={keepOrphanBtnRef}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem', marginTop: '1.1rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handlePruneOrphansAndProceed}
          >
            不要になったお答えを削除して進む
          </button>
          <button
            ref={keepOrphanBtnRef}
            type="button"
            className="btn btn-ghost btn-block"
            onClick={handleKeepOrphansAndProceed}
          >
            お答えを残したまま進む
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => setOrphanDialogOpen(false)}
          >
            もどって選び直す
          </button>
        </div>
      </AccessibleDialog>
    </div>
  )
}
