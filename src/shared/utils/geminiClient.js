import { ITEMS } from '../../memberB/items.js'

export const GEMINI_MODEL = 'gemini-3.5-flash-lite'
export const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
export const API_KEY_STORAGE_KEY = 'shukatsu_gemini_api_key_v1'

export function getStoredApiKey(storage = globalThis?.localStorage) {
  try {
    return (storage?.getItem(API_KEY_STORAGE_KEY) || '').trim()
  } catch {
    return ''
  }
}

export function saveStoredApiKey(apiKey, storage = globalThis?.localStorage) {
  const trimmed = String(apiKey || '').trim()
  if (!trimmed) {
    return clearStoredApiKey(storage)
  }
  try {
    storage?.setItem(API_KEY_STORAGE_KEY, trimmed)
    return { ok: true, key: trimmed }
  } catch (err) {
    return {
      ok: false,
      error: 'ブラウザへのキー保存に失敗しました。容量または設定をご確認ください。',
      cause: err
    }
  }
}

export function clearStoredApiKey(storage = globalThis?.localStorage) {
  try {
    storage?.removeItem(API_KEY_STORAGE_KEY)
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: 'キーの消去に失敗しました。',
      cause: err
    }
  }
}

const ITEM_PRESET_QUESTIONS = {
  contacts: [
    '緊急連絡先のメモには、名前と電話番号のほかに何を書くとよいですか？',
    'かかりつけ医やよく行く病院の情報は、家族にどう伝えておけばよいですか？',
    '頼れる身内が近くにいないとき、急な入院の保証人や連絡先はどうすればよいですか？'
  ],
  note: [
    '終活ノートは、何から書き始めるのが一番かんたんですか？',
    '暗証番号などを書いてはいけない理由と、代わりの書き方を教えてください。',
    '書いたノートはどこにしまっておくと家族にわかりやすいですか？'
  ],
  medical: [
    '医療や介護の希望がまだ決まらないときは、どう書いておけばよいですか？',
    'かかりつけのお医者さんには、どんな聞き方で相談すればよいですか？',
    '家族に医療の希望を伝えるときの、やさしい切り出し方を教えてください。'
  ],
  money: [
    '通帳やカードが多くて整理しきれないときは、どこから始めればよいですか？',
    '口座の一覧メモには、最低限どんなことだけ書いておけば十分ですか？',
    '古い通帳や見当たらない書類があるときは、どうすればよいですか？'
  ],
  insurance: [
    '保険証券が見つからないとき、どこに問い合わせて調べられますか？',
    '受取人が古いままになっていないか、どうやって確認すればよいですか？',
    '年金の記録を手軽に確かめる方法を、わかりやすく教えてください。'
  ],
  house: [
    '持ち家や賃貸の書類のうち、最低限これだけは確認すべき書類は何ですか？',
    '施設に入居している場合、家族に伝えておくべき書類は何がありますか？',
    '権利書や契約書がすぐ見つからないときの確認方法を教えてください。'
  ],
  will: [
    'エンディングノートと遺言書は、何がちがってどちらから考えればよいですか？',
    '自筆証書遺言と公正証書遺言のちがいを、わかりやすく教えてください。',
    '遺言書をつくるべきか迷うとき、まず誰に相談するのが安心ですか？'
  ],
  grave: [
    'お墓や葬儀の希望がまだはっきり決まっていないときは、どう進めればよいですか？',
    'お墓や費用のことを家族と話すとき、重くならない切り出し方を教えてください。',
    '散骨や家族葬などについて迷う場合、どこに相談できますか？'
  ],
  family: [
    '終活の話を家族に切り出すとき、心配させない言い方を教えてください。',
    '家族と話し合うとき、最初はどんな話題から話すと進めやすいですか？',
    '家族が遠くに住んでいる場合、どうやって共有しておくのがおすすめですか？'
  ],
  belongings: [
    '思い出の品やアルバムの整理は、捨てずに進めるコツがありますか？',
    '遺品整理を家族や業者に頼むとき、費用を抑えるポイントを教えてください。',
    '人にあげたい形見や大事な物は、どうやって書き残しておけばよいですか？'
  ],
  pet: [
    'ペットの引き継ぎ先がすぐ見つからないときは、どんな方法がありますか？',
    'お世話メモには、ペットについてどんなことを書いておくと安心ですか？',
    'ペットの将来の費用について相談できる窓口や仕組みはありますか？'
  ],
  digital: [
    'スマホの暗証番号を紙に書かずに、いざというとき家族へ伝える方法はありますか？',
    '毎月引き落とされているネット契約や定期払いを調べるコツを教えてください。',
    'ネット銀行やネット通販の会社名だけをメモするとき、何を書けばよいですか？'
  ]
}

export function getScreenSupportContext(pathname = '/', search = '', state = {}) {
  const params = new URLSearchParams(search || '')
  const itemId = params.get('id')
  const activeItem =
    (pathname.startsWith('/items/detail') || pathname.startsWith('/items/info')) && itemId
      ? ITEMS.find((it) => it.id === itemId)
      : null

  if (activeItem) {
    return {
      screenLabel: `準備項目「${activeItem.title}」`,
      contextSummary: `利用者は現在、準備項目「${activeItem.title}」（${activeItem.desc}）を確認中です。`,
      presets: ITEM_PRESET_QUESTIONS[activeItem.id] || [
        `「${activeItem.title}」は最初の一歩として何から始めればよいですか？`,
        '途中でわからなくなったときは、どこに相談できますか？',
        '家族にはどのように伝えておくと安心ですか？'
      ]
    }
  }

  if (pathname.startsWith('/survey')) {
    return {
      screenLabel: '「生活状況アンケート」',
      contextSummary: '利用者は現在、生活状況アンケートの案内・回答・結果画面を見ています。',
      presets: [
        '質問の答えに迷ったりわからないときは、どう選べばよいですか？',
        'アンケートの途中で疲れたら、やめても大丈夫ですか？',
        'アンケートの結果が出たあと、何から手をつければよいですか？'
      ]
    }
  }

  if (pathname.startsWith('/memories')) {
    return {
      screenLabel: '「希望・思い出帳」',
      contextSummary: '利用者は現在、思い出や家族へのメッセージを記録する画面を見ています。',
      presets: [
        '思い出帳には、どんなことを書くと家族が喜びますか？',
        '長い文章が思いつかないときは、どんな書き方がありますか？',
        '家族への「ありがとう」を伝える良い例文を教えてください。'
      ]
    }
  }

  if (pathname.startsWith('/family')) {
    return {
      screenLabel: '「家族との話し合い」',
      contextSummary: '利用者は現在、家族との対話や相談の練習画面を見ています。',
      presets: [
        '終活の話を家族に切り出すとき、角が立たない言い方を教えてください。',
        '最初の話し合いでは、どんなことから話すとスムーズですか？',
        '話し合った内容は、何をメモに残しておくとよいですか？'
      ]
    }
  }

  if (pathname.startsWith('/wishes')) {
    return {
      screenLabel: '「やってみたいこと」',
      contextSummary: '利用者は現在、これからの楽しみやごほうびを登録する画面を見ています。',
      presets: [
        'やってみたいことが思い浮かばないときのヒントを教えてください。',
        '無理なく楽しめる、おすすめの小さなごほうびはありますか？',
        '家族と一緒に出かける予定を立てるコツを教えてください。'
      ]
    }
  }

  const nextItem = ITEMS.find((it) => it.id === state?.priority) || ITEMS[0]
  return {
    screenLabel: '終活の準備全般',
    contextSummary: `利用者は現在、ホームや一覧などの画面を見ています。優先項目は「${nextItem.title}」です。`,
    presets: [
      `「${nextItem.title}」は、まず何から始めればよいですか？`,
      '終活の準備を無理なく少しずつ進めるコツを教えてください。',
      'ひとりでは決められないことがあるとき、誰に相談すればよいですか？'
    ]
  }
}

export function classifyGeminiError(status, payloadMessage = '') {
  if (status === 400 || status === 401 || status === 403) {
    return '設定されているAPIキーが正しくないか、利用権限がありません。基本設定画面でキーをご確認ください。'
  }
  if (status === 404) {
    return '指定したAIモデル（gemini-3.5-flash-lite）が見つかりませんでした。時間をおいて再度お試しください。'
  }
  if (status === 429) {
    return 'ただいま利用が混み合っているか、利用回数の上限に達しました。少し時間をおいてからお試しください。'
  }
  if (status >= 500) {
    return 'Google側のAIサービスが一時的に混み合っています。少し待ってからもう一度お試しください。'
  }
  if (payloadMessage) {
    return `AIからの返答を受け取れませんでした（${payloadMessage}）。`
  }
  return '通信エラーによりAIから返答を受け取れませんでした。インターネット接続をご確認ください。'
}

export function normalizeConversationHistory(history = [], maxMessages = 12) {
  const valid = (history || [])
    .filter((m) => m && (m.role === 'user' || m.role === 'model') && String(m.text || '').trim())
    .map((m) => ({
      role: m.role,
      text: String(m.text).trim()
    }))

  let sliced = valid.slice(-maxMessages)
  while (sliced.length > 0 && sliced[0].role !== 'user') {
    sliced = sliced.slice(1)
  }

  const merged = []
  sliced.forEach((m) => {
    const prev = merged[merged.length - 1]
    if (prev && prev.role === m.role) {
      prev.text = `${prev.text}\n${m.text}`
    } else {
      merged.push({ ...m })
    }
  })
  return merged
}

export function buildGeminiRequestBody({ systemInstruction, promptText, messages }) {
  const contents =
    Array.isArray(messages) && messages.length > 0
      ? messages.map((m) => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(m.text || '').trim() }]
        }))
      : [
          {
            role: 'user',
            parts: [{ text: promptText }]
          }
        ]

  return {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents
  }
}

export async function callGeminiGenerateContent({
  apiKey,
  systemInstruction,
  promptText,
  messages,
  fetchFn = globalThis.fetch
}) {
  const key = String(apiKey || '').trim()
  if (!key) {
    throw new Error('AIを利用するには、基本設定画面でAPIキーを入力してください。')
  }
  if (typeof fetchFn !== 'function') {
    throw new Error('この環境では通信機能（fetch）を利用できません。')
  }

  const body = buildGeminiRequestBody({ systemInstruction, promptText, messages })

  let response
  try {
    response = await fetchFn(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      },
      body: JSON.stringify(body)
    })
  } catch {
    throw new Error('インターネットに接続できないため、AIにお問い合わせできませんでした。接続をご確認ください。')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const apiMsg = data?.error?.message || ''
    throw new Error(classifyGeminiError(response.status, apiMsg))
  }

  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || '')
    .join('')
    .trim()

  if (!text) {
    throw new Error('AIからの返答が空でした。別の言葉でもう一度お試しください。')
  }

  return text
}

const SENIOR_ADVISOR_SYSTEM = [
  'あなたは高齢者向け終活サポートアプリ「終活みちしるべ」のやさしい案内役です。',
  '以下のルールを必ず守ってお答えください。',
  '1. カタカナの専門用語やIT用語は使わず、誰にでもわかるやさしい日本語で答えてください。',
  '2. 一度にたくさんの情報を書かず、3〜5文ほどの短い文章で分かりやすくまとめてください。',
  '3. 安心感を与え、まずは小さな一歩（今できる簡単なこと）を1つだけ提案してください。',
  '4. 暗証番号やパスワードそのものを紙に書かないよう注意が必要な話題では、安全への配慮を添えてください。',
  '5. 法律・税務・医療の個別判断が必要な内容では、専門の窓口（法テラス、国民生活センター、かかりつけ医など）への相談をやさしく案内してください。'
].join('\n')

export async function askGeminiSupport({
  apiKey,
  question,
  history = [],
  contextSummary = '',
  fetchFn
}) {
  const q = String(question || '').trim()
  const systemInstruction = contextSummary
    ? `${SENIOR_ADVISOR_SYSTEM}\n\n【現在の画面状況】\n${contextSummary}`
    : SENIOR_ADVISOR_SYSTEM

  const messages = normalizeConversationHistory([...(history || []), { role: 'user', text: q }])

  return callGeminiGenerateContent({
    apiKey,
    systemInstruction,
    messages,
    fetchFn
  })
}

export async function draftMemoryFromNote({ apiKey, category, title, rawText, fetchFn }) {
  const systemInstruction = [
    'あなたはご年配の方の思い出書きをお手伝いする、あたたかい文章の代筆役です。',
    'ご本人が入力した短いメモや話し言葉をもとに、ご本人の一人称（「私」など自然な語り口）で、読みやすく温かい思い出の文章を3〜4文に整えてください。',
    '事実を勝手に付け足さず、元のメモにある内容だけを大切に膨らませてください。説明や前置きは書かず、整えた文章だけを返してください。'
  ].join('\n')

  const promptText = [
    `テーマ：${category || '思い出'}`,
    title ? `タイトル：${title}` : '',
    `元のメモ：\n${String(rawText || '').trim()}`
  ]
    .filter(Boolean)
    .join('\n')

  return callGeminiGenerateContent({
    apiKey,
    systemInstruction,
    promptText,
    fetchFn
  })
}

export async function draftFamilyMessage({ apiKey, wishText, nextItemTitle, fetchFn }) {
  const systemInstruction = [
    'あなたはご年配の方がご家族へ気持ちや相談を伝えるときの、やさしい文章づくりの手伝い役です。',
    '家族を心配させず、あたたかく前向きに切り出せる相談メッセージを2〜3文で作成してください。',
    '前置きや注釈は書かず、そのまま家族に伝えられるメッセージ本文だけを返してください。'
  ].join('\n')

  const promptText = [
    `いま取り組んでいる準備：${nextItemTitle || '終活の準備'}`,
    `区切りの楽しみ・ごほうび目標：${wishText || '家族みんなで食事やお祝いをする'}`,
    '上記を踏まえて、家族へ気軽に相談を切り出す短いメッセージを作ってください。'
  ].join('\n')

  return callGeminiGenerateContent({
    apiKey,
    systemInstruction,
    promptText,
    fetchFn
  })
}

export async function summarizeFamilyTalkNote({ apiKey, rawNote, fetchFn }) {
  const systemInstruction = [
    'あなたは家族との話し合いメモを整理するお手伝い役です。',
    '入力された短いメモや話し言葉をもとに、以下の3つの行形式だけで返してください。前置きや記号の装飾は不要です。',
    '決まったこと：ここに決まったこと（なければ空欄）',
    '保留：ここに次回話すこと・保留事項（なければ空欄）',
    'メモ：ここに補足メモや感想'
  ].join('\n')

  const raw = await callGeminiGenerateContent({
    apiKey,
    systemInstruction,
    promptText: `元のメモ：\n${String(rawNote || '').trim()}`,
    fetchFn
  })

  const lines = raw.split(/\r?\n/)
  let decided = ''
  let pending = ''
  let memo = ''

  lines.forEach((line) => {
    const clean = line.trim()
    if (clean.startsWith('決まったこと：') || clean.startsWith('決まったこと:')) {
      decided = clean.replace(/^決まったこと[：:]/, '').trim()
    } else if (clean.startsWith('保留：') || clean.startsWith('保留:')) {
      pending = clean.replace(/^保留[：:]/, '').trim()
    } else if (clean.startsWith('メモ：') || clean.startsWith('メモ:')) {
      memo = clean.replace(/^メモ[：:]/, '').trim()
    }
  })

  if (!decided && !pending && !memo) {
    memo = raw.trim()
  }

  return { decided, pending, memo }
}

export async function testGeminiConnection(apiKey, fetchFn) {
  return callGeminiGenerateContent({
    apiKey,
    systemInstruction: '簡潔に「接続できました」とだけ日本語で答えてください。',
    promptText: '接続テスト',
    fetchFn
  })
}
