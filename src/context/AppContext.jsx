import React, { createContext, useContext, useState, useEffect } from 'react'
import { ITEMS } from '../data/items'
import { computeAnalysisFromAnswers } from '../data/rules'

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
      state: 'unknown',
      done: it.steps.map(() => false)
    }
  })
  return obj
}

export function defaultState() {
  return {
    seenGuide: false,
    name: '山田 花子',
    textSize: '2',
    priority: 'money',
    items: makeBlankItems(),
    topics: { money: true, medical: true, house: false, grave: false, family: false, pet: false },
    quizAnswers: {},
    quizDone: false,
    analysis: null,
    wishes: [
      { id: 'w1', text: '家族みんなで食事やお祝いをする', done: false }
    ],
    rewardWishId: 'w1',
    memos: [
      {
        id: 'm1',
        cat: '子どもの頃',
        title: '子どもの頃、夢中になっていたこと',
        text: '川で魚を追いかけていたこと。夕方になると母が名前を呼びに来て、それでもあと少しと粘っていました。',
        date: '2026年10月12日',
        tag: ''
      },
      {
        id: 'm2',
        cat: '家族・人とのつながり',
        title: 'ご家族へ伝えたいこと',
        text: 'いつも気にかけてくれてありがとう。元気に笑って過ごしてくれるのが、いちばんの安心です。',
        date: '2026年11月2日',
        tag: '家族へのメッセージ'
      }
    ],
    talkLogs: [
      {
        id: 't1',
        date: '2026年11月5日',
        partner: '結子（娘）',
        decided: '緊急の連絡先は長女にする',
        pending: 'お墓のことは来月もう一度話す',
        memo: 'まずは通帳の場所から整理していくことになった。'
      }
    ],
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
  s.items.insurance = { state: 'na', done: [false, false, false, false] }
  s.items.house = { state: 'review', done: [true, false, false, false] }
  s.items.grave = { state: 'notyet', done: [false, false, false, false] }
  s.items.family = { state: 'unknown', done: [false, false, false] }
  s.items.pet = { state: 'notyet', done: [false, false, false, false] }
  s.priority = 'money'
  s.quizAnswers = {
    q_money_1: 2,
    q_money_2: 0,
    q_medical_1: 0,
    q_house_1: 0,
    q_house_own: 1,
    q_grave_1: 1,
    q_grave_2: 1
  }
  s.quizDone = true
  s.wishes = [
    { id: 'w1', text: '温泉旅行にゆっくり行く', done: false },
    { id: 'w2', text: '家族みんなで食事やお祝いをする', done: false }
  ]
  s.rewardWishId = 'w1'
  s.rewardConsult = {
    status: 'pending',
    wishText: '温泉旅行にゆっくり行く',
    message: '「医療・介護の希望」と「終活ノート」が終わりました！区切りのお祝いに、温泉旅行を相談したいです。',
    replyText: ''
  }
  s.analysis = computeAnalysisFromAnswers(s.quizAnswers, s.items)
  return s
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        return { ...defaultState(), ...parsed }
      }
    } catch (e) {
      console.warn('Failed to load localStorage', e)
    }
    return defaultState()
  })

  const [toastMessage, setToastMessage] = useState(null)

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to save to localStorage', e)
    }
  }, [state])

  // Apply data-ts on html
  useEffect(() => {
    document.documentElement.setAttribute('data-ts', state.textSize || '2')
  }, [state.textSize])

  const toast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 2500)
  }

  const updateItemStatus = (itemId, newState) => {
    setState((prev) => {
      const currentItem = prev.items[itemId] || { state: 'unknown', done: [] }
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
    })
    toast(`状態を「${newState}」に更新しました`)
  }

  const toggleItemStep = (itemId, stepIndex) => {
    setState((prev) => {
      const currentItem = prev.items[itemId] || { state: 'unknown', done: [] }
      const newDone = [...(currentItem.done || [])]
      newDone[stepIndex] = !newDone[stepIndex]

      // 自動で準備中や完了に更新するスマートサポート
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
    setState((prev) => ({
      ...prev,
      priority: itemId
    }))
    toast('「次の一歩」に設定しました')
  }

  const updateSettings = (partial) => {
    setState((prev) => ({
      ...prev,
      ...partial
    }))
  }

  const setTextSize = (ts) => {
    setState((prev) => ({ ...prev, textSize: ts }))
    toast(`文字サイズを変更しました`)
  }

  const cycleTextSize = () => {
    setState((prev) => {
      const next = prev.textSize === '1' ? '2' : prev.textSize === '2' ? '3' : '1'
      return { ...prev, textSize: next }
    })
  }

  const updateTopics = (topics) => {
    setState((prev) => ({ ...prev, topics }))
  }

  const saveQuizAnswer = (qId, optIdx) => {
    setState((prev) => {
      const newAnswers = { ...prev.quizAnswers, [qId]: optIdx }
      return {
        ...prev,
        quizAnswers: newAnswers
      }
    })
  }

  const finishQuiz = (answers) => {
    setState((prev) => {
      const finalAnswers = answers || prev.quizAnswers
      const analysis = computeAnalysisFromAnswers(finalAnswers, prev.items)

      // 新しく見つかった項目を自動で「未着手」などに更新
      const newItems = { ...prev.items }
      analysis.newly.forEach((n) => {
        if (!newItems[n.id] || newItems[n.id].state === 'unknown') {
          newItems[n.id] = { ...(newItems[n.id] || {}), state: 'notyet' }
        }
      })

      return {
        ...prev,
        quizAnswers: finalAnswers,
        quizDone: true,
        analysis,
        items: newItems
      }
    })
  }

  const resetQuiz = () => {
    setState((prev) => ({
      ...prev,
      quizAnswers: {},
      quizDone: false,
      analysis: null
    }))
    toast('アンケート回答を初期化しました')
  }

  const addWish = (text) => {
    const newWish = {
      id: `w_${Date.now()}`,
      text,
      done: false
    }
    setState((prev) => ({
      ...prev,
      wishes: [newWish, ...prev.wishes]
    }))
    toast('やってみたいことを登録しました')
  }

  const toggleWish = (wishId) => {
    setState((prev) => ({
      ...prev,
      wishes: prev.wishes.map((w) => (w.id === wishId ? { ...w, done: !w.done } : w))
    }))
  }

  const setRewardWish = (wishId) => {
    setState((prev) => ({
      ...prev,
      rewardWishId: wishId
    }))
    toast('ごほうび目標に設定しました')
  }

  const addMemo = ({ cat, title, text, tag }) => {
    const newMemo = {
      id: `m_${Date.now()}`,
      cat,
      title,
      text,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      tag: tag || ''
    }
    setState((prev) => ({
      ...prev,
      memos: [newMemo, ...prev.memos]
    }))
    toast('思い出を保存しました')
  }

  const deleteMemo = (id) => {
    setState((prev) => ({
      ...prev,
      memos: prev.memos.filter((m) => m.id !== id)
    }))
    toast('思い出を削除しました')
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
    setState((prev) => ({
      ...prev,
      talkLogs: [newLog, ...prev.talkLogs]
    }))
    toast('話し合いを記録しました')
  }

  const updateRewardConsult = (partial) => {
    setState((prev) => ({
      ...prev,
      rewardConsult: { ...prev.rewardConsult, ...partial }
    }))
  }

  const loadBlankPreset = () => {
    const blank = defaultState()
    setState(blank)
    toast('初期（未開始）状態にリセットしました')
  }

  const loadSamplePreset = () => {
    const sample = sampleState()
    setState(sample)
    toast('サンプルデータを読み込みました')
  }

  const resetAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {}
    setState(defaultState())
    toast('すべての保存データを削除しました')
  }

  // 進捗率と次の項目の算出
  const calcProgress = () => {
    const applicable = ITEMS.filter((it) => (state.items[it.id]?.state || 'unknown') !== 'na')
    const done = applicable.filter((it) => (state.items[it.id]?.state || 'unknown') === 'done')
    const pct = applicable.length ? Math.round((done.length / applicable.length) * 100) : 0

    const countByState = {
      unknown: 0,
      notyet: 0,
      doing: 0,
      done: 0,
      review: 0,
      na: 0
    }
    ITEMS.forEach((it) => {
      const st = state.items[it.id]?.state || 'unknown'
      countByState[st] = (countByState[st] || 0) + 1
    })

    // 次の一歩（優先度設定があればそれ、なければ最初の未完了）
    let nextItemId = state.priority
    if (!nextItemId || state.items[nextItemId]?.state === 'done' || state.items[nextItemId]?.state === 'na') {
      const candidate = ITEMS.find((it) => {
        const st = state.items[it.id]?.state || 'unknown'
        return st !== 'done' && st !== 'na'
      })
      nextItemId = candidate ? candidate.id : ITEMS[0].id
    }
    const nextItem = ITEMS.find((it) => it.id === nextItemId) || ITEMS[0]

    return {
      total: ITEMS.length,
      applicableCount: applicable.length,
      doneCount: done.length,
      pct,
      countByState,
      nextItem
    }
  }

  const value = {
    state,
    calcProgress,
    updateItemStatus,
    toggleItemStep,
    setItemPriority,
    updateSettings,
    setTextSize,
    cycleTextSize,
    updateTopics,
    saveQuizAnswer,
    finishQuiz,
    resetQuiz,
    addWish,
    toggleWish,
    setRewardWish,
    addMemo,
    deleteMemo,
    addTalkLog,
    updateRewardConsult,
    loadBlankPreset,
    loadSamplePreset,
    resetAllData,
    toast
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </AppContext.Provider>
  )
}
