import { ITEMS, STATE } from '../../memberB/items.js'
import {
  RULES_VERSION,
  computeAnalysisFromAnswers,
  computeQuizFlow,
  migrateQuizAnswers,
  pickPriorityItem
} from '../../memberC/rules.js'

export const SCHEMA_VERSION = 2

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

export function deriveStateFromSteps(doneArray = []) {
  if (doneArray.length > 0 && doneArray.every(Boolean)) {
    return 'done'
  }
  if (doneArray.some(Boolean)) {
    return 'doing'
  }
  return 'notyet'
}

export function applyStepToggle(itemsMap = {}, itemId, stepIndex) {
  const itemDef = ITEMS.find((it) => it.id === itemId)
  const stepCount = itemDef ? itemDef.steps.length : (itemsMap[itemId]?.done?.length || 0)
  const currentItem = itemsMap[itemId] || {
    state: 'notyet',
    done: Array.from({ length: stepCount }, () => false)
  }

  const newDone = Array.from({ length: stepCount }, (_, idx) => Boolean(currentItem.done?.[idx]))
  if (stepIndex >= 0 && stepIndex < newDone.length) {
    newDone[stepIndex] = !newDone[stepIndex]
  }

  const nextState = deriveStateFromSteps(newDone)
  return {
    nextItems: {
      ...itemsMap,
      [itemId]: {
        ...currentItem,
        state: nextState,
        done: newDone
      }
    },
    newState: nextState,
    isChecked: Boolean(newDone[stepIndex]),
    allDone: nextState === 'done'
  }
}

export function applyManualStatusSync(itemsMap = {}, itemId, newState, { syncSteps = true } = {}) {
  const itemDef = ITEMS.find((it) => it.id === itemId)
  const stepCount = itemDef ? itemDef.steps.length : (itemsMap[itemId]?.done?.length || 0)
  const currentItem = itemsMap[itemId] || {
    state: 'notyet',
    done: Array.from({ length: stepCount }, () => false)
  }
  let newDone = Array.from({ length: stepCount }, (_, idx) => Boolean(currentItem.done?.[idx]))

  if (syncSteps && stepCount > 0) {
    if (newState === 'done') {
      newDone = newDone.map(() => true)
    } else if (newState === 'notyet') {
      newDone = newDone.map(() => false)
    } else if (newState === 'doing' && newDone.every(Boolean)) {
      newDone[newDone.length - 1] = false
    }
  }

  return {
    ...itemsMap,
    [itemId]: {
      ...currentItem,
      state: STATE[newState] ? newState : 'notyet',
      done: newDone
    }
  }
}

export function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    rulesVersion: RULES_VERSION,
    seenGuide: false,
    name: '',
    textSize: '2',
    priority: 'money',
    items: makeBlankItems(),
    topics: { money: true, medical: true, house: false, grave: false, family: false, pet: false },
    quizAnswers: {},
    quizDone: false,
    quizPreview: false,
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
  s.items.contacts = { state: 'done', done: [true, true, true, true] }
  s.items.medical = { state: 'done', done: [true, true, true, true] }
  s.items.money = { state: 'doing', done: [true, true, false, false] }
  s.items.insurance = { state: 'notyet', done: [false, false, false, false] }
  s.items.house = { state: 'doing', done: [true, false, false, false] }
  s.items.will = { state: 'notyet', done: [false, false, false, false] }
  s.items.note = { state: 'done', done: [true, true, true, true] }
  s.items.grave = { state: 'notyet', done: [false, false, false, false] }
  s.items.family = { state: 'notyet', done: [false, false, false, false] }
  s.items.belongings = { state: 'notyet', done: [false, false, false, false] }
  s.items.pet = { state: 'notyet', done: [false, false, false, false] }
  s.items.digital = { state: 'notyet', done: [false, false, false, false] }
  s.priority = 'money'
  s.quizAnswers = {
    q_contacts_1: 'organized',
    q_medical_1: 'shared',
    q_money_1: 'not_shared',
    q_money_2: 'listed',
    q_house_type: 'own_home',
    q_house_own: 'ambiguous',
    q_insurance_1: 'unclear',
    q_insurance_2: 'place_unknown',
    q_digital_1: 'using',
    q_digital_2: 'not_noted',
    q_will_1: 'undecided',
    q_will_2: 'does_not_know',
    q_family_1: 'summarized',
    q_family_2: 'rarely',
    q_family_3: 'undecided',
    q_grave_1: 'has_wish_untalked',
    q_grave_2: 'not_written',
    q_belongings_1: 'not_started',
    q_belongings_2: 'not_noted',
    q_pet_1: 'none'
  }
  s.quizDone = true
  s.quizPreview = false
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

/**
 * 保存データを読み込み、旧データ形式の移行とルール更新時の診断結果再計算を行う
 */
export function normalizeLoadedState(parsed) {
  const base = defaultState()
  const merged = { ...base, ...parsed }
  const normalizedItems = makeBlankItems()
  ITEMS.forEach((it) => {
    const saved = parsed?.items?.[it.id]
    if (saved) {
      const doneArr = it.steps.map((_, idx) => Boolean(saved.done?.[idx]))
      normalizedItems[it.id] = {
        state: STATE[saved.state] ? saved.state : deriveStateFromSteps(doneArr),
        done: doneArr
      }
    }
  })

  merged.schemaVersion = SCHEMA_VERSION
  merged.rulesVersion = RULES_VERSION
  merged.items = normalizedItems
  merged.wishes = Array.isArray(parsed?.wishes) ? parsed.wishes : base.wishes
  merged.memos = Array.isArray(parsed?.memos) ? parsed.memos : base.memos
  merged.talkLogs = Array.isArray(parsed?.talkLogs) ? parsed.talkLogs : base.talkLogs
  merged.quizAnswers = migrateQuizAnswers(parsed?.quizAnswers)
  merged.quizDone = Boolean(parsed?.quizDone)
  merged.quizPreview = Boolean(parsed?.quizPreview || (!parsed?.quizDone && parsed?.analysis))
  merged.rewardConsult = { ...base.rewardConsult, ...(parsed?.rewardConsult || {}) }

  // アプリ更新時や項目進捗の変化に合わせて常に最新ルールで再計算する
  if (merged.quizDone || merged.quizPreview) {
    merged.analysis = computeAnalysisFromAnswers(merged.quizAnswers, normalizedItems, {
      isPartial: !merged.quizDone
    })
  } else {
    merged.analysis = null
  }

  return merged
}

export function getQuizResumeIndex(answers = {}) {
  const flow = computeQuizFlow(answers)
  const firstUnanswered = flow.findIndex((qId) => answers[qId] === undefined)
  return {
    flow,
    resumeIndex: firstUnanswered >= 0 ? firstUnanswered : 0
  }
}

export function computeHomeProgress(state) {
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

  const liveAnalysis =
    state.quizDone || state.quizPreview
      ? computeAnalysisFromAnswers(state.quizAnswers, state.items, { isPartial: !state.quizDone })
      : state.analysis

  const picked = pickPriorityItem(liveAnalysis, state.items, state.priority)
  const nextItem = picked?.item || ITEMS[0]

  return {
    total: ITEMS.length,
    applicableCount: ITEMS.length,
    doneCount: done.length,
    pct,
    countByState,
    nextItem
  }
}
