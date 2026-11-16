import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { QUIZ_NODES } from '../data/questions'
import { computeQuizFlow } from '../data/rules'
import { QuizProgressBar } from '../components/ProgressBar'
import { Icon } from '../components/SvgIcons'

export default function SurveyQuestions() {
  const navigate = useNavigate()
  const { state, saveQuizAnswer, finishQuiz, toast } = useApp()

  // 音声読み上げ管理
  const [isSpeaking, setIsSpeaking] = useState(false)

  // 質問キューの構築
  const [flow, setFlow] = useState([])
  const [curIdx, setCurIdx] = useState(0)

  // ローカルの一時回答ステート
  const [answers, setAnswers] = useState(() => ({ ...state.quizAnswers }))

  // 質問フロー初期化
  useEffect(() => {
    const queue = computeQuizFlow(state.topics)
    setFlow(queue)
    // 既に回答があれば未回答の最初のインデックスを探す
    const firstUnanswered = queue.findIndex((qId) => answers[qId] === undefined)
    if (firstUnanswered >= 0) {
      setCurIdx(firstUnanswered)
    } else {
      setCurIdx(0)
    }
  }, [state.topics])

  const curQId = flow[curIdx]
  const node = curQId ? QUIZ_NODES[curQId] : null

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
          分野選択に戻る
        </button>
      </div>
    )
  }

  const handleSelectOption = (optIdx) => {
    const updatedAnswers = { ...answers, [curQId]: optIdx }
    setAnswers(updatedAnswers)
    saveQuizAnswer(curQId, optIdx)

    const opt = node.opts[optIdx]

    // 分岐があればフローに挿入
    let nextFlow = [...flow]
    if (opt.next && !nextFlow.includes(opt.next)) {
      // 現在の次の位置に挿入
      nextFlow.splice(curIdx + 1, 0, opt.next)
      setFlow(nextFlow)
    }

    // 次の質問へ、または終了
    if (curIdx + 1 < nextFlow.length) {
      setCurIdx(curIdx + 1)
    } else {
      finishQuiz(updatedAnswers)
      navigate('/survey/result')
    }
  }

  const handlePrev = () => {
    if (curIdx > 0) {
      setCurIdx(curIdx - 1)
    } else {
      navigate('/survey')
    }
  }

  const handleFinishEarly = () => {
    finishQuiz(answers)
    navigate('/survey/result')
  }

  const selectedOpt = answers[curQId]

  return (
    <div className="screen-anim">
      {/* 上部プログレスバー */}
      <QuizProgressBar current={curIdx + 1} total={flow.length} />

      {/* 質問カード */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="smallcap" style={{ color: 'var(--blue)' }}>
            {node.label}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            style={{ minHeight: '2.2rem', padding: '0 .65rem', fontSize: '.82rem' }}
            onClick={handleToggleSpeak}
          >
            <Icon name="speaker" />
            {isSpeaking ? '停止' : '読み上げる'}
          </button>
        </div>

        <h2 className="qbig" style={{ marginTop: '.6rem' }}>
          {node.text}
        </h2>

        <p className="note" style={{ color: 'var(--muted)', marginTop: '.5rem' }}>
          当てはまるものを一つ選んでください。
        </p>

        {/* 選択肢 */}
        <div style={{ marginTop: '.8rem' }}>
          {node.opts.map((opt, idx) => {
            const isSelected = selectedOpt === idx
            return (
              <button
                key={idx}
                type="button"
                className={`opt ${isSelected ? 'on' : ''}`}
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
      <div className="btn-row" style={{ marginTop: '1.2rem' }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handlePrev}
        >
          前の質問
        </button>

        <button
          type="button"
          className="btn btn-sub"
          onClick={handleFinishEarly}
        >
          ここで終了して結果を見る
        </button>
      </div>
    </div>
  )
}
