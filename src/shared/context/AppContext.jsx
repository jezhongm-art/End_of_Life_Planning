import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { ITEMS, STATE } from '../../memberB/items'
import {
  computeAnalysisFromAnswers,
  computeQuizFlow,
  computeQuizProgress
} from '../../memberC/rules'
import {
  applyManualStatusSync,
  applyStepToggle,
  computeHomeProgress,
  defaultState,
  makeBlankItems,
  normalizeLoadedState,
  sampleState
} from '../utils/appLogic'

const STORAGE_KEY = 'shukatsu_michishirube_react_v1'

export { defaultState, sampleState, makeBlankItems }

const AppContext = createContext(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

function classifyStorageError(err) {
  const isQuota =
    err?.name === 'QuotaExceededError' ||
    err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err?.code === 22 ||
    err?.code === 1014

  if (isQuota) {
    return {
      type: 'quota',
      message:
        '端末の保存容量がいっぱいのため、変更を保存できませんでした。不要な写真や記録を削除してから、もう一度お試しください。'
    }
  }
  return {
    type: 'storage',
    message:
      'ブラウザへの保存に失敗しました。プライベートブラウズや保存制限が有効な場合は変更が保持されないため、必要に応じて内容を控えてください。'
  }
}

function readInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { state: normalizeLoadedState(parsed), loadError: null }
    }
  } catch (e) {
    console.warn('Failed to load localStorage', e)
    return {
      state: defaultState(),
      loadError: '保存データの読み込みに失敗したため、初期状態で表示しています。'
    }
  }
  return { state: defaultState(), loadError: null }
}

function withSyncedAnalysis(prev, nextItems) {
  if (!prev.quizDone && !prev.quizPreview) {
    return prev.analysis
  }
  return computeAnalysisFromAnswers(prev.quizAnswers, nextItems, {
    isPartial: !prev.quizDone
  })
}

export function AppProvider({ children }) {
  const [initial] = useState(() => readInitialState())
  const [loadError, setLoadError] = useState(initial.loadError)
  const [state, setState] = useState(initial.state)

  const latestStateRef = useRef(state)
  const [saveError, setSaveError] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    latestStateRef.current = state
  }, [state])

  // Apply data-ts on html
  useEffect(() => {
    document.documentElement.setAttribute('data-ts', state.textSize || '2')
  }, [state.textSize])

  const toast = useCallback((msg) => {
    if (!msg) return
    setToastMessage(msg)
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 2800)
  }, [])

  const persistState = useCallback((nextState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
      setSaveError(null)
      return true
    } catch (e) {
      console.warn('Failed to save to localStorage', e)
      const errInfo = classifyStorageError(e)
      setSaveError(errInfo)
      return false
    }
  }, [])

  const commitState = useCallback(
    (updater, options = {}) => {
      const { successMessage, resolveMessage, abortOnSaveError = false } = options
      const prev = latestStateRef.current
      const nextState = typeof updater === 'function' ? updater(prev) : updater
      const ok = persistState(nextState)

      if (!ok && abortOnSaveError) {
        toast('保存に失敗しました。画面上部のエラー案内をご確認ください。')
        return false
      }

      latestStateRef.current = nextState
      setState(nextState)

      if (ok) {
        const msg = resolveMessage ? resolveMessage(nextState, prev) : successMessage
        if (msg) toast(msg)
      } else {
        toast('保存に失敗しました。画面上部のエラー案内をご確認ください。')
      }
      return ok
    },
    [persistState, toast]
  )

  const clearSaveError = () => setSaveError(null)
  const clearLoadError = () => setLoadError(null)

  const retrySave = () => {
    const ok = persistState(latestStateRef.current)
    if (ok) {
      toast('保存に成功しました')
    } else {
      toast('再保存に失敗しました。容量または設定をご確認ください。')
    }
    return ok
  }

  const updateItemStatus = (itemId, newState, options = { syncSteps: true }) => {
    const label = STATE[newState]?.t || newState
    return commitState(
      (prev) => {
        const nextItems = applyManualStatusSync(prev.items, itemId, newState, options)
        return {
          ...prev,
          items: nextItems,
          analysis: withSyncedAnalysis(prev, nextItems)
        }
      },
      { successMessage: `状態を「${label}」に更新しました` }
    )
  }

  const toggleItemStep = (itemId, stepIndex) => {
    let feedbackMsg = ''
    const ok = commitState(
      (prev) => {
        const result = applyStepToggle(prev.items, itemId, stepIndex)
        const itemTitle = ITEMS.find((it) => it.id === itemId)?.title || '項目'
        if (result.allDone) {
          feedbackMsg = `「${itemTitle}」の手順がすべて完了しました`
        } else if (result.isChecked) {
          feedbackMsg = `手順 ${stepIndex + 1} を完了にしました`
        } else {
          feedbackMsg = `手順 ${stepIndex + 1} を完了前に戻しました`
        }
        return {
          ...prev,
          items: result.nextItems,
          analysis: withSyncedAnalysis(prev, result.nextItems)
        }
      },
      { resolveMessage: () => feedbackMsg }
    )
    return ok
  }

  const setItemPriority = (itemId) => {
    return commitState(
      (prev) => ({
        ...prev,
        priority: itemId
      }),
      { successMessage: '「次にすること」に設定しました' }
    )
  }

  const updateSettings = (partial, successMessage) => {
    return commitState(
      (prev) => ({
        ...prev,
        ...partial
      }),
      { successMessage }
    )
  }

  const setTextSize = (ts) => {
    return commitState(
      (prev) => ({ ...prev, textSize: ts }),
      { successMessage: '文字サイズを変更しました' }
    )
  }

  const cycleTextSize = () => {
    const labels = { '1': '標準', '2': '大きめ', '3': '特大' }
    const next = latestStateRef.current.textSize === '1' ? '2' : latestStateRef.current.textSize === '2' ? '3' : '1'
    return commitState(
      (prev) => ({ ...prev, textSize: next }),
      { successMessage: `文字サイズを「${labels[next]}」に変更しました` }
    )
  }

  const updateTopics = (topics) => {
    return commitState((prev) => ({ ...prev, topics }))
  }

  const saveQuizProgress = (answers, successMessage) => {
    return commitState(
      (prev) => ({
        ...prev,
        quizAnswers: { ...answers },
        quizDone: false
      }),
      { successMessage }
    )
  }

  const saveQuizAnswer = (qId, optValue) => {
    return commitState((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, [qId]: optValue },
      quizDone: false
    }))
  }

  const previewPartialQuiz = (answers) => {
    return commitState((prev) => {
      const targetAnswers = answers ? { ...answers } : prev.quizAnswers
      const analysis = computeAnalysisFromAnswers(targetAnswers, prev.items, { isPartial: true })
      return {
        ...prev,
        quizAnswers: targetAnswers,
        quizDone: false,
        quizPreview: true,
        analysis
      }
    })
  }

  const finishQuiz = (answers) => {
    return commitState((prev) => {
      const targetAnswers = answers ? { ...answers } : prev.quizAnswers
      const analysis = computeAnalysisFromAnswers(targetAnswers, prev.items, { isPartial: false })
      return {
        ...prev,
        quizAnswers: targetAnswers,
        quizDone: true,
        quizPreview: false,
        analysis
      }
    })
  }

  const resetQuiz = () => {
    return commitState(
      (prev) => ({
        ...prev,
        quizAnswers: {},
        quizDone: false,
        quizPreview: false,
        analysis: null
      }),
      { successMessage: 'アンケートのお答えを消去しました' }
    )
  }

  const getQuizStatus = () => {
    const flow = computeQuizFlow(state.quizAnswers)
    const { pct, answeredCount, totalCount } = computeQuizProgress(state.quizAnswers, flow)
    const isCompleted = Boolean(state.quizDone)
    const isInProgress = !isCompleted && answeredCount > 0
    return {
      flow,
      pct,
      totalCount,
      answeredCount,
      remainingCount: Math.max(0, totalCount - answeredCount),
      isCompleted,
      isInProgress
    }
  }

  const addWish = (text) => {
    const newWish = {
      id: `w_${Date.now()}`,
      text,
      done: false
    }
    return commitState(
      (prev) => ({
        ...prev,
        wishes: [newWish, ...prev.wishes]
      }),
      { successMessage: 'やってみたいことを登録しました', abortOnSaveError: true }
    )
  }

  const toggleWish = (wishId) => {
    const target = latestStateRef.current.wishes.find((w) => w.id === wishId)
    const nextDone = !target?.done
    const msg = nextDone && target?.text ? `「${target.text}」を達成しました！` : undefined
    return commitState(
      (prev) => ({
        ...prev,
        wishes: prev.wishes.map((w) => (w.id === wishId ? { ...w, done: nextDone } : w))
      }),
      { successMessage: msg }
    )
  }

  const deleteWish = (wishId) => {
    return commitState(
      (prev) => ({
        ...prev,
        wishes: prev.wishes.filter((w) => w.id !== wishId),
        rewardWishId: prev.rewardWishId === wishId ? null : prev.rewardWishId
      }),
      { successMessage: 'やってみたいことを削除しました' }
    )
  }

  const setRewardWish = (wishId) => {
    return commitState(
      (prev) => ({
        ...prev,
        rewardWishId: wishId
      }),
      { successMessage: 'ごほうび目標に設定しました' }
    )
  }

  const addMemo = ({ cat, title, text, tag, image }) => {
    const newMemo = {
      id: `m_${Date.now()}`,
      cat,
      title,
      text,
      image: image || null,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      tag: tag || ''
    }
    return commitState(
      (prev) => ({
        ...prev,
        memos: [newMemo, ...prev.memos]
      }),
      { successMessage: '思い出を保存しました', abortOnSaveError: true }
    )
  }

  const updateMemo = (id, partial) => {
    return commitState(
      (prev) => ({
        ...prev,
        memos: prev.memos.map((m) => (m.id === id ? { ...m, ...partial } : m))
      }),
      { successMessage: '思い出を更新しました', abortOnSaveError: true }
    )
  }

  const deleteMemo = (id) => {
    return commitState(
      (prev) => ({
        ...prev,
        memos: prev.memos.filter((m) => m.id !== id)
      }),
      { successMessage: '思い出を削除しました' }
    )
  }

  const addTalkLog = ({ partner, decided, pending, memo }) => {
    const newLog = {
      id: `t_${Date.now()}`,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      partner,
      decided,
      pending,
      memo
    }
    return commitState(
      (prev) => ({
        ...prev,
        talkLogs: [newLog, ...prev.talkLogs]
      }),
      { successMessage: '話し合いを記録しました', abortOnSaveError: true }
    )
  }

  const deleteTalkLog = (id) => {
    return commitState(
      (prev) => ({
        ...prev,
        talkLogs: prev.talkLogs.filter((t) => t.id !== id)
      }),
      { successMessage: '話し合いの記録を削除しました' }
    )
  }

  const updateRewardConsult = (partial) => {
    return commitState((prev) => ({
      ...prev,
      rewardConsult: { ...prev.rewardConsult, ...partial }
    }))
  }

  const loadBlankPreset = () => {
    const blank = defaultState()
    return commitState(blank, { successMessage: '最初の状態に戻しました' })
  }

  const loadSamplePreset = () => {
    const sample = sampleState()
    return commitState(sample, { successMessage: '入力例（お試しデータ）を読み込みました' })
  }

  const resetAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setSaveError(null)
    } catch (e) {
      setSaveError(classifyStorageError(e))
    }
    const blank = defaultState()
    latestStateRef.current = blank
    setState(blank)
    toast('すべての保存データを消去しました')
  }

  const calcProgress = () => computeHomeProgress(state)

  const value = {
    state,
    saveError,
    loadError,
    clearSaveError,
    clearLoadError,
    retrySave,
    calcProgress,
    getQuizStatus,
    updateItemStatus,
    toggleItemStep,
    setItemPriority,
    updateSettings,
    setTextSize,
    cycleTextSize,
    updateTopics,
    saveQuizProgress,
    saveQuizAnswer,
    previewPartialQuiz,
    finishQuiz,
    resetQuiz,
    addWish,
    toggleWish,
    deleteWish,
    setRewardWish,
    addMemo,
    updateMemo,
    deleteMemo,
    addTalkLog,
    deleteTalkLog,
    updateRewardConsult,
    loadBlankPreset,
    loadSamplePreset,
    resetAllData,
    toast
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </AppContext.Provider>
  )
}
