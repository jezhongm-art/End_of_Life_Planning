export const QUIZ_ROOTS = {
  money: "q_money_1",
  insurance: "q_insurance_1",
  digital: "q_digital_1",
  medical: "q_medical_1",
  house: "q_house_type",
  grave: "q_grave_1",
  family: "q_family_1",
  pet: "q_pet_1"
}

export const BASE_QUIZ_SEQUENCE = [
  "q_money_1",
  "q_insurance_1",
  "q_digital_1",
  "q_medical_1",
  "q_house_type",
  "q_grave_1",
  "q_family_1",
  "q_family_2",
  "q_pet_1"
]

export const QUIZ_NODES = {
  q_money_1: {
    topic: "money",
    label: "お金・通帳",
    text: "通帳や大切な書類のしまい場所を、ご家族に伝えていますか？",
    opts: [
      {
        value: "shared",
        t: "もう伝えている",
        known: ["money"],
        reason: "ご家族としまい場所をすでに共有できています。"
      },
      {
        value: "partial",
        t: "一部だけ伝えている",
        next: "q_money_2",
        suggest: "money",
        reason: "一部だけ伝わっているため、一覧にしておくとご家族もより安心です。"
      },
      {
        value: "not_shared",
        t: "まだ伝えていない",
        next: "q_money_2",
        suggest: "money",
        reason: "通帳や書類の場所がご家族に伝わっていないため、一覧づくりをおすすめします。"
      },
      {
        value: "unknown",
        t: "わからない",
        next: "q_money_2",
        suggest: "money",
        reason: "まずはお手元の通帳や書類がどこにあるか確かめるところから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_money_2: {
    topic: "money",
    label: "お金・通帳（くわしく）",
    text: "ご自身で、持っている通帳や口座のメモを作っていますか？",
    opts: [
      {
        value: "listed",
        t: "メモを作ってある",
        suggest: "money",
        reason: "一覧をお持ちなので、次はしまい場所をご家族に伝える段階に進めます。"
      },
      {
        value: "not_listed",
        t: "まだ作っていない",
        suggest: "money",
        reason: "銀行名だけでもメモにしておくと、ご自身での見直しも楽になります。"
      },
      { value: "skip", t: "わからない・答えたくない", skip: true }
    ]
  },
  q_insurance_1: {
    topic: "money",
    label: "保険・年金",
    text: "入っている保険の内容や、受け取る人の名前を確認したことはありますか？",
    opts: [
      {
        value: "confirmed",
        t: "確認していて、書類の場所も家族に伝えた",
        known: ["insurance"],
        reason: "保険の内容や書類の場所をすでに確認できています。"
      },
      {
        value: "unclear",
        t: "入っているが、内容や受け取る人が曖昧",
        suggest: "insurance",
        reason: "保険の内容や受け取る人、年金の記録を一度見直しておくと安心です。"
      },
      {
        value: "unchecked",
        t: "まだ確認していない",
        suggest: "insurance",
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
        reason: "保険には未加入ですが、年金の記録や控えの場所を確認しておくと安心です。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
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
        known: ["digital"],
        reason: "ネット上の契約は少ないため、大きな整理は不要な状況です。"
      },
      {
        value: "unused",
        t: "使っていない",
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
        reason: "契約している会社名と引き落とし先だけでも書いておくと、ご家族が手続きに困りません。"
      },
      { value: "skip", t: "わからない・答えたくない", skip: true }
    ]
  },
  q_medical_1: {
    topic: "medical",
    label: "医療・介護",
    text: "体調を崩したときの治療や介護について、ご家族に伝えたい希望はありますか？",
    opts: [
      {
        value: "shared",
        t: "希望があり、家族にも伝えている",
        known: ["medical"],
        reason: "医療・介護の希望をご家族と共有できています。"
      },
      {
        value: "has_wish_unshared",
        t: "希望はあるが、まだ伝えていない",
        next: "q_medical_2",
        suggest: "medical",
        reason: "お持ちの希望をご家族に伝えられるよう、メモに整理することをおすすめします。"
      },
      {
        value: "undecided",
        t: "まだ決めていない・迷っている",
        next: "q_medical_2",
        suggest: "medical",
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
        reason: "お医者さんに相談されているため、ご家族との話し合いにつなげられます。"
      },
      {
        value: "not_consulted",
        t: "まだ相談していない",
        suggest: "medical",
        reason: "今の希望を書き出したうえで、次の診察時に相談してみるのもおすすめです。"
      },
      {
        value: "no_doctor",
        t: "かかりつけ医はいない",
        suggest: "medical",
        reason: "まずは紙やノートに希望を書き出すことから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
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
        reason: "住まいの権利書や契約書について、しまい場所を確認しておくと安心です。"
      },
      {
        value: "unknown",
        t: "わからない・まだ確認していない",
        suggest: "house",
        reason: "書類がどこにあるか、ご家族と一緒に確かめるところから始められます。"
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
        reason: "持ち家の権利書や名義の書類について、しまい場所を確認しておくと安心です。"
      },
      {
        value: "unknown",
        t: "わからない",
        suggest: "house",
        reason: "書類がどこにあるか、ご家族と一緒に探してみるところから始められます。"
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
  q_grave_1: {
    topic: "grave",
    label: "お墓・葬儀",
    text: "お墓や葬儀について、ご希望をご家族と話したことはありますか？",
    opts: [
      {
        value: "talked",
        t: "話したことがある",
        known: ["grave"],
        reason: "お墓・葬儀について、ご家族とすでにお話しできています。"
      },
      {
        value: "has_wish_untalked",
        t: "希望はあるが、まだ話していない",
        next: "q_grave_2",
        suggest: "grave",
        reason: "お墓や葬儀のご希望を整理し、ご家族に伝える準備をおすすめします。"
      },
      {
        value: "undecided",
        t: "まだ決めていない",
        next: "q_grave_2",
        suggest: "grave",
        reason: "無理に決めきらず、こんな雰囲気がいいというメモを残すだけでも十分です。"
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
        reason: "メモをお持ちなので、ご家族と話す日を決める段階へ進めます。"
      },
      {
        value: "not_written",
        t: "まだ書いていない",
        suggest: "grave",
        reason: "まずは希望の雰囲気やだいたいの予算感をひと言書き出すことから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_family_1: {
    topic: "family",
    label: "家族に伝えること",
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
        suggest: "note",
        reason: "書きかけの終活ノートを、書けるところから少しずつ続けるのがおすすめです。"
      },
      {
        value: "not_written",
        t: "まだ書いていない",
        suggest: "note",
        reason: "家族へのメッセージや希望をまとめる「終活ノート」から始めてみませんか。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
  q_family_2: {
    topic: "family",
    label: "家族に伝えること（話し合い）",
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
        suggest: "family",
        reason: "まだ話し合えていないため、無理のない範囲で家族と話すきっかけづくりをおすすめします。"
      },
      {
        value: "solo",
        t: "今はひとりで整理したい",
        neutral: ["family"],
        reason: "いまはご自身のペースで整理を進めている段階です。落ち着いたときに家族との共有をご検討ください。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  },
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
        reason: "お世話メモをお持ちなので、次は引き継いでくれる候補者との話し合いを進めましょう。"
      },
      {
        value: "not_noted",
        t: "まだ残していない",
        suggest: "pet",
        reason: "ごはんの量やかかりつけ病院の情報をノートに書き出すところから始められます。"
      },
      { value: "skip", t: "答えたくない", skip: true }
    ]
  }
}
