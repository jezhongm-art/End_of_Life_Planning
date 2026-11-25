import { ITEMS } from '../memberB/items'
import { QUIZ_NODES } from './questions'

export const QUIZ_FLOW_RANGE = {
  min: 9,
  max: 15
}

/* ---------- アンケートフロー構築（回答に応じた分岐フロー） ---------- */
export function computeQuizFlow(answers = {}) {
  const flow = []

  // 1. お金・通帳
  flow.push('q_money_1')
  if (answers.q_money_1 !== undefined && answers.q_money_1 !== 0 && answers.q_money_1 !== 4) {
    flow.push('q_money_2')
  }

  // 2. 保険・年金
  flow.push('q_insurance_1')

  // 3. スマホ・ネット契約（利用している場合にくわしい質問へ分岐）
  flow.push('q_digital_1')
  if (answers.q_digital_1 === 0) {
    flow.push('q_digital_2')
  }

  // 4. 医療・介護
  flow.push('q_medical_1')
  if (answers.q_medical_1 === 1 || answers.q_medical_1 === 2) {
    flow.push('q_medical_2')
  }

  // 5. 住まい（持ち家・賃貸で分岐）
  flow.push('q_house_type')
  if (answers.q_house_type === 0) {
    flow.push('q_house_own')
  } else if (answers.q_house_type === 1) {
    flow.push('q_house_rent')
  }

  // 6. お墓・葬儀
  flow.push('q_grave_1')
  if (answers.q_grave_1 === 1 || answers.q_grave_1 === 2) {
    flow.push('q_grave_2')
  }

  // 7. 家族に伝えること（終活ノートと家族との話し合いの2項目）
  flow.push('q_family_1')
  flow.push('q_family_2')

  // 8. ペットの終活
  flow.push('q_pet_1')
  if (answers.q_pet_1 === 1) {
    flow.push('q_pet_2')
  }

  return flow
}

/**
 * 現在の分岐フローに含まれる質問の回答だけを残す
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

/* ---------- ルールベース回答分析（対応表照合） ---------- */
export function computeAnalysisFromAnswers(answers = {}, itemsMap = {}, options = {}) {
  const { answers: validAnswers, flow } = pruneAnswersToFlow(answers)
  const newly = []      // {id, reason}
  const known = []      // {id, reason}
  const naSuggest = []  // {id, reason}
  const suggestMap = {}

  Object.keys(validAnswers).forEach((qId) => {
    const node = QUIZ_NODES[qId]
    if (!node) return
    const opt = node.opts[validAnswers[qId]]
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
    if (opt.naCandidate) {
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
    totalAnswered: Object.keys(validAnswers).length,
    totalQuestions: flow.length,
    isPartial: !!options.isPartial
  }
}
