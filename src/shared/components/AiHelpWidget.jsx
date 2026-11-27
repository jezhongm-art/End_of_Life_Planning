import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AccessibleDialog } from './AccessibleDialog'
import { Icon } from './SvgIcons'
import { askGeminiSupport, getScreenSupportContext } from '../utils/geminiClient'
import { useSpeechInput } from '../utils/useSpeechInput'

const FOLLOW_UP_CHIPS = [
  'もう少しわかりやすく教えてください',
  '最初にやることだけ1つ教えてください'
]

export function AiHelpWidget() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state, apiKey, hasApiKey, toast } = useApp()

  const [isOpen, setIsOpen] = useState(false)
  const [questionInput, setQuestionInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [messages, setMessages] = useState([]) // [{ id, role: 'user' | 'model', text }]
  const [speakingMsgId, setSpeakingMsgId] = useState(null)

  const closeBtnRef = useRef(null)
  const chatEndRef = useRef(null)
  const prevScreenLabelRef = useRef('')

  const supportCtx = getScreenSupportContext(location.pathname, location.search, state)

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeakingMsgId(null)
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

  // 画面が変わったらダイアログを閉じ、別の項目・画面に移ったら会話コンテキストを初期化する
  useEffect(() => {
    setIsOpen(false)
    if (prevScreenLabelRef.current && prevScreenLabelRef.current !== supportCtx.screenLabel) {
      setMessages([])
      setErrorMsg('')
    }
    prevScreenLabelRef.current = supportCtx.screenLabel
  }, [location.pathname, location.search, supportCtx.screenLabel])

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking()
      speechInput.stop()
      setErrorMsg('')
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [isOpen, messages, loading])

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  const submitQuestion = async (rawQuestion, fromTypedInput = false) => {
    const q = String(rawQuestion || '').trim()
    if (!q || loading) return

    stopSpeaking()
    speechInput.stop()
    setErrorMsg('')
    setLoading(true)

    const userMsg = { id: `u_${Date.now()}`, role: 'user', text: q }
    const previousMessages = messages
    setMessages([...previousMessages, userMsg])
    if (fromTypedInput) {
      setQuestionInput('')
    }

    try {
      const answer = await askGeminiSupport({
        apiKey,
        question: q,
        history: previousMessages,
        contextSummary: supportCtx.contextSummary
      })
      const modelMsg = { id: `m_${Date.now() + 1}`, role: 'model', text: answer }
      setMessages((prev) => [...prev, modelMsg])
    } catch (err) {
      // 失敗時は送信前の会話に戻し、入力していた文字も復元して再送しやすくする
      setMessages(previousMessages)
      if (fromTypedInput) {
        setQuestionInput(q)
      }
      setErrorMsg(err?.message || 'AIから返答を受け取れませんでした。')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    submitQuestion(questionInput, true)
  }

  const handleToggleSpeakMsg = (msg) => {
    if (!msg?.text) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast('お使いのブラウザは音声読み上げに対応していません')
      return
    }
    if (speakingMsgId === msg.id) {
      stopSpeaking()
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(msg.text)
    u.lang = 'ja-JP'
    u.rate = 0.9
    u.onend = () => setSpeakingMsgId(null)
    u.onerror = () => setSpeakingMsgId(null)
    setSpeakingMsgId(msg.id)
    window.speechSynthesis.speak(u)
  }

  const handleResetChat = () => {
    stopSpeaking()
    setMessages([])
    setErrorMsg('')
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
        ) : (
          <div style={{ marginTop: '.65rem' }}>
            {messages.length === 0 ? (
              <>
                <p className="card-sub" style={{ marginTop: 0 }}>
                  下のよくある質問を押すか、声・文字で話しかけて会話を始められます。
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
                      onClick={() => submitQuestion(preset, false)}
                    >
                      <span className="opt-t" style={{ fontSize: '.94rem' }}>{preset}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* 会話スレッド（ご年配でも読みやすい大きなチャット表示） */}
                <div className="ai-chat-list" role="log" aria-live="polite" aria-label="AIとの会話履歴">
                  {messages.map((msg) =>
                    msg.role === 'user' ? (
                      <div key={msg.id} className="ai-msg-user">
                        <span className="ai-msg-label">あなた</span>
                        <div className="ai-msg-user-bubble">{msg.text}</div>
                      </div>
                    ) : (
                      <div key={msg.id} className="ai-msg-model">
                        <span className="ai-msg-label">AIの答え</span>
                        <div className="ai-answer-box">{msg.text}</div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-small"
                          style={{ marginTop: '.4rem', minHeight: '2.25rem', fontSize: '.84rem' }}
                          onClick={() => handleToggleSpeakMsg(msg)}
                          aria-pressed={speakingMsgId === msg.id}
                        >
                          <Icon name="speaker" />
                          {speakingMsgId === msg.id ? '読み上げを止める' : '声で聴く'}
                        </button>
                      </div>
                    )
                  )}

                  {loading && (
                    <div className="ai-msg-model">
                      <span className="ai-msg-label">AIの答え</span>
                      <div className="ai-answer-box" style={{ color: 'var(--muted)' }}>
                        お答えをまとめています…
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* つづけて聞きやすいワンタップ候補 */}
                {!loading && (
                  <div className="chips" style={{ marginTop: '.65rem', marginBottom: '.2rem' }}>
                    {FOLLOW_UP_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="chip"
                        style={{ minHeight: '2.35rem', fontSize: '.82rem', padding: '0 .75rem' }}
                        onClick={() => submitQuestion(chip, false)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 音声入力＋文字入力フォーム（会話中でも続けて打てる） */}
            <form onSubmit={handleFormSubmit} style={{ marginTop: '.85rem' }}>
              <label htmlFor="ai-question-input" className="card-sub" style={{ fontWeight: 700, display: 'block' }}>
                {messages.length > 0 ? 'つづけて聞く（会話できます）' : '自分の言葉で聞く'}
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
                  {speechInput.isListening
                    ? '聞いています…（話し終わったら押す）'
                    : messages.length > 0
                      ? '声でつづけて話す'
                      : '声で話す（マイク）'}
                </button>
              )}

              <input
                id="ai-question-input"
                type="text"
                className="input"
                style={{ marginTop: '.55rem' }}
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder={
                  messages.length > 0
                    ? 'つづきの質問を入力できます'
                    : '例）通帳はどこにしまう？'
                }
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
                  {loading
                    ? '考えています…'
                    : messages.length > 0
                      ? 'つづけて聞く'
                      : 'AIに聞いてみる'}
                </button>
              </div>

              {messages.length > 0 && (
                <div style={{ marginTop: '.55rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    disabled={loading}
                    onClick={handleResetChat}
                  >
                    最初から別のことを聞く
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </AccessibleDialog>
    </>
  )
}
