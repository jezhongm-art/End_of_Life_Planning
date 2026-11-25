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

test('アンケート分岐：明示的な value と next に基づいて正しく分岐する', () => {
  const baseFlow = computeQuizFlow({})
  assert.deepEqual(baseFlow, BASE_QUIZ_SEQUENCE)
  assert.equal(baseFlow.length, 9)

  // 保険未加入 -> 年金質問へ分岐（保険・年金全体を確認済みにしない）
  const pensionFlow = computeQuizFlow({ q_insurance_1: 'no_insurance' })
  assert.ok(pensionFlow.includes('q_pension_1'))

  // 同居・施設 -> 同居・施設用書類質問へ分岐（不要と断定しない）
  const facilityFlow = computeQuizFlow({ q_house_type: 'family_or_facility' })
  assert.ok(facilityFlow.includes('q_house_other'))

  // デジタル利用 -> 契約メモ質問へ分岐
  const digitalFlow = computeQuizFlow({ q_digital_1: 'using' })
  assert.ok(digitalFlow.includes('q_digital_2'))

  // 最大分岐数（16問）
  const maxFlow = computeQuizFlow({
    q_money_1: 'not_shared',
    q_insurance_1: 'no_insurance',
    q_digital_1: 'using',
    q_medical_1: 'undecided',
    q_house_type: 'own_home',
    q_grave_1: 'undecided',
    q_pet_1: 'undecided'
  })
  assert.equal(maxFlow.length, 16)
})

test('分岐で質問数が増えても進捗率（%）が下がらない', () => {
  let answers = {}
  let prevPct = computeQuizProgress(answers).pct
  assert.equal(prevPct, 0)

  const branchChoices = [
    ['q_money_1', 'partial'],       // 分岐追加 (+1)
    ['q_money_2', 'not_listed'],
    ['q_insurance_1', 'no_insurance'], // 分岐追加 (+1)
    ['q_pension_1', 'not_confirmed'],
    ['q_digital_1', 'using'],       // 分岐追加 (+1)
    ['q_digital_2', 'not_noted'],
    ['q_medical_1', 'undecided'],   // 分岐追加 (+1)
    ['q_medical_2', 'not_consulted'],
    ['q_house_type', 'family_or_facility'], // 分岐追加 (+1)
    ['q_house_other', 'needs_check'],
    ['q_grave_1', 'undecided'],     // 分岐追加 (+1)
    ['q_grave_2', 'not_written'],
    ['q_family_1', 'in_progress'],
    ['q_family_2', 'solo'],
    ['q_pet_1', 'undecided'],       // 分岐追加 (+1)
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
    q_money_1: 'shared',
    q_insurance_1: 'confirmed'
  }
  const { flow, resumeIndex } = getQuizResumeIndex(partialAnswers)
  assert.equal(flow[resumeIndex], 'q_digital_1')
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
