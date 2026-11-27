export const QUIZ_ROOTS = {
  contacts: "q_contacts_1",
  medical: "q_medical_1",
  money: "q_money_1",
  house: "q_house_type",
  insurance: "q_insurance_1",
  digital: "q_digital_1",
  will: "q_will_1",
  note: "q_family_1",
  family: "q_family_2",
  grave: "q_grave_1",
  belongings: "q_belongings_1",
  pet: "q_pet_1"
}

export const BASE_QUIZ_SEQUENCE = [
  "q_contacts_1",
  "q_medical_1",
  "q_money_1",
  "q_house_type",
  "q_insurance_1",
  "q_digital_1",
  "q_will_1",
  "q_family_1",
  "q_family_2",
  "q_grave_1",
  "q_belongings_1",
  "q_pet_1"
]

export const QUIZ_NODES = {
  /* 1. 緊急時の連絡先・知らせる人 */
  q_contacts_1: {
    topic: "contacts",
    label: "緊急時の連絡先",
    text: "もし急に入院などになったとき、連絡してほしい人（親戚・友人・かかりつけ医）の番号を書き出していますか？",
    opts: [
      {
        value: "organized",
        t: "書き出してあり、わかる場所に置いてある",
        known: ["contacts"],
        reason: "緊急時の連絡先一覧をすでに整理できています。"
      },
      {
        value: "partial",
        t: "一部だけメモがある・スマホの中だけ",
        next: "q_contacts_2",
        suggest: "contacts",
        weight: 2,
        reason: "スマホが見られないときに備え、紙の一覧にもまとめておくと安心です。"
      },
      {
        value: "not_listed",
        t: "まだ書き出していない",
        next: "q_contacts_2",
        suggest: "contacts",
        weight: 3,
        reason: "いざというときに連絡が取れるよう、緊急連絡先をまとめることが最優先で役立ちます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_contacts_2: {
    topic: "contacts",
    label: "緊急時の連絡先（くわしく）",
    text: "その連絡先や、万が一のときにまず動いてくれる相手（ご家族や地域の相談先）は決まっていますか？",
    opts: [
      {
        value: "decided_family",
        t: "決まっていて、家族や親しい人に伝えている",
        suggest: "contacts",
        weight: 1,
        reason: "連絡先リストの置き場所まで共有できているとさらに安心です。"
      },
      {
        value: "not_decided",
        t: "まだはっきり決めていない",
        suggest: "contacts",
        weight: 3,
        reason: "まず一番に頼る連絡相手を2〜3人だけ決めるところから始めましょう。"
      },
      {
        value: "alone",
        t: "頼れる身内が近くにいない（おひとり暮らし等）",
        suggest: "contacts",
        weight: 3,
        soloSupport: true,
        reason: "地域の支援窓口（地域包括支援センター等）やかかりつけ医の連絡先も含めて控えておくと安心です。"
      },
      { value: "skip", t: "わからない・答えたくない", skip: true }
    ]
  },

  /* 2. 医療・介護の希望 */
  q_medical_1: {
    topic: "medical",
    label: "医療・介護",
    text: "体調を崩したときの治療や介護について、ご家族や身近な人に伝えたい希望はありますか？",
    opts: [
      {
        value: "shared",
        t: "希望があり、すでに伝えている",
        known: ["medical"],
        reason: "医療・介護の希望をすでに共有できています。"
      },
      {
        value: "has_wish_unshared",
        t: "希望はあるが、まだ伝えていない",
        next: "q_medical_2",
        suggest: "medical",
        weight: 3,
        reason: "お持ちの希望が伝わるよう、メモに整理することをおすすめします。"
      },
      {
        value: "undecided",
        t: "まだ決めていない・迷っている",
        next: "q_medical_2",
        suggest: "medical",
        weight: 2,
        reason: "迷っている気持ちも含めて書いておくと、あとから相談しやすくなります。"
      },
      {
        value: "not_considered",
        t: "特に考えていない",
        neutral: ["medical"],
        reason: "いまは特に決めていないため、必要になったときに改めて確認できます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_medical_2: {
    topic: "medical",
    label: "医療・介護（くわしく）",
    text: "かかりつけのお医者さんに、これからの治療の希望を相談したことはありますか？",
    opts: [
      {
        value: "consulted",
        t: "相談したことがある",
        suggest: "medical",
        weight: 2,
        reason: "お医者さんに相談されているため、メモやご家族への共有につなげられます。"
      },
      {
        value: "not_consulted",
        t: "まだ相談していない",
        suggest: "medical",
        weight: 3,
        reason: "今の気持ちをメモにしたうえで、次の診察時に相談してみるのもおすすめです。"
      },
      {
        value: "no_doctor",
        t: "かかりつけ医はいない",
        suggest: "medical",
        weight: 2,
        reason: "まずは紙やノートに希望を書き出すことから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },

  /* 3. 財産・口座・負債の整理 */
  q_money_1: {
    topic: "money",
    label: "お金・通帳",
    text: "通帳や大切な書類のしまい場所を、ご家族などに伝えていますか？",
    opts: [
      {
        value: "shared",
        t: "もう伝えている",
        known: ["money"],
        reason: "しまい場所をすでに共有できています。"
      },
      {
        value: "partial",
        t: "一部だけ伝えている",
        next: "q_money_2",
        suggest: "money",
        weight: 2,
        reason: "一部だけ伝わっているため、一覧にしておくとさらに安心です。"
      },
      {
        value: "not_shared",
        t: "まだ伝えていない",
        next: "q_money_2",
        suggest: "money",
        weight: 3,
        reason: "通帳や書類の場所が伝わっていないため、一覧づくりをおすすめします。"
      },
      {
        value: "unknown",
        t: "わからない",
        next: "q_money_2",
        suggest: "money",
        weight: 3,
        reason: "まずはお手元の通帳や書類がどこにあるか確かめるところから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_money_2: {
    topic: "money",
    label: "お金・通帳（くわしく）",
    text: "ご自身で持っている通帳・口座や、ローン・クレジットカード等の控えをメモにまとめていますか？",
    opts: [
      {
        value: "listed",
        t: "メモを作ってある",
        suggest: "money",
        weight: 1,
        reason: "一覧メモはお持ちなので、ローン等の有無の確認やしまい場所の共有へ進めます。"
      },
      {
        value: "not_listed",
        t: "まだ作っていない",
        suggest: "money",
        weight: 3,
        reason: "銀行名や返済中の契約だけでもメモにしておくと、見直しがとても楽になります。"
      },
      { value: "skip", t: "わからない・答えたくない", skip: true }
    ]
  },

  /* 4. 住まいと書類の整理 */
  q_house_type: {
    topic: "house",
    label: "住まい",
    text: "今のお住まいは、持ち家・賃貸・同居や施設などのどれにあたりますか？",
    opts: [
      {
        value: "own_home",
        t: "持ち家（ご自身やご家族の所有）",
        next: "q_house_own"
      },
      {
        value: "rent",
        t: "賃貸（アパート・マンション・借家など）",
        next: "q_house_rent"
      },
      {
        value: "family_or_facility",
        t: "ご家族と同居・施設などにお住まい",
        next: "q_house_other"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_house_1: {
    topic: "house",
    label: "住まい",
    text: "お住まいの契約書や権利書など、大切な書類のしまい場所をわかっていますか？",
    opts: [
      {
        value: "accessible",
        t: "すぐ取り出せる場所にある",
        known: ["house"],
        reason: "お住まいの大切な書類をすでに整理できています。"
      },
      {
        value: "ambiguous",
        t: "探せばあるが、場所があいまい",
        suggest: "house",
        weight: 2,
        reason: "住まいの権利書や契約書について、しまい場所を確認しておくと安心です。"
      },
      {
        value: "unknown",
        t: "わからない・まだ確認していない",
        suggest: "house",
        weight: 3,
        reason: "書類がどこにあるか確かめるところから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_house_own: {
    topic: "house",
    label: "住まい（持ち家）",
    text: "家の権利書や名義の書類は、すぐ取り出せる場所にありますか？",
    opts: [
      {
        value: "accessible",
        t: "すぐ取り出せる場所にある",
        known: ["house"],
        reason: "持ち家の大切な書類をすでに整理できています。"
      },
      {
        value: "ambiguous",
        t: "探せばあるが、場所があいまい",
        suggest: "house",
        weight: 2,
        reason: "持ち家の権利書や名義の書類について、しまい場所を確認しておくと安心です。"
      },
      {
        value: "unknown",
        t: "わからない",
        suggest: "house",
        weight: 3,
        reason: "書類がどこにあるか探してみるところから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_house_rent: {
    topic: "house",
    label: "住まい（賃貸）",
    text: "賃貸の契約書や、管理会社・緊急連絡先の控えはお手元にありますか？",
    opts: [
      {
        value: "organized",
        t: "手元にあり、場所もわかっている",
        known: ["house"],
        reason: "賃貸の契約書類と連絡先を整理できています。"
      },
      {
        value: "ambiguous",
        t: "すぐに見つからない・あいまい",
        suggest: "house",
        weight: 3,
        reason: "賃貸の契約書と緊急連絡先の控えを確認し、メモを残すのがおすすめです。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_house_other: {
    topic: "house",
    label: "住まい（同居・施設など）",
    text: "施設との入居契約書や、住まいに関わる大切な書類・緊急連絡先の控えはお手元にありますか？",
    opts: [
      {
        value: "organized",
        t: "手元にあり、しまい場所もわかっている",
        known: ["house"],
        reason: "施設契約やお住まいに関わる書類・連絡先の控えを整理できています。"
      },
      {
        value: "needs_check",
        t: "探せばあるがあいまい・これから確認したい",
        suggest: "house",
        weight: 2,
        reason: "同居や施設にお住まいの場合でも、契約書類や連絡先の控えを確かめておくと安心です。"
      },
      {
        value: "confirm_none",
        t: "確認すべき書類は特になく、家族にも伝えてある",
        neutral: ["house"],
        reason: "いま確認が必要な書類はないとのことですが、状況が変わった際はいつでも見直せます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },

  /* 5. 保険・年金の確認 */
  q_insurance_1: {
    topic: "money",
    label: "保険・年金",
    text: "入っている保険の内容や、受け取る人の名前を確認したことはありますか？",
    opts: [
      {
        value: "confirmed",
        t: "確認していて、書類の場所も共有した",
        known: ["insurance"],
        reason: "保険の内容や書類の場所をすでに確認できています。"
      },
      {
        value: "unclear",
        t: "入っているが、内容や受け取る人が曖昧",
        next: "q_insurance_2",
        suggest: "insurance",
        weight: 2,
        reason: "保険の内容や受取人、年金の記録を一度見直しておくと安心です。"
      },
      {
        value: "unchecked",
        t: "まだ確認していない",
        next: "q_insurance_2",
        suggest: "insurance",
        weight: 3,
        reason: "保険の書類の場所と年金の記録を確かめておくのがおすすめです。"
      },
      {
        value: "no_insurance",
        t: "保険には入っていない（年金のみ）",
        next: "q_pension_1"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_insurance_2: {
    topic: "money",
    label: "保険・年金（くわしく）",
    text: "保険証券のしまい場所や、年金の控え（年金手帳・ねんきん定期便など）はすぐわかりますか？",
    opts: [
      {
        value: "place_known",
        t: "しまい場所はわかっている",
        suggest: "insurance",
        weight: 1,
        reason: "書類の場所はお分かりのため、加入内容と受取人の確認だけ進められます。"
      },
      {
        value: "place_unknown",
        t: "すぐに見つからない・わからない",
        suggest: "insurance",
        weight: 3,
        reason: "まず保険証券とねんきん定期便などの保管場所を探してまとめるのがおすすめです。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_pension_1: {
    topic: "money",
    label: "年金の記録",
    text: "保険には入っていないとのことですね。年金の記録や受け取り方の控えは確認していますか？",
    opts: [
      {
        value: "confirmed",
        t: "確認していて、控えの場所もわかっている",
        known: ["insurance"],
        reason: "保険には未加入で、年金の記録や控えの場所も確認できています。"
      },
      {
        value: "not_confirmed",
        t: "まだ確認していない・わからない",
        suggest: "insurance",
        weight: 2,
        reason: "保険には未加入ですが、年金の記録や控えの場所を確認しておくと安心です。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },

  /* 6. スマホ・ネット契約の整理 */
  q_digital_1: {
    topic: "digital",
    label: "スマホ・ネット契約",
    text: "スマホやパソコンで、ネット銀行・通販・毎月払いのサービスを使っていますか？",
    opts: [
      {
        value: "using",
        t: "使っている（毎月の引き落としもある）",
        next: "q_digital_2"
      },
      {
        value: "minimal",
        t: "電話や家族との連絡くらいしか使っていない",
        next: "q_digital_phone"
      },
      {
        value: "unused",
        t: "携帯もネットも一切使っていない",
        known: ["digital"],
        reason: "スマホ・ネット契約の整理は現在不要です。"
      },
      { value: "skip", t: "わからない・答えたくない", skip: true }
    ]
  },
  q_digital_2: {
    topic: "digital",
    label: "スマホ・ネット契約（くわしく）",
    text: "使っている会社名や毎月の引き落とし先を、家族がわかるようにメモしていますか？",
    opts: [
      {
        value: "noted",
        t: "会社名などをメモしてある",
        known: ["digital"],
        reason: "ネット契約の会社名を整理できています。"
      },
      {
        value: "not_noted",
        t: "まだメモしていない",
        suggest: "digital",
        weight: 3,
        reason: "契約している会社名と引き落とし先だけでも書いておくと、後の手続きで困りません。"
      },
      { value: "skip", t: "わからない・答えたくない", skip: true }
    ]
  },
  q_digital_phone: {
    topic: "digital",
    label: "携帯電話について",
    text: "電話や連絡でお使いの携帯電話（スマホ）について、契約会社や画面ロック解除の伝え方は決まっていますか？",
    opts: [
      {
        value: "prepared",
        t: "契約会社や伝え方も決めてある",
        known: ["digital"],
        reason: "携帯電話の契約先や扱い方をすでに整理できています。"
      },
      {
        value: "not_prepared",
        t: "まだ決めていない・わからない",
        suggest: "digital",
        weight: 2,
        reason: "電話だけの利用でも、携帯会社名と解約・ロック解除の伝え方を控えておくと安心です。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },

  /* 7. 遺言書・相続の備え */
  q_will_1: {
    topic: "will",
    label: "遺言・相続",
    text: "自宅や預貯金などを誰に引き継ぐかや、遺言書を作るかどうか考えたことはありますか？",
    opts: [
      {
        value: "prepared",
        t: "遺言書を用意した（または専門家に相談済み）",
        known: ["will"],
        reason: "遺言や相続の備えをすでに進めています。"
      },
      {
        value: "has_wish",
        t: "引き継ぎたい希望はあるが、手続きはまだ",
        next: "q_will_2",
        suggest: "will",
        weight: 3,
        reason: "終活ノートには法的効力がないため、遺言書の準備を考えておくと確実です。"
      },
      {
        value: "undecided",
        t: "まだ考えていない・よくわからない",
        next: "q_will_2",
        suggest: "will",
        weight: 2,
        reason: "相続や不動産で困らないよう、遺言が必要か一度確認しておくのがおすすめです。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_will_2: {
    topic: "will",
    label: "遺言・相続（くわしく）",
    text: "法務局で遺言書を預かってもらう制度や、法テラスなどの無料相談窓口をご存知ですか？",
    opts: [
      {
        value: "knows",
        t: "知っている・調べたことがある",
        suggest: "will",
        weight: 2,
        reason: "制度はご存知なので、誰に引き継ぐかの整理や相談へ進めます。"
      },
      {
        value: "does_not_know",
        t: "よく知らない・教えてほしい",
        suggest: "will",
        weight: 2,
        reason: "法務局の保管制度や法テラスの案内を見ながら、無理なく確認できます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },

  /* 8. 終活ノートの作成 */
  q_family_1: {
    topic: "family",
    label: "終活ノート",
    text: "これまでのことや大切な思いを、ノートや文章に残したことはありますか？",
    opts: [
      {
        value: "summarized",
        t: "すでにノートにまとめている",
        known: ["note"],
        reason: "終活ノートをすでに活用されています。"
      },
      {
        value: "in_progress",
        t: "少し書いたが途中",
        next: "q_note_2",
        suggest: "note",
        weight: 2,
        reason: "書きかけの終活ノートを、書けるところから少しずつ続けるのがおすすめです。"
      },
      {
        value: "not_written",
        t: "まだ書いていない",
        next: "q_note_2",
        suggest: "note",
        weight: 2,
        reason: "家族や大切な人への思いをまとめる「終活ノート」から始めてみませんか。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_note_2: {
    topic: "family",
    label: "終活ノート（くわしく）",
    text: "ノートを用意したり、書き終わった後のしまい場所を誰かに伝えるめどは立っていますか？",
    opts: [
      {
        value: "ready",
        t: "ノートは手元にある（しまい場所の候補もある）",
        suggest: "note",
        weight: 1,
        reason: "あとは少しずつ書き進め、しまい場所を伝えるだけです。"
      },
      {
        value: "not_ready",
        t: "まだノートも用意していない",
        suggest: "note",
        weight: 2,
        reason: "まずはお気に入りのノートやメモ帳を1冊決めるところから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },

  /* 9. 家族・相談先との話し合い */
  q_family_2: {
    topic: "family",
    label: "話し合い・相談",
    text: "準備の状況や思いを、ご家族と話し合う機会はありますか？",
    opts: [
      {
        value: "often",
        t: "よく話している",
        known: ["family"],
        reason: "ご家族との話し合いの機会がすでにあります。"
      },
      {
        value: "rarely",
        t: "あまり話せていない・きっかけがない",
        next: "q_family_3",
        suggest: "family",
        weight: 2,
        reason: "無理のない範囲で家族と話すきっかけづくりをおすすめします。"
      },
      {
        value: "solo",
        t: "今はひとりで整理したい",
        neutral: ["family"],
        reason: "いまはご自身のペースで整理を進めている段階です。落ち着いたときに共有をご検討ください。"
      },
      {
        value: "alone",
        t: "頼れる家族が近くにいない・ひとりで進める",
        next: "q_family_solo",
        suggest: "family",
        weight: 2,
        soloSupport: true,
        reason: "身近に頼れるご家族がいない場合も、地域の公的窓口（地域包括支援センター等）とつながっておくと安心です。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_family_3: {
    topic: "family",
    label: "話し合い（くわしく）",
    text: "ご家族に「まずはこれだけは伝えておきたい」と思う内容は決まっていますか？",
    opts: [
      {
        value: "decided",
        t: "伝えたいことは決まっている",
        suggest: "family",
        weight: 1,
        reason: "伝えたいことがはっきりしているため、話す日を決めるステップへ進めます。"
      },
      {
        value: "undecided",
        t: "何から話せばいいか迷っている",
        suggest: "family",
        weight: 2,
        reason: "まず1つだけ話す内容を決めて、このアプリの話題例などをきっかけにできます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_family_solo: {
    topic: "family",
    label: "おひとりでの備え",
    text: "お近くの「地域包括支援センター」や市町村の相談窓口を利用したことはありますか？",
    opts: [
      {
        value: "connected",
        t: "すでに相談先・担当者が決まっている",
        suggest: "family",
        weight: 1,
        soloSupport: true,
        reason: "相談先が決まっているので、整理した内容や連絡先を共有しておくとより安心です。"
      },
      {
        value: "not_connected",
        t: "まだ相談したことがない・場所を知らない",
        suggest: "family",
        weight: 3,
        soloSupport: true,
        reason: "万が一のときに支えてもらえるよう、お住まいの地域の相談窓口を一度確認しておくのがおすすめです。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },

  /* 10. お墓・葬儀の希望 */
  q_grave_1: {
    topic: "grave",
    label: "お墓・葬儀",
    text: "お墓や葬儀について、ご希望をご家族と話したことはありますか？",
    opts: [
      {
        value: "talked",
        t: "話したことがある",
        known: ["grave"],
        reason: "お墓・葬儀について、すでにお話しできています。"
      },
      {
        value: "has_wish_untalked",
        t: "希望はあるが、まだ話していない",
        next: "q_grave_2",
        suggest: "grave",
        weight: 2,
        reason: "お墓や葬儀のご希望を整理し、伝える準備をおすすめします。"
      },
      {
        value: "undecided",
        t: "まだ決めていない",
        next: "q_grave_3",
        suggest: "grave",
        weight: 1,
        reason: "無理に決めきらず、どんな雰囲気がよいか少しずつ考えていけます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_grave_2: {
    topic: "grave",
    label: "お墓・葬儀（くわしく）",
    text: "ご希望の内容を、ノートなどに書き留めていますか？",
    opts: [
      {
        value: "written",
        t: "書き留めている",
        suggest: "grave",
        weight: 1,
        reason: "メモをお持ちなので、費用や管理について話す段階へ進めます。"
      },
      {
        value: "not_written",
        t: "まだ書いていない",
        suggest: "grave",
        weight: 2,
        reason: "まずは希望の雰囲気やだいたいの予算感をひと言書き出すことから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_grave_3: {
    topic: "grave",
    label: "お墓・葬儀（迷っていること）",
    text: "これから考えるにあたり、気になっている点は何ですか？",
    opts: [
      {
        value: "cost_or_style",
        t: "費用や形式（家族葬・お墓の種類など）",
        suggest: "grave",
        weight: 1,
        reason: "ご希望の雰囲気や予算の目安から整理していくと決めやすくなります。"
      },
      {
        value: "no_successor",
        t: "お墓を継ぐ人がいない・管理が心配",
        suggest: "grave",
        weight: 2,
        reason: "永代供養や散骨など、負担を残さない方法も含めて候補を整理できます。"
      },
      { value: "skip", t: "特にない・答えたくない", skip: true }
    ]
  },

  /* 11. 身の回りの品・生前整理 */
  q_belongings_1: {
    topic: "belongings",
    label: "身の回りの品",
    text: "大切な持ち物の譲り先や、日用品・思い出の品の片付け（生前整理）は進めていますか？",
    opts: [
      {
        value: "done",
        t: "だいたい整理できていて、メモもある",
        known: ["belongings"],
        reason: "身の回りの品や譲りたいものの整理ができています。"
      },
      {
        value: "partial",
        t: "少しずつ始めているが途中",
        next: "q_belongings_2",
        suggest: "belongings",
        weight: 1,
        reason: "無理のないペースで引き出し1段ずつ進めていけます。"
      },
      {
        value: "not_started",
        t: "まだ手をつけていない",
        next: "q_belongings_2",
        suggest: "belongings",
        weight: 2,
        reason: "大切な品の譲り先や日用品の整理を少しずつ考えておくと安心です。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_belongings_2: {
    topic: "belongings",
    label: "身の回りの品（くわしく）",
    text: "「これだけは誰かに譲りたい」「残しておきたい」という品物をメモしていますか？",
    opts: [
      {
        value: "noted",
        t: "メモしている",
        suggest: "belongings",
        weight: 1,
        reason: "大切な品のメモはあるため、日用品の片付けを少しずつ進められます。"
      },
      {
        value: "not_noted",
        t: "まだメモしていない",
        suggest: "belongings",
        weight: 2,
        reason: "まずは特に大切な品物だけを2〜3個書き出すところから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },

  /* 12. ペットのお世話・引き継ぎ */
  q_pet_1: {
    topic: "pet",
    label: "ペットのこと",
    text: "犬や猫など、いまご自宅でお世話をしているペットはいますか？",
    opts: [
      {
        value: "decided",
        t: "ペットがいて、引き継ぎ先も決めている",
        known: ["pet"],
        reason: "ペットの引き継ぎ先がすでに決まっており安心です。"
      },
      {
        value: "undecided",
        t: "ペットがいるが、引き継ぎ先はまだ決まっていない",
        next: "q_pet_2",
        suggest: "pet",
        weight: 3,
        reason: "万が一のときにペットが困らないよう、引き継ぎ先やお世話の相談をおすすめします。"
      },
      {
        value: "none",
        t: "ペットは飼っていない",
        known: ["pet"],
        reason: "現在ペットの引き継ぎ準備は不要です。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_pet_2: {
    topic: "pet",
    label: "ペットのこと（くわしく）",
    text: "ペットの体調や持病、かかりつけ病院やお世話のメモを残していますか？",
    opts: [
      {
        value: "noted",
        t: "メモを残している",
        suggest: "pet",
        weight: 2,
        reason: "お世話メモをお持ちなので、引き継いでくれる候補者との話し合いを進めましょう。"
      },
      {
        value: "not_noted",
        t: "まだ残していない",
        suggest: "pet",
        weight: 3,
        reason: "ごはんの量やかかりつけ病院の情報をノートに書き出すところから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  }
}
