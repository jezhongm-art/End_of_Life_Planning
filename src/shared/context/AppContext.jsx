import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { ITEMS, STATE } from '../../memberB/items'
import { computeAnalysisFromAnswers, computeQuizFlow, pruneAnswersToFlow } from '../../memberC/rules'

const STORAGE_KEY = 'shukatsu_michishirube_react_v1'

const AppContext = createContext(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export function makeBlankItems() {
  const obj = {}
  ITEMS.forEach((it) => {
    obj[it.id] = {
      state: 'notyet',
      done: it.steps.map(() => false)
    }
  })
  return obj
}

export function defaultState() {
  return {
    seenGuide: false,
    name: '',
    textSize: '2',
    priority: 'money',
    items: makeBlankItems(),
    topics: { money: true, medical: true, house: false, grave: false, family: false, pet: false },
    quizAnswers: {},
    quizDone: false,
    analysis: null,
    wishes: [],
    rewardWishId: null,
    memos: [],
    talkLogs: [],
    rewardConsult: {
      status: 'none',
      wishText: '',
      message: '',
      replyText: ''
    }
  }
}

export function sampleState() {
  const s = defaultState()
  s.seenGuide = true
  s.items.note = { state: 'done', done: [true, true, true, true] }
  s.items.medical = { state: 'done', done: [true, true, true, true] }
  s.items.money = { state: 'doing', done: [true, true, false, false] }
  s.items.insurance = { state: 'notyet', done: [false, false, false, false] }
  s.items.house = { state: 'doing', done: [true, false, false, false] }
  s.items.grave = { state: 'notyet', done: [false, false, false, false] }
  s.items.family = { state: 'notyet', done: [false, false, false] }
  s.items.pet = { state: 'notyet', done: [false, false, false, false] }
  s.items.digital = { state: 'notyet', done: [false, false, false, false] }
  s.priority = 'money'
  s.quizAnswers = {
    q_money_1: 2,
    q_money_2: 0,
    q_insurance_1: 1,
    q_digital_1: 0,
    q_digital_2: 1,
    q_medical_1: 0,
    q_house_type: 0,
    q_house_own: 1,
    q_grave_1: 1,
    q_grave_2: 1,
    q_family_1: 1,
    q_family_2: 1,
    q_pet_1: 2
  }
  s.quizDone = true
  s.wishes = [
    { id: 'w1', text: '温泉旅行にゆっくり行く', done: false },
    { id: 'w2', text: '家族みんなで食事やお祝いをする', done: false }
  ]
  s.rewardWishId = 'w1'
  s.talkLogs = [
    {
      id: 't1',
      date: '2026年11月5日',
      partner: '結子（娘・入力例）',
      decided: '緊急の連絡先は長女にする',
      pending: 'お墓のことは来月もう一度話す',
      memo: 'まずは通帳の場所から整理していくことになった。'
    }
  ]
  s.rewardConsult = {
    status: 'pending',
    wishText: '温泉旅行にゆっくり行く',
    message: '「医療・介護の希望」と「終活ノート」が終わりました！区切りのお祝いに、温泉旅行を相談したいです。',
    replyText: ''
  }
  s.analysis = computeAnalysisFromAnswers(s.quizAnswers, s.items)
  return s
}

function normalizeLoadedState(parsed) {
  const base = defaultState()
  const merged = { ...base, ...parsed }
  const normalizedItems = makeBlankItems()
  ITEMS.forEach((it) => {
    const saved = parsed?.items?.[it.id]
    if (saved) {
      normalizedItems[it.id] = {
        state: STATE[saved.state] ? saved.state : 'notyet',
        done: it.steps.map((_, idx) => Boolean(saved.done?.[idx]))
      }
    }
  })
  merged.items = normalizedItems
  merged.wishes = Array.isArray(parsed?.wishes) ? parsed.wishes : base.wishes
  merged.memos = Array.isArray(parsed?.memos) ? parsed.memos : base.memos
  merged.talkLogs = Array.isArray(parsed?.talkLogs) ? parsed.talkLogs : base.talkLogs
  merged.quizAnswers = parsed?.quizAnswers && typeof parsed.quizAnswers === 'object' ? parsed.quizAnswers : {}
  merged.rewardConsult = { ...base.rewardConsult, ...(parsed?.rewardConsult || {}) }
  return merged
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
      const { successMessage, abortOnSaveError = false } = options
      const prev = latestStateRef.current
      const nextState = typeof updater === 'function' ? updater(prev) : updater
      const ok = persistState(nextState)

      if (!ok && abortOnSaveError) {
        toast('保存に失敗しました。画面上部のエラー案内をご確認ください。')
        return false
      }

      latestStateRef.current = nextState
      setState(nextState)

      if (ok && successMessage) {
        toast(successMessage)
      } else if (!ok) {
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

  const updateItemStatus = (itemId, newState) => {
    const label = STATE[newState]?.t || newState
    return commitState(
      (prev) => {
        const currentItem = prev.items[itemId] || { state: 'notyet', done: [] }
        return {
          ...prev,
          items: {
            ...prev.items,
            [itemId]: {
              ...currentItem,
              state: newState
            }
          }
        }
      },
      { successMessage: `状態を「${label}」に更新しました` }
    )
  }

  const toggleItemStep = (itemId, stepIndex) => {
    return commitState((prev) => {
      const currentItem = prev.items[itemId] || { state: 'notyet', done: [] }
      const newDone = [...(currentItem.done || [])]
      newDone[stepIndex] = !newDone[stepIndex]

      let autoState = currentItem.state
      const allDone = newDone.length > 0 && newDone.every(Boolean)
      const someDone = newDone.some(Boolean)

      if (allDone) {
        autoState = 'done'
      } else if (someDone && autoState === 'notyet') {
        autoState = 'doing'
      }

      return {
        ...prev,
        items: {
          ...prev.items,
          [itemId]: {
            ...currentItem,
            state: autoState,
            done: newDone
          }
        }
      }
    })
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

  const saveQuizProgress = (answers) => {
    return commitState((prev) => {
      const { answers: validAnswers } = pruneAnswersToFlow(answers)
      return {
        ...prev,
        quizAnswers: validAnswers,
        quizDone: false
      }
    })
  }

  const saveQuizAnswer = (qId, optIdx) => {
    return commitState((prev) => {
      const merged = { ...prev.quizAnswers, [qId]: optIdx }
      const { answers: validAnswers } = pruneAnswersToFlow(merged)
      return {
        ...prev,
        quizAnswers: validAnswers
      }
    })
  }

  const previewPartialQuiz = (answers) => {
    return commitState((prev) => {
      const { answers: validAnswers } = pruneAnswersToFlow(answers || prev.quizAnswers)
      const analysis = computeAnalysisFromAnswers(validAnswers, prev.items, { isPartial: true })
      return {
        ...prev,
        quizAnswers: validAnswers,
        quizDone: false,
        analysis
      }
    })
  }

  const finishQuiz = (answers) => {
    return commitState((prev) => {
      const { answers: validAnswers } = pruneAnswersToFlow(answers || prev.quizAnswers)
      const analysis = computeAnalysisFromAnswers(validAnswers, prev.items, { isPartial: false })

      const newItems = { ...prev.items }
      analysis.newly.forEach((n) => {
        if (!newItems[n.id] || newItems[n.id].state === 'notyet') {
          newItems[n.id] = { ...(newItems[n.id] || {}), state: 'notyet' }
        }
      })

      return {
        ...prev,
        quizAnswers: validAnswers,
        quizDone: true,
        analysis,
        items: newItems
      }
    })
  }

  const resetQuiz = () => {
    return commitState(
      (prev) => ({
        ...prev,
        quizAnswers: {},
        quizDone: false,
        analysis: null
      }),
      { successMessage: 'アンケート回答を初期化しました' }
    )
  }

  const getQuizStatus = () => {
    const flow = computeQuizFlow(state.quizAnswers)
    const answeredCount = flow.filter((qId) => state.quizAnswers[qId] !== undefined).length
    const isCompleted = Boolean(state.quizDone)
    const isInProgress = !isCompleted && answeredCount > 0
    return {
      flow,
      totalCount: flow.length,
      answeredCount,
      remainingCount: Math.max(0, flow.length - answeredCount),
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
    toast('すべての保存データを削除しました')
  }

  // 進捗率と次の項目の算出
  const calcProgress = () => {
    const done = ITEMS.filter((it) => (state.items[it.id]?.state || 'notyet') === 'done')
    const pct = ITEMS.length ? Math.round((done.length / ITEMS.length) * 100) : 0

    const countByState = {
      notyet: 0,
      doing: 0,
      done: 0
    }
    ITEMS.forEach((it) => {
      const st = state.items[it.id]?.state || 'notyet'
      countByState[st] = (countByState[st] || 0) + 1
    })

    // 次の一歩（優先度設定があればそれ、なければ最初の未完了）
    let nextItemId = state.priority
    if (!nextItemId || state.items[nextItemId]?.state === 'done') {
      const candidate = ITEMS.find((it) => {
        const st = state.items[it.id]?.state || 'notyet'
        return st !== 'done'
      })
      nextItemId = candidate ? candidate.id : ITEMS[0].id
    }
    const nextItem = ITEMS.find((it) => it.id === nextItemId) || ITEMS[0]

    return {
      total: ITEMS.length,
      applicableCount: ITEMS.length,
      doneCount: done.length,
      pct,
      countByState,
      nextItem
    }
  }

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
