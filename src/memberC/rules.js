import { ITEMS, TOPICS } from '../memberB/items'
import { QUIZ_ROOTS, QUIZ_NODES } from './questions'

/* ---------- アンケートフロー構築（全8問固定フロー） ---------- */
export function computeQuizFlow() {
  return [
    'q_money_1',
    'q_money_2',
    'q_medical_1',
    'q_medical_2',
    'q_house_1',
    'q_grave_1',
    'q_family_1',
    'q_pet_1'
  ]
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

  // 未回答・スキップの項目は状況に応じて整理
  const unconfirmed = []
  ITEMS.forEach((it) => {
    const isNewly = newly.some((n) => n.id === it.id)
    const isKnown = !!knownIds[it.id]
    const isNaSug = naSuggest.some((n) => n.id === it.id)
    const st = (itemsMap[it.id] && itemsMap[it.id].state) || "notyet"
    if (!isNewly && !isKnown && !isNaSug) {
      if (st === "done" || st === "doing") {
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
