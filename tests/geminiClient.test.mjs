import test from 'node:test'
import assert from 'node:assert/strict'
import {
  API_KEY_STORAGE_KEY,
  GEMINI_ENDPOINT,
  GEMINI_MODEL,
  askGeminiSupport,
  buildGeminiRequestBody,
  classifyGeminiError,
  clearStoredApiKey,
  draftMemoryFromNote,
  getScreenSupportContext,
  getStoredApiKey,
  normalizeConversationHistory,
  saveStoredApiKey,
  summarizeFamilyTalkNote
} from '../src/shared/utils/geminiClient.js'

test('Gemini モデルとエンドポイントが gemini-3.5-flash-lite を指している', () => {
  assert.equal(GEMINI_MODEL, 'gemini-3.5-flash-lite')
  assert.equal(
    GEMINI_ENDPOINT,
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent'
  )
})

test('リクエスト本文に非推奨パラメータが含まれず、APIキーがヘッダーで送信される', async () => {
  const body = buildGeminiRequestBody({
    systemInstruction: 'やさしく答えてください',
    promptText: '通帳の整理について教えて'
  })
  assert.equal(body.generationConfig, undefined)
  assert.equal(body.temperature, undefined)
  assert.equal(body.top_p, undefined)
  assert.equal(body.contents.at(-1).role, 'user')

  let capturedUrl = ''
  let capturedOptions = null
  const fakeFetch = async (url, options) => {
    capturedUrl = url
    capturedOptions = options
    return {
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'まずはよく使う通帳1冊から場所をメモしてみましょう。' }] } }]
      })
    }
  }

  const answer = await askGeminiSupport({
    apiKey: 'AIzaTestKey123',
    question: 'どこから始めればいいですか？',
    contextSummary: '財産・口座の整理',
    fetchFn: fakeFetch
  })

  assert.equal(capturedUrl, GEMINI_ENDPOINT)
  assert.ok(!capturedUrl.includes('key='), 'URLクエリにAPIキーを含めてはいけない')
  assert.equal(capturedOptions.headers['x-goog-api-key'], 'AIzaTestKey123')
  assert.ok(answer.includes('通帳1冊'))
})

test('HTTPエラーステータスに応じたわかりやすい日本語エラーが返る', () => {
  assert.ok(classifyGeminiError(403).includes('APIキー'))
  assert.ok(classifyGeminiError(429).includes('上限'))
  assert.ok(classifyGeminiError(503).includes('混み合って'))
})

test('画面コンテキストに応じて異なるワンタップ質問候補が返る', () => {
  const moneyCtx = getScreenSupportContext('/items/detail', '?id=money', {})
  assert.ok(moneyCtx.screenLabel.includes('財産・口座'))
  assert.equal(moneyCtx.presets.length, 3)

  const digitalCtx = getScreenSupportContext('/items/info', '?id=digital', {})
  assert.ok(digitalCtx.screenLabel.includes('スマホ・ネット'))
  assert.notDeepEqual(moneyCtx.presets, digitalCtx.presets)

  const surveyCtx = getScreenSupportContext('/survey/q', '', {})
  assert.equal(surveyCtx.screenLabel, '「生活状況アンケート」')
  assert.equal(surveyCtx.presets.length, 3)
})

test('思い出の整えと話し合いメモの整理が動作する', async () => {
  const mockDraftFetch = async () => ({
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: '孫と行った温泉旅行は、とても楽しい思い出です。' }] } }]
    })
  })
  const drafted = await draftMemoryFromNote({
    apiKey: 'test-key',
    category: 'これからの希望',
    title: '温泉',
    rawText: '孫と温泉に行った',
    fetchFn: mockDraftFetch
  })
  assert.ok(drafted.includes('温泉旅行'))

  const mockSummaryFetch = async () => ({
    ok: true,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [
              {
                text: '決まったこと：通帳はリビングの引き出しに置く\n保留：お墓のことは来月相談\nメモ：穏やかに話せた'
              }
            ]
          }
        }
      ]
    })
  })
  const summarized = await summarizeFamilyTalkNote({
    apiKey: 'test-key',
    rawNote: '通帳はリビング。お墓は来月。穏やかに話せた。',
    fetchFn: mockSummaryFetch
  })
  assert.equal(summarized.decided, '通帳はリビングの引き出しに置く')
  assert.equal(summarized.pending, 'お墓のことは来月相談')
  assert.equal(summarized.memo, '穏やかに話せた')
})

test('ブラウザ向けAPIキーの保存・取得・消去が動作する', () => {
  const store = new Map()
  const mockStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  }

  assert.equal(getStoredApiKey(mockStorage), '')
  const saved = saveStoredApiKey('  AIzaSample999  ', mockStorage)
  assert.equal(saved.ok, true)
  assert.equal(mockStorage.getItem(API_KEY_STORAGE_KEY), 'AIzaSample999')
  assert.equal(getStoredApiKey(mockStorage), 'AIzaSample999')

  clearStoredApiKey(mockStorage)
  assert.equal(getStoredApiKey(mockStorage), '')
})

test('会話履歴を引き継いでマルチターン相談でき、先頭がuser・末尾もuserになる', async () => {
  const normalized = normalizeConversationHistory(
    [
      { role: 'model', text: '先頭の不要なmodel発話' },
      { role: 'user', text: '最初の質問' },
      { role: 'model', text: '最初の返答' },
      { role: 'user', text: 'つづきの質問' }
    ],
    4
  )
  assert.equal(normalized[0].role, 'user')
  assert.equal(normalized.length, 3)

  let sentBody = null
  const mockFetch = async (_url, options) => {
    sentBody = JSON.parse(options.body)
    return {
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'はい、まず使っている1冊だけで大丈夫です。' }] } }]
      })
    }
  }

  const reply = await askGeminiSupport({
    apiKey: 'AIzaChatTest',
    question: '銀行に行かなくてもできますか？',
    history: [
      { role: 'user', text: '通帳の整理はどこから始めますか？' },
      { role: 'model', text: 'まずは通帳1冊の場所をメモしてみましょう。' }
    ],
    contextSummary: '財産・口座の整理',
    fetchFn: mockFetch
  })

  assert.ok(reply.includes('1冊だけ'))
  assert.ok(sentBody.system_instruction.parts[0].text.includes('財産・口座の整理'))
  assert.deepEqual(
    sentBody.contents.map((c) => c.role),
    ['user', 'model', 'user']
  )
  assert.equal(sentBody.contents[2].parts[0].text, '銀行に行かなくてもできますか？')
})
