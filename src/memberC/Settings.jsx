import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { AccessibleDialog } from '../shared/components/AccessibleDialog'
import { GEMINI_MODEL, testGeminiConnection } from '../shared/utils/geminiClient'

const TEXT_SIZE_OPTIONS = [
  { id: '1', label: '標準（17px）' },
  { id: '2', label: '大きめ（19px）' },
  { id: '3', label: '特大（21.5px）' }
]

export default function Settings() {
  const navigate = useNavigate()
  const {
    state,
    apiKey,
    hasApiKey,
    saveApiKey,
    removeApiKey,
    updateSettings,
    setTextSize,
    loadSamplePreset,
    resetAllData
  } = useApp()

  const [nameInput, setNameInput] = useState(state.name || '')
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingKey, setTestingKey] = useState(false)
  const [testResult, setTestResult] = useState(null) // { ok: boolean, message: string }

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showSampleConfirm, setShowSampleConfirm] = useState(false)

  const resetCancelRef = useRef(null)
  const sampleCancelRef = useRef(null)

  useEffect(() => {
    setNameInput(state.name || '')
  }, [state.name])

  useEffect(() => {
    setApiKeyInput(apiKey || '')
  }, [apiKey])

  const handleSaveName = (e) => {
    e.preventDefault()
    updateSettings({ name: nameInput.trim() }, 'お名前を保存しました')
  }

  const handleSaveApiKey = (e) => {
    e.preventDefault()
    setTestResult(null)
    saveApiKey(apiKeyInput)
  }

  const handleTestApiKey = async () => {
    const keyToTest = apiKeyInput.trim() || apiKey
    if (!keyToTest) {
      setTestResult({ ok: false, message: '先にAPIキーをご入力ください。' })
      return
    }
    setTestingKey(true)
    setTestResult(null)
    try {
      await testGeminiConnection(keyToTest)
      setTestResult({
        ok: true,
        message: `AI（${GEMINI_MODEL}）との接続に成功しました。このままご利用いただけます。`
      })
    } catch (err) {
      setTestResult({
        ok: false,
        message: err?.message || '接続を確かめられませんでした。'
      })
    } finally {
      setTestingKey(false)
    }
  }

  const handleClearApiKey = () => {
    setApiKeyInput('')
    setTestResult(null)
    removeApiKey()
  }

  const handleReset = () => {
    resetAllData()
    setShowResetConfirm(false)
    navigate('/')
  }

  const handleLoadSample = () => {
    loadSamplePreset()
    setShowSampleConfirm(false)
  }

  return (
    <div className="screen-anim">
      {/* お名前設定 */}
      <section className="card">
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>
          <label htmlFor="settings-name-input">お名前</label>
        </h3>
        <p className="card-sub">ホーム画面などで表示されるお名前です。</p>

        <form onSubmit={handleSaveName} style={{ marginTop: '.6rem' }}>
          <input
            id="settings-name-input"
            type="text"
            className="input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="例：ニックネームやお名前"
          />
          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: '.7rem' }}
          >
            お名前を保存する
          </button>
        </form>
      </section>

      {/* 文字サイズ変更 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>文字の大きさ</h3>
        <p className="card-sub">アプリ全体の文字の大きさを切り替えます。</p>

        <div
          className="segtabs segtabs-3"
          style={{ marginTop: '.7rem', marginBottom: 0 }}
          role="group"
          aria-label="文字の大きさの選択"
        >
          {TEXT_SIZE_OPTIONS.map((opt) => {
            const isSelected = state.textSize === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                className={`segtab ${isSelected ? 'on' : ''}`}
                aria-pressed={isSelected}
                onClick={() => setTextSize(opt.id)}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* AI相談機能（Gemini APIキー設定） */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem', flexWrap: 'wrap' }}>
          <h3 className="card-title" style={{ fontSize: '1.04rem' }}>
            <label htmlFor="settings-apikey-input">AI相談機能（Gemini）のキー設定</label>
          </h3>
          <span className={`st ${hasApiKey ? 's-done' : 's-notyet'}`}>
            <span className="mk" aria-hidden="true">{hasApiKey ? '✓' : '○'}</span>
            {hasApiKey ? '設定済み' : '未設定'}
          </span>
        </div>

        <p className="card-sub">
          右下の「困ったら聞く」や文章の整え機能を使うためのキー（モデル：{GEMINI_MODEL}）を設定します。
        </p>

        <form onSubmit={handleSaveApiKey} style={{ marginTop: '.7rem' }}>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <input
              id="settings-apikey-input"
              type={showApiKey ? 'text' : 'password'}
              className="input"
              style={{ flex: 1 }}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Google AI Studio の APIキーを入力"
              autoComplete="off"
            />
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => setShowApiKey((v) => !v)}
              aria-pressed={showApiKey}
            >
              {showApiKey ? '隠す' : '表示'}
            </button>
          </div>

          <div className="btn-row" style={{ marginTop: '.75rem' }}>
            <button type="submit" className="btn btn-primary">
              キーを保存する
            </button>
            <button
              type="button"
              className="btn btn-sub"
              disabled={testingKey || (!apiKeyInput.trim() && !apiKey)}
              onClick={handleTestApiKey}
            >
              {testingKey ? '確認中…' : '接続を確かめる'}
            </button>
          </div>

          {hasApiKey && (
            <div style={{ marginTop: '.55rem' }}>
              <button
                type="button"
                className="btn btn-ghost btn-block btn-small"
                style={{ color: 'var(--rose)' }}
                onClick={handleClearApiKey}
              >
                保存済みのキーを消去する
              </button>
            </div>
          )}
        </form>

        {testResult && (
          <p
            role="status"
            style={{
              marginTop: '.7rem',
              padding: '.6rem .8rem',
              borderRadius: 'var(--radius-s)',
              background: testResult.ok ? 'var(--brand-tint)' : 'var(--rose-tint)',
              color: testResult.ok ? 'var(--brand-deep)' : 'var(--rose)',
              fontSize: '.88rem',
              fontWeight: 700
            }}
          >
            {testResult.message}
          </p>
        )}

        <p className="note" style={{ fontSize: '.82rem', marginTop: '.7rem' }}>
          ※ キーはこの端末のブラウザ内だけに保存され、GoogleのGemini API以外には送信されません。共有パソコンをお使いの場合は、利用後に「保存済みのキーを消去する」を押してください（可能であればGoogle AI Studio側でも利用上限や接続先制限の設定をおすすめします）。
        </p>
      </section>

      {/* 入力例（お試しデータ）体験 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>入力例（お試しデータ）を試す</h3>
        <p className="card-sub">
          最初の状態ではご家族のお名前や会話記録は空になっています。記入例や進み具合のイメージを見たいときだけ、入力例を読み込めます。
        </p>
        <div style={{ marginTop: '.7rem' }}>
          <button
            type="button"
            className="btn btn-sub btn-block"
            onClick={() => setShowSampleConfirm(true)}
          >
            入力例（お試しデータ）を読み込む
          </button>
        </div>
      </section>

      {/* 初回案内の見直し */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.04rem' }}>初回案内の見直し</h3>
        <p className="card-sub">
          アプリの概要や3つの流れをもう一度確認できます。
        </p>
        <div style={{ marginTop: '.7rem' }}>
          <Link to="/guide" className="btn btn-ghost btn-block">
            初回案内を見直す
          </Link>
        </div>
      </section>

      {/* データ削除 */}
      <section className="card" style={{ marginTop: '1rem', borderColor: 'var(--rose)' }}>
        <h3 className="card-title" style={{ color: 'var(--rose)', fontSize: '1.04rem' }}>
          データの全消去
        </h3>
        <p className="card-sub">
          この端末のブラウザ内に保存されている進み具合・アンケートのお答え・思い出・話し合い記録・APIキーをすべて消去します。
        </p>
        <div style={{ marginTop: '.7rem' }}>
          <button
            type="button"
            className="btn btn-danger btn-block"
            onClick={() => setShowResetConfirm(true)}
          >
            保存データをすべて消去する
          </button>
        </div>
      </section>

      {/* 入力例読み込み確認ダイアログ */}
      <AccessibleDialog
        isOpen={showSampleConfirm}
        onClose={() => setShowSampleConfirm(false)}
        title="入力例（お試しデータ）を読み込みますか？"
        description="いまの進み具合や記録が、記入例（お試しデータ）に置き換わります。あとから「保存データをすべて消去する」でいつでも空の状態に戻せます。"
        initialFocusRef={sampleCancelRef}
      >
        <div className="btn-row" style={{ marginTop: '1.2rem' }}>
          <button
            ref={sampleCancelRef}
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowSampleConfirm(false)}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleLoadSample}
          >
            読み込む
          </button>
        </div>
      </AccessibleDialog>

      {/* 全削除確認ダイアログ */}
      <AccessibleDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="すべてのデータを削除しますか？"
        description="この操作を行うと、これまでに登録した準備の進捗、アンケートの回答、思い出、話し合い記録、保存したAPIキーなどがすべて消去され、空の初期状態に戻ります。"
        initialFocusRef={resetCancelRef}
      >
        <div className="btn-row" style={{ marginTop: '1.2rem' }}>
          <button
            ref={resetCancelRef}
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowResetConfirm(false)}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleReset}
          >
            削除する
          </button>
        </div>
      </AccessibleDialog>
    </div>
  )
}
