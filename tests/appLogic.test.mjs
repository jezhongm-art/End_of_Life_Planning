import test from 'node:test'
import assert from 'node:assert/strict'
import { ITEMS } from '../src/memberB/items.js'
import { BASE_QUIZ_SEQUENCE, QUIZ_NODES } from '../src/memberC/questions.js'
import {
  RULES_VERSION,
  computeAnalysisFromAnswers,
  computeQuizFlow,
  computeQuizProgress,
  findOrphanedAnswerIds,
  getItemSurveyRecommendation,
  pickPriorityItem,
  pruneAnswersToFlow,
  resolveAnswerOption
} from '../src/memberC/rules.js'
import {
  SCHEMA_VERSION,
  applyManualStatusSync,
  applyStepToggle,
  defaultState,
  deriveStateFromSteps,
  getQuizResumeIndex,
  makeBlankItems,
  normalizeLoadedState
} from '../src/shared/utils/appLogic.js'

test('すべての選択肢に明示的な重複しない value が定義されている', () => {
  Object.entries(QUIZ_NODES).forEach(([qId, node]) => {
    const values = node.opts.map((o) => o.value)
    assert.ok(values.every((v) => typeof v === 'string' && v.length > 0), `${qId} に value が不足`)
    assert.equal(new Set(values).size, values.length, `${qId} の value が重複`)
  })
})

test('準備項目は12項目あり、すべて4手順ずつ用意されている', () => {
  assert.equal(ITEMS.length, 12)
  const ids = ITEMS.map((it) => it.id)
  assert.ok(ids.includes('contacts'))
  assert.ok(ids.includes('will'))
  assert.ok(ids.includes('belongings'))
  ITEMS.forEach((it) => {
    assert.equal(it.steps.length, 4, `${it.id} の手順数は4つであるべき`)
  })
})

test('アンケート分岐：明示的な value と next に基づいて12〜24問へ正しく分岐する', () => {
  const baseFlow = computeQuizFlow({})
  assert.deepEqual(baseFlow, BASE_QUIZ_SEQUENCE)
  assert.equal(baseFlow.length, 12)

  // 保険未加入 -> 年金質問へ分岐（保険・年金全体を確認済みにしない）
  const pensionFlow = computeQuizFlow({ q_insurance_1: 'no_insurance' })
  assert.ok(pensionFlow.includes('q_pension_1'))

  // 同居・施設 -> 同居・施設用書類質問へ分岐（不要と断定しない）
  const facilityFlow = computeQuizFlow({ q_house_type: 'family_or_facility' })
  assert.ok(facilityFlow.includes('q_house_other'))

  // デジタル利用・通話中心それぞれの深掘り質問
  const digitalFlow = computeQuizFlow({ q_digital_1: 'using' })
  assert.ok(digitalFlow.includes('q_digital_2'))
  const minimalPhoneFlow = computeQuizFlow({ q_digital_1: 'minimal' })
  assert.ok(minimalPhoneFlow.includes('q_digital_phone'))

  // お墓が「まだ考えていない」の場合はノート記載ではなく悩み質問（q_grave_3）へ分岐する
  const graveUndecidedFlow = computeQuizFlow({ q_grave_1: 'undecided' })
  assert.ok(graveUndecidedFlow.includes('q_grave_3'))
  assert.ok(!graveUndecidedFlow.includes('q_grave_2'))

  // おひとり分岐（q_family_2: 'alone' -> 'q_family_solo'）
  const soloFlow = computeQuizFlow({ q_family_2: 'alone' })
  assert.ok(soloFlow.includes('q_family_solo'))

  // 最大分岐数（24問）
  const maxFlow = computeQuizFlow({
    q_contacts_1: 'not_listed',
    q_medical_1: 'undecided',
    q_money_1: 'not_shared',
    q_house_type: 'own_home',
    q_insurance_1: 'no_insurance',
    q_digital_1: 'using',
    q_will_1: 'undecided',
    q_family_1: 'in_progress',
    q_family_2: 'alone',
    q_grave_1: 'undecided',
    q_belongings_1: 'not_started',
    q_pet_1: 'undecided'
  })
  assert.equal(maxFlow.length, 24)
})

test('分岐で質問数が増えても進捗率（%）が下がらない', () => {
  let answers = {}
  let prevPct = computeQuizProgress(answers).pct
  assert.equal(prevPct, 0)

  const branchChoices = [
    ['q_contacts_1', 'not_listed'],
    ['q_contacts_2', 'alone'],
    ['q_medical_1', 'undecided'],
    ['q_medical_2', 'not_consulted'],
    ['q_money_1', 'partial'],
    ['q_money_2', 'not_listed'],
    ['q_house_type', 'family_or_facility'],
    ['q_house_other', 'needs_check'],
    ['q_insurance_1', 'no_insurance'],
    ['q_pension_1', 'not_confirmed'],
    ['q_digital_1', 'using'],
    ['q_digital_2', 'not_noted'],
    ['q_will_1', 'undecided'],
    ['q_will_2', 'does_not_know'],
    ['q_family_1', 'in_progress'],
    ['q_note_2', 'not_ready'],
    ['q_family_2', 'alone'],
    ['q_family_solo', 'not_connected'],
    ['q_grave_1', 'undecided'],
    ['q_grave_3', 'no_successor'],
    ['q_belongings_1', 'not_started'],
    ['q_belongings_2', 'not_noted'],
    ['q_pet_1', 'undecided'],
    ['q_pet_2', 'not_noted']
  ]

  for (const [qId, val] of branchChoices) {
    answers = { ...answers, [qId]: val }
    const { pct } = computeQuizProgress(answers)
    assert.ok(pct >= prevPct, `${qId}=${val} で進捗率が低下: ${prevPct}% -> ${pct}%`)
    prevPct = pct
  }
  assert.equal(prevPct, 100)
})

test('分岐変更で流れから外れた回答は自動消去されず検出でき、明示整理で削除できる', () => {
  const answers = {
    q_house_type: 'own_home',
    q_house_own: 'ambiguous'
  }
  // 持ち家 -> 賃貸へ変更
  const changed = { ...answers, q_house_type: 'rent' }
  assert.equal(changed.q_house_own, 'ambiguous', '過去の回答が勝手に消えてはいけない')

  const orphans = findOrphanedAnswerIds(changed)
  assert.deepEqual(orphans, ['q_house_own'])

  // 持ち家に戻せばまた有効になる
  const reverted = { ...changed, q_house_type: 'own_home' }
  assert.deepEqual(findOrphanedAnswerIds(reverted), [])

  // 明示的な整理を選んだときだけ削除される
  const { answers: pruned } = pruneAnswersToFlow(changed)
  assert.equal(pruned.q_house_own, undefined)
})

test('途中保存の再開位置が未回答の先頭質問になる', () => {
  const partialAnswers = {
    q_contacts_1: 'organized',
    q_medical_1: 'shared',
    q_money_1: 'shared'
  }
  const { flow, resumeIndex } = getQuizResumeIndex(partialAnswers)
  assert.equal(flow[resumeIndex], 'q_house_type')
})

test('結果分類：「今はひとりで整理したい」は中立扱い、「保険なし」は年金確認に分岐する', () => {
  const items = makeBlankItems()
  const analysis = computeAnalysisFromAnswers(
    {
      q_family_2: 'solo',
      q_insurance_1: 'no_insurance',
      q_pension_1: 'not_confirmed',
      q_house_type: 'family_or_facility',
      q_house_other: 'confirm_none'
    },
    items
  )

  // 「今はひとりで整理したい」は known ではなく neutral に入る
  assert.ok(!analysis.known.some((k) => k.id === 'family'), 'family が known になってはいけない')
  assert.ok(analysis.neutral.some((n) => n.id === 'family'), 'family は neutral に入るべき')

  // 「保険なし」だけでは確認済みにならず、年金未確認なら insurance が newly に入る
  assert.ok(!analysis.known.some((k) => k.id === 'insurance'))
  assert.ok(analysis.newly.some((n) => n.id === 'insurance'))

  // 同居・施設で「確認すべき書類なし」を選んだ場合も neutral
  assert.ok(analysis.neutral.some((n) => n.id === 'house'))
})

test('おすすめ項目の優先選定：未完を優先し、完了済みなら別の未完了項目を選ぶ', () => {
  const items = makeBlankItems()
  const analysis = {
    newly: [
      { id: 'money', reason: '口座の確認' },
      { id: 'digital', reason: 'スマホ契約の確認' }
    ]
  }

  // 未完のおすすめ項目がある場合はそれを最優先
  let picked = pickPriorityItem(analysis, items, 'note')
  assert.equal(picked.id, 'money')

  // money を完了にしたら、次の未完のおすすめ digital を選ぶ
  items.money = { state: 'done', done: items.money.done.map(() => true) }
  picked = pickPriorityItem(analysis, items, 'note')
  assert.equal(picked.id, 'digital')

  // おすすめがすべて完了済みなら、未完の fallback / 他項目を選ぶ
  items.digital = { state: 'done', done: items.digital.done.map(() => true) }
  picked = pickPriorityItem(analysis, items, 'note')
  assert.equal(picked.id, 'note')
  assert.equal(picked.fromSurvey, false)

  // 全項目完了なら null
  ITEMS.forEach((it) => {
    items[it.id] = { state: 'done', done: it.steps.map(() => true) }
  })
  picked = pickPriorityItem(analysis, items, 'note')
  assert.equal(picked, null)
})

test('手順のチェック・解除および手動状態切替が常に項目状態と一致する', () => {
  let items = makeBlankItems()
  assert.equal(deriveStateFromSteps([false, false, false, false]), 'notyet')

  // 1つチェック -> doing
  let res = applyStepToggle(items, 'money', 0)
  items = res.nextItems
  assert.equal(items.money.state, 'doing')

  // 全部チェック -> done
  for (const idx of [1, 2, 3]) {
    res = applyStepToggle(items, 'money', idx)
    items = res.nextItems
  }
  assert.equal(items.money.state, 'done')

  // 1つチェックを外す -> doing に戻る
  res = applyStepToggle(items, 'money', 2)
  items = res.nextItems
  assert.equal(items.money.state, 'doing')

  // 残りもすべて外す -> notyet に戻る
  for (const idx of [0, 1, 3]) {
    res = applyStepToggle(items, 'money', idx)
    items = res.nextItems
  }
  assert.equal(items.money.state, 'notyet')
  assert.deepEqual(items.money.done, [false, false, false, false])

  // 手動で「完了」に同期 -> 全手順が true
  items = applyManualStatusSync(items, 'money', 'done', { syncSteps: true })
  assert.equal(items.money.state, 'done')
  assert.deepEqual(items.money.done, [true, true, true, true])

  // 手動で「準備中」に同期 -> 全手順trueのままにせず最後を false にして一致させる
  items = applyManualStatusSync(items, 'money', 'doing', { syncSteps: true })
  assert.equal(items.money.state, 'doing')
  assert.equal(items.money.done.every(Boolean), false)

  // 手動で「未着手」に同期 -> 全手順が false
  items = applyManualStatusSync(items, 'money', 'notyet', { syncSteps: true })
  assert.equal(items.money.state, 'notyet')
  assert.deepEqual(items.money.done, [false, false, false, false])
})

test('保存済み回答の移行とアプリ更新時の診断結果再計算が動作する', () => {
  const legacySaved = {
    ...defaultState(),
    quizAnswers: {
      q_money_1: 2, // 旧インデックス -> 'not_shared'
      q_family_2: 2 // 旧インデックス -> 'solo'
    },
    quizDone: true,
    // 古いスナップショットでは誤って family が known だったとする
    analysis: {
      newly: [],
      known: [{ id: 'family', reason: 'old' }],
      unconfirmed: []
    }
  }

  const migrated = normalizeLoadedState(legacySaved)
  assert.equal(migrated.schemaVersion, SCHEMA_VERSION)
  assert.equal(migrated.rulesVersion, RULES_VERSION)
  assert.equal(migrated.quizAnswers.q_money_1, 'not_shared')
  assert.equal(migrated.quizAnswers.q_family_2, 'solo')

  // 再計算されて family は neutral に、money は newly になっていること
  assert.ok(migrated.analysis.newly.some((n) => n.id === 'money'))
  assert.ok(migrated.analysis.neutral.some((n) => n.id === 'family'))
  assert.ok(!migrated.analysis.known.some((k) => k.id === 'family'))
  assert.ok(resolveAnswerOption('q_money_1', migrated.quizAnswers.q_money_1)?.value === 'not_shared')
})

test('緊急度×未整理度スコアで優先順位が決まり、複数質問の理由が上書きされず統合される', () => {
  const items = makeBlankItems()
  const analysis = computeAnalysisFromAnswers(
    {
      q_belongings_1: 'not_started',
      q_belongings_2: 'not_noted',
      q_contacts_1: 'not_listed',
      q_contacts_2: 'alone',
      q_money_1: 'not_shared',
      q_money_2: 'not_listed'
    },
    items
  )

  const orderedIds = analysis.newly.map((n) => n.id)
  assert.equal(orderedIds[0], 'contacts', '緊急度の高い連絡先が最上位になるべき')
  assert.ok(
    orderedIds.indexOf('money') < orderedIds.indexOf('belongings'),
    '遺産・財産の整理は思い出の品整理より優先されるべき'
  )

  const moneyEntry = analysis.newly.find((n) => n.id === 'money')
  assert.ok(moneyEntry.reason.includes('通帳や書類の場所が伝わっていないため'), 'q_money_1 の理由が残ること')
  assert.ok(moneyEntry.reason.includes('銀行名や返済中の契約だけでもメモ'), 'q_money_2 の理由も統合されること')
  assert.equal(analysis.needsSoloSupport, true, 'q_contacts_2: alone で公的相談窓口フラグが立つ')

  const rec = getItemSurveyRecommendation({ quizDone: true, quizAnswers: { q_money_1: 'not_shared' }, items }, 'money')
  assert.ok(rec?.reason.length > 0)

  items.money = { state: 'done', done: [true, true, true, true] }
  const recAfterDone = getItemSurveyRecommendation({ quizDone: true, quizAnswers: { q_money_1: 'not_shared' }, items }, 'money')
  assert.equal(recAfterDone, null)
})
