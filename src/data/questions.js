export const QUIZ_ROOTS = {
  money: "q_money_1",
  medical: "q_medical_1",
  house: "q_house_1",
  grave: "q_grave_1",
  family: "q_family_1"
}

export const QUIZ_NODES = {
  q_money_1: {
    topic: "money",
    label: "お金・保険",
    text: "通帳や大切な契約書類がどこにあるか、ご家族に伝えていますか?",
    opts: [
      { t: "すでに伝えている", next: null, known: ["money"], reason: "ご家族と保管場所をすでに共有できています。" },
      { t: "一部だけ伝えている", next: "q_money_2", suggest: "money", reason: "一部だけ伝わっているため、一覧で整理するとご家族もより安心できます。" },
      { t: "まだ伝えていない", next: "q_money_2", suggest: "money", reason: "通帳や書類の保管場所がご家族に伝わっていないため、一覧づくりをおすすめします。" },
      { t: "分からない", next: null, suggest: "money", reason: "まずはお手元の通帳や書類がどこにあるか確かめるところから始められます。" },
      { t: "答えたくない", next: null, skip: true }
    ]
  },
  q_money_2: {
    topic: "money",
    label: "お金・保険（くわしく）",
    text: "ご自身で、通帳や加入している保険などの一覧を書き出していますか?",
    opts: [
      { t: "書き出している", next: null, doing: "money", suggest: "money", reason: "一覧をお持ちなので、次は保管場所をご家族に伝える進め方ができます。" },
      { t: "まだ書き出していない", next: null, suggest: "money", reason: "一覧をメモにしておくと、ご自身での見直しも簡単になります。" },
      { t: "保険には入っていない", next: null, naCandidate: "insurance", reason: "保険に未加入との回答から、保険の確認は必要に応じて「対象外」に設定できます。" },
      { t: "分からない・答えたくない", next: null, skip: true }
    ]
  },
  q_medical_1: {
    topic: "medical",
    label: "医療・介護",
    text: "体調を崩したときの治療や介護について、ご家族に伝えたい希望はありますか?",
    opts: [
      { t: "希望があり、家族にも伝えている", next: null, known: ["medical"], reason: "医療・介護の希望をご家族と共有できています。" },
      { t: "希望はあるが、まだ伝えていない", next: "q_medical_2", suggest: "medical", reason: "お持ちの希望をご家族に伝えられるよう、メモに整理することをおすすめします。" },
      { t: "まだ決めていない・迷っている", next: "q_medical_2", suggest: "medical", reason: "迷っている気持ちも含めて書き出しておくと、あとから相談しやすくなります。" },
      { t: "特に考えていない", next: null, unconfirmedNote: "medical" },
      { t: "答えたくない", next: null, skip: true }
    ]
  },
  q_medical_2: {
    topic: "medical",
    label: "医療・介護（くわしく）",
    text: "かかりつけの医師や病院に、これまでの治療の希望を相談したことはありますか?",
    opts: [
      { t: "相談したことがある", next: null, doing: "medical", suggest: "medical", reason: "医師に相談されているため、ご家族との話し合いにつなげられます。" },
      { t: "まだ相談していない", next: null, suggest: "medical", reason: "今の希望を書き出したうえで、次の診察時に相談する手順をおすすめします。" },
      { t: "かかりつけ医はいない", next: null, suggest: "medical", reason: "まずは紙やノートに希望を書き出すことから始められます。" },
      { t: "答えたくない", next: null, skip: true }
    ]
  },
  q_house_1: {
    topic: "house",
    label: "住まい",
    text: "いまお住まいの住居は、次のどちらに近いですか?",
    opts: [
      { t: "持ち家（ご自身やご家族の所有）", next: "q_house_own" },
      { t: "賃貸（アパート・マンションなど）", next: "q_house_rent" },
      { t: "家族と同居・施設など", next: null, known: ["house"], reason: "お住まいの管理はご家族や施設と把握できている状態です。" },
      { t: "分からない・答えたくない", next: null, skip: true }
    ]
  },
  q_house_own: {
    topic: "house",
    label: "住まい（持ち家について）",
    text: "家の権利書や名義の書類は、すぐ取り出せる場所にありますか?",
    opts: [
      { t: "すぐ取り出せて把握している", next: null, known: ["house"], reason: "持ち家の大切な書類をすでに把握できています。" },
      { t: "探せばあるが場所が曖昧", next: null, suggest: "house", reason: "持ち家の権利書や名義の書類について、保管場所を確認しておくと安心です。" },
      { t: "分からない", next: null, suggest: "house", reason: "書類がどこにあるか、ご家族と一緒に探してみるところから始められます。" },
      { t: "答えたくない", next: null, skip: true }
    ]
  },
  q_house_rent: {
    topic: "house",
    label: "住まい（賃貸について）",
    text: "賃貸の契約書や、更新時期・緊急連絡先の控えはお手元にありますか?",
    opts: [
      { t: "手元にあり把握している", next: null, known: ["house"], reason: "賃貸の契約書類と連絡先を把握できています。" },
      { t: "すぐに見つからない・曖昧", next: null, suggest: "house", reason: "賃貸の契約書と緊急連絡先の控えを確認し、メモを残すのがおすすめです。" },
      { t: "答えたくない", next: null, skip: true }
    ]
  },
  q_grave_1: {
    topic: "grave",
    label: "お墓・葬儀",
    text: "お墓や葬儀について、ご希望をご家族と話したことはありますか?",
    opts: [
      { t: "話したことがある", next: null, known: ["grave"], reason: "お墓・葬儀について、ご家族とすでにお話しできています。" },
      { t: "希望はあるが、まだ話していない", next: "q_grave_2", suggest: "grave", reason: "お墓や葬儀のご希望を整理し、ご家族に伝える準備をおすすめします。" },
      { t: "まだ決まっていない", next: null, suggest: "grave", reason: "無理に決めきらず、どんな希望の候補があるかメモに残すだけでも十分です。" },
      { t: "答えたくない", next: null, skip: true }
    ]
  },
  q_grave_2: {
    topic: "grave",
    label: "お墓・葬儀（くわしく）",
    text: "ご希望の内容を、ノートなどに書き留めていますか?",
    opts: [
      { t: "書き留めている", next: null, doing: "grave", suggest: "grave", reason: "メモをお持ちなので、ご家族と話す日を決めるステップへ進めます。" },
      { t: "まだ書いていない", next: null, suggest: "grave", reason: "まずは希望の雰囲気や予算感をひと言書き出すことから始められます。" },
      { t: "答えたくない", next: null, skip: true }
    ]
  },
  q_family_1: {
    topic: "family",
    label: "家族に伝えること",
    text: "これまでのことや大切な思いを、ノートや文章に残したことはありますか?",
    opts: [
      { t: "すでにノートにまとめている", next: "q_family_2", known: ["note"], reason: "終活ノートをすでに活用されています。" },
      { t: "少し書いたが途中", next: "q_family_2", doing: "note", suggest: "note", reason: "書きかけの終活ノートを、少しずつ続けるのがおすすめです。" },
      { t: "まだ書いていない", next: "q_family_2", suggest: "note", reason: "家族へのメッセージや希望をまとめる「終活ノート」から始めてみませんか。" },
      { t: "答えたくない", next: null, skip: true }
    ]
  },
  q_family_2: {
    topic: "family",
    label: "家族に伝えること（話し合い）",
    text: "準備の状況や思いを、ご家族と話し合う機会はありますか?",
    opts: [
      { t: "よく話している", next: null, known: ["family"], reason: "ご家族との話し合いの機会がすでにあります。" },
      { t: "あまり話せていない・きっかけがない", next: null, suggest: "family", reason: "まだ話し合えていないため、無理のない範囲で家族と共有する手順をおすすめします。" },
      { t: "今はひとりで整理したい", next: null, known: ["family"], reason: "ご自身のペースで整理を進め、準備ができてから共有をご検討いただけます。" },
      { t: "答えたくない", next: null, skip: true }
    ]
  }
}
