import { ITEMS, TOPICS } from './items'
import { QUIZ_ROOTS, QUIZ_NODES } from './questions'

/* ---------- 動的アンケートフロー構築 ---------- */
export function computeQuizFlow(selectedTopics = {}) {
  const queue = []
  TOPICS.forEach((tp) => {
    if (selectedTopics[tp.id]) {
      const rootId = QUIZ_ROOTS[tp.id]
      if (rootId) {
        queue.push(rootId)
      }
    }
  })
  if (!queue.length) {
    TOPICS.forEach((tp) => {
      const rootId = QUIZ_ROOTS[tp.id]
      if (rootId) queue.push(rootId)
    })
  }
  return queue
}

/* ---------- ルールベース回答分析（対応表照合） ---------- */
export function computeAnalysisFromAnswers(answers = {}, itemsMap = {}) {
  const newly = []      // {id, reason}
  const known = []      // {id, reason}
  const naSuggest = []  // {id, reason}
  const touchedIds = {}
  const suggestMap = {}

  Object.keys(answers).forEach((qId) => {
    const node = QUIZ_NODES[qId]
    if (!node) return
    const opt = node.opts[answers[qId]]
    if (!opt) return

    if (opt.suggest) {
      touchedIds[opt.suggest] = true
      suggestMap[opt.suggest] = opt.reason || "質問の回答から確認が必要と見つかりました。"
    }
    if (opt.known) {
      opt.known.forEach((itemId) => {
        touchedIds[itemId] = true
        if (!suggestMap[itemId]) {
          known.push({ id: itemId, reason: opt.reason || "すでに把握・対応できています。" })
        }
      })
    }
    if (opt.naCandidate) {
      touchedIds[opt.naCandidate] = true
      naSuggest.push({ id: opt.naCandidate, reason: opt.reason })
    }
  })

  // 重複除去しつつ newly と known を整理
  const knownIds = {}
  known.forEach((k) => { knownIds[k.id] = k })

  Object.keys(suggestMap).forEach((id) => {
    const st = (itemsMap[id] && itemsMap[id].state) || "unknown"
    if (st === "done") {
      knownIds[id] = { id, reason: "すでに対策が完了しています。" }
    } else if (st === "doing" || st === "review") {
      knownIds[id] = { id, reason: `${suggestMap[id]}（現在も進行・見直し中です）` }
    } else {
      newly.push({ id, reason: suggestMap[id] })
      delete knownIds[id]
    }
  })

  // 未回答・スキップの項目は「準備不要」と判断せず「未確認」にする
  const unconfirmed = []
  ITEMS.forEach((it) => {
    const isNewly = newly.some((n) => n.id === it.id)
    const isKnown = !!knownIds[it.id]
    const isNaSug = naSuggest.some((n) => n.id === it.id)
    const st = (itemsMap[it.id] && itemsMap[it.id].state) || "unknown"
    if (!isNewly && !isKnown && !isNaSug) {
      if (st === "done" || st === "doing" || st === "review") {
        knownIds[it.id] = { id: it.id, reason: "以前からご自身で状況を登録済みです。" }
      } else {
        unconfirmed.push(it.id)
      }
    }
  })

  return {
    newly,
    known: Object.values(knownIds),
    naSuggest,
    unconfirmed,
    totalAnswered: Object.keys(answers).length
  }
}
