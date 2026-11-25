import { ITEMS } from '../memberB/items.js'
import { BASE_QUIZ_SEQUENCE, QUIZ_NODES } from './questions.js'

export const RULES_VERSION = '2026-11-25-v2'

export const QUIZ_FLOW_RANGE = {
  min: BASE_QUIZ_SEQUENCE.length,
  max: 16
}

/**
 * 選択肢の値（文字列value、または旧データの数値インデックス）から該当選択肢オブジェクトを解決する
 */
export function resolveAnswerOption(qId, answerValue) {
  const node = QUIZ_NODES[qId]
  if (!node || answerValue === undefined || answerValue === null) return null
  if (typeof answerValue === 'string') {
    return node.opts.find((opt) => opt.value === answerValue) || null
  }
  if (typeof answerValue === 'number') {
    return node.opts[answerValue] || null
  }
  return null
}

/**
 * 旧バージョンの数値インデックス回答を、選択肢の並び替えに依存しない明示的な value 文字列へ変換する
 */
export function migrateQuizAnswers(rawAnswers = {}) {
  const migrated = {}
  if (!rawAnswers || typeof rawAnswers !== 'object') return migrated

  Object.keys(rawAnswers).forEach((qId) => {
    const val = rawAnswers[qId]
    const opt = resolveAnswerOption(qId, val)
    if (opt && opt.value) {
      migrated[qId] = opt.value
    } else if (typeof val === 'string') {
      migrated[qId] = val
    }
  })

  return migrated
}

/* ---------- アンケートフロー構築（明示的な value と next による分岐フロー） ---------- */
export function computeQuizFlow(answers = {}) {
  const flow = []

  BASE_QUIZ_SEQUENCE.forEach((rootId) => {
    flow.push(rootId)
    const selectedOpt = resolveAnswerOption(rootId, answers[rootId])
    if (selectedOpt?.next && QUIZ_NODES[selectedOpt.next]) {
      flow.push(selectedOpt.next)
    }
  })

  return flow
}

/**
 * 現在の分岐フローには含まれないが、過去の選択で保存されている回答IDを返す
 */
export function findOrphanedAnswerIds(answers = {}) {
  const flowSet = new Set(computeQuizFlow(answers))
  return Object.keys(answers).filter(
    (qId) => answers[qId] !== undefined && !flowSet.has(qId) && !!QUIZ_NODES[qId]
  )
}

/**
 * 現在の分岐フローに含まれる質問の回答だけを残す（明示的に利用者が整理を選んだとき用）
 */
export function pruneAnswersToFlow(answers = {}) {
  const flow = computeQuizFlow(answers)
  const pruned = {}
  flow.forEach((qId) => {
    if (answers[qId] !== undefined) {
      pruned[qId] = answers[qId]
    }
  })
  return { flow, answers: pruned }
}

/**
 * 分岐による質問数の増減で進捗率が下がらないよう、
 * 9つの基本質問グループ単位で完了度を計算する単調増加の進捗率
 */
export function computeQuizProgress(answers = {}, flowOverride = null) {
  const flow = flowOverride || computeQuizFlow(answers)
  const flowSet = new Set(flow)

  let progressSum = 0
  BASE_QUIZ_SEQUENCE.forEach((rootId) => {
    const groupNodes = [rootId]
    const selectedOpt = resolveAnswerOption(rootId, answers[rootId])
    if (selectedOpt?.next && flowSet.has(selectedOpt.next)) {
      groupNodes.push(selectedOpt.next)
    }
    const answeredInGroup = groupNodes.filter((id) => answers[id] !== undefined).length
    progressSum += answeredInGroup / groupNodes.length
  })

  const totalGroups = BASE_QUIZ_SEQUENCE.length
  const pct = totalGroups > 0 ? Math.min(100, Math.round((progressSum / totalGroups) * 100)) : 0
  const answeredInFlow = flow.filter((qId) => answers[qId] !== undefined).length

  return {
    pct,
    answeredCount: answeredInFlow,
    totalCount: flow.length
  }
}

/* ---------- ルールベース回答分析（対応表照合・中立状態対応） ---------- */
export function computeAnalysisFromAnswers(answers = {}, itemsMap = {}, options = {}) {
  const flow = computeQuizFlow(answers)
  const newly = []      // {id, reason}
  const known = []      // {id, reason}
  const neutral = []    // {id, reason}
  const naSuggest = []  // {id, reason}
  const suggestMap = {}
  const neutralMap = {}

  flow.forEach((qId) => {
    const opt = resolveAnswerOption(qId, answers[qId])
    if (!opt) return

    if (opt.suggest) {
      suggestMap[opt.suggest] = opt.reason || "質問の回答から確認が必要と見つかりました。"
    }
    if (opt.known) {
      opt.known.forEach((itemId) => {
        if (!suggestMap[itemId]) {
          known.push({ id: itemId, reason: opt.reason || "すでに確認・整理できています。" })
        }
      })
    }
    if (opt.neutral) {
      opt.neutral.forEach((itemId) => {
        if (!suggestMap[itemId]) {
          neutralMap[itemId] = {
            id: itemId,
            reason: opt.reason || "いまはご自身のペースで様子を見る項目です。"
          }
        }
      })
    }
    if (opt.naCandidate) {
      naSuggest.push({ id: opt.naCandidate, reason: opt.reason })
    }
  })

  // 重複除去しつつ newly / known / neutral を整理
  const knownIds = {}
  known.forEach((k) => {
    if (!neutralMap[k.id]) {
      knownIds[k.id] = k
    }
  })

  Object.keys(suggestMap).forEach((id) => {
    delete neutralMap[id]
    const st = (itemsMap[id] && itemsMap[id].state) || "notyet"
    if (st === "done") {
      knownIds[id] = { id, reason: "すでに対策が完了しています。" }
    } else if (st === "doing") {
      knownIds[id] = { id, reason: `${suggestMap[id]}（現在も進行中です）` }
    } else {
      newly.push({ id, reason: suggestMap[id] })
      delete knownIds[id]
    }
  })

  // 中立項目でも、すでに手順が進んでいる・完了している場合は実際の状態を優先する
  Object.keys(neutralMap).forEach((id) => {
    const st = (itemsMap[id] && itemsMap[id].state) || "notyet"
    if (st === "done") {
      knownIds[id] = { id, reason: "すでに対策が完了しています。" }
    } else if (st === "doing") {
      knownIds[id] = { id, reason: `${neutralMap[id].reason}（現在進行中です）` }
    } else if (!knownIds[id]) {
      neutral.push(neutralMap[id])
    }
  })

  // 未回答・スキップの項目は状況に応じて整理
  const unconfirmed = []
  ITEMS.forEach((it) => {
    const isNewly = newly.some((n) => n.id === it.id)
    const isKnown = !!knownIds[it.id]
    const isNeutral = neutral.some((n) => n.id === it.id)
    const isNaSug = naSuggest.some((n) => n.id === it.id)
    const st = (itemsMap[it.id] && itemsMap[it.id].state) || "notyet"
    if (!isNewly && !isKnown && !isNeutral && !isNaSug) {
      if (st === "done" || st === "doing") {
        knownIds[it.id] = { id: it.id, reason: "以前からご自身で状況を登録済みです。" }
      } else {
        unconfirmed.push(it.id)
      }
    }
  })

  return {
    rulesVersion: RULES_VERSION,
    newly,
    known: Object.values(knownIds),
    neutral,
    naSuggest,
    unconfirmed,
    totalAnswered: flow.filter((qId) => answers[qId] !== undefined).length,
    totalQuestions: flow.length,
    isPartial: !!options.isPartial
  }
}

/**
 * おすすめ項目から未完のものを最優先で選び、
 * すべて完了済みの場合は別の未完了項目を選ぶ（全項目完了時は null）
 */
export function pickPriorityItem(analysis, itemsMap = {}, fallbackPriorityId = null) {
  const newly = analysis?.newly || []

  for (const entry of newly) {
    const item = ITEMS.find((it) => it.id === entry.id)
    if (!item) continue
    const st = itemsMap[item.id]?.state || 'notyet'
    if (st !== 'done') {
      return { id: item.id, item, reason: entry.reason, fromSurvey: true }
    }
  }

  if (fallbackPriorityId) {
    const fbItem = ITEMS.find((it) => it.id === fallbackPriorityId)
    if (fbItem && (itemsMap[fbItem.id]?.state || 'notyet') !== 'done') {
      return {
        id: fbItem.id,
        item: fbItem,
        reason: 'まだ完了していない項目の中から、次に取り組みやすい準備を選びました。',
        fromSurvey: false
      }
    }
  }

  const nextUnfinished = ITEMS.find((it) => (itemsMap[it.id]?.state || 'notyet') !== 'done')
  if (nextUnfinished) {
    return {
      id: nextUnfinished.id,
      item: nextUnfinished,
      reason: 'まだ完了していない項目の中から、次に進められる準備を選びました。',
      fromSurvey: false
    }
  }

  return null
}
