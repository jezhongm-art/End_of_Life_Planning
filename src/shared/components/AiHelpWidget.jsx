import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AccessibleDialog } from './AccessibleDialog'
import { Icon } from './SvgIcons'
import { askGeminiSupport, getScreenSupportContext } from '../utils/geminiClient'
import { useSpeechInput } from '../utils/useSpeechInput'

export function AiHelpWidget() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state, apiKey, hasApiKey, toast } = useApp()

  const [isOpen, setIsOpen] = useState(false)
  const [questionInput, setQuestionInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [answerState, setAnswerState] = useState(null) // { question, answer }
  const [isSpeaking, setIsSpeaking] = useState(false)

  const closeBtnRef = useRef(null)

  const supportCtx = getScreenSupportContext(location.pathname, location.search, state)

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  const speechInput = useSpeechInput({
    onResult: (transcript) => {
      setQuestionInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
      setErrorMsg('')
    },
    onError: (msg) => {
      setErrorMsg(msg)
    }
  })

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking()
      speechInput.stop()
      setErrorMsg('')
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  const submitQuestion = async (rawQuestion) => {
    const q = String(rawQuestion || '').trim()
    if (!q || loading) return

    stopSpeaking()
    speechInput.stop()
    setErrorMsg('')
    setLoading(true)

    try {
      const answer = await askGeminiSupport({
        apiKey,
        question: q,
        contextSummary: supportCtx.contextSummary
      })
      setAnswerState({ question: q, answer })
      setQuestionInput('')
    } catch (err) {
      setErrorMsg(err?.message || 'AIから返答を受け取れませんでした。')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    submitQuestion(questionInput)
  }

  const handleToggleSpeakAnswer = () => {
    if (!answerState?.answer) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast('お使いのブラウザは音声読み上げに対応していません')
      return
    }
    if (isSpeaking) {
      stopSpeaking()
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(answerState.answer)
    u.lang = 'ja-JP'
    u.rate = 0.9
    u.onend = () => setIsSpeaking(false)
    u.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(u)
  }

  const handleGoSettings = () => {
    setIsOpen(false)
    navigate('/settings')
  }

  return (
    <>
      <button
        type="button"
        className="ai-fab"
        onClick={() => setIsOpen(true)}
        aria-label="困ったときにAIへ聞く"
      >
        <Icon name="bulb" />
        <span>困ったら聞く</span>
      </button>

      <AccessibleDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`${supportCtx.screenLabel}について聞く`}
        initialFocusRef={closeBtnRef}
        dialogClassName="ai-dialog"
      >
        {!hasApiKey ? (
          <div style={{ marginTop: '.75rem' }}>
            <p className="plain-lead" style={{ marginTop: 0 }}>
              AIによる相談を使うには、はじめに「文字の大きさ・設定（基本設定）」画面で案内用のキーを入力していただく必要があります。
            </p>
            <p className="note" style={{ marginTop: '.5rem' }}>
              ※ 入力が難しい場合は、ご家族や身近な方にお願いして設定してもらうこともできます。
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginTop: '1.1rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handleGoSettings}
              >
                基本設定を開いてキーを入力する
              </button>
              <button
                ref={closeBtnRef}
                type="button"
                className="btn btn-ghost btn-block"
                onClick={() => setIsOpen(false)}
              >
                とじる
              </button>
            </div>
          </div>
        ) : answerState ? (
          <div style={{ marginTop: '.75rem' }}>
            <p style={{ fontSize: '.86rem', color: 'var(--muted)', fontWeight: 700 }}>
              聞いたこと：{answerState.question}
            </p>

            <div className="ai-answer-box" role="region" aria-label="AIからの答え">
              {answerState.answer}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-sub btn-block"
                onClick={handleToggleSpeakAnswer}
                aria-pressed={isSpeaking}
              >
                <Icon name="speaker" />
                {isSpeaking ? '読み上げを止める' : 'この答えを声で聴く'}
              </button>

              <div className="btn-row" style={{ marginTop: 0 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    stopSpeaking()
                    setAnswerState(null)
                    setErrorMsg('')
                  }}
                >
                  別のことを聞く
                </button>
                <button
                  ref={closeBtnRef}
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsOpen(false)}
                >
                  とじる
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '.65rem' }}>
            <p className="card-sub" style={{ marginTop: 0 }}>
              下のよくある質問を押すか、声・文字でそのままお聞きください。
            </p>

            {/* ワンタップ質問ボタン */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.75rem' }}>
              {supportCtx.presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="opt"
                  style={{ marginTop: 0, minHeight: '3rem', padding: '.65rem .85rem' }}
                  disabled={loading}
                  onClick={() => submitQuestion(preset)}
                >
                  <span className="opt-t" style={{ fontSize: '.94rem' }}>{preset}</span>
                </button>
              ))}
            </div>

            {/* 音声入力＋短い入力フォーム */}
            <form onSubmit={handleFormSubmit} style={{ marginTop: '.95rem' }}>
              <label htmlFor="ai-question-input" className="card-sub" style={{ fontWeight: 700, display: 'block' }}>
                自分の言葉で聞く
              </label>

              {speechInput.isSupported && (
                <button
                  type="button"
                  className={`btn btn-block mic-btn ${speechInput.isListening ? 'listening' : ''}`}
                  style={{ marginTop: '.45rem' }}
                  disabled={loading}
                  onClick={() => (speechInput.isListening ? speechInput.stop() : speechInput.start())}
                >
                  <Icon name="speaker" />
                  {speechInput.isListening ? '聞いています…（話し終わったら押す）' : '声で話す（マイク）'}
                </button>
              )}

              <input
                id="ai-question-input"
                type="text"
                className="input"
                style={{ marginTop: '.55rem' }}
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="例）通帳はどこにしまう？"
                disabled={loading}
              />

              {errorMsg && (
                <p
                  role="alert"
                  style={{
                    marginTop: '.55rem',
                    padding: '.55rem .75rem',
                    borderRadius: 'var(--radius-s)',
                    background: 'var(--rose-tint)',
                    color: 'var(--rose)',
                    fontSize: '.88rem',
                    fontWeight: 700
                  }}
                >
                  {errorMsg}
                </p>
              )}

              <div className="btn-row" style={{ marginTop: '.75rem' }}>
                <button
                  ref={closeBtnRef}
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsOpen(false)}
                >
                  とじる
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !questionInput.trim()}
                >
                  {loading ? '考えています…' : 'AIに聞いてみる'}
                </button>
              </div>
            </form>
          </div>
        )}
      </AccessibleDialog>
    </>
  )
}
