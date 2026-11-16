# 終活みちしるべ（チーム開発）

終活準備サポートWebアプリ「**終活みちしるべ**」の開発リポジトリです。  
（React + Vite + React Router + Context API）

---

## 1. 起動方法

```bash
npm install   # 初回のみ（パッケージ導入）
npm run dev   # 開発サーバー起動（http://localhost:5173/）
```

> 💡 **画面の確認方法**  
> 画面最上部の黒いバーにある「**画面一覧・テスト**」ボタンを押すと、いつでも全画面へ直接ジャンプでき、テスト用サンプルデータの適用もできます。

---

## 2. 担当分けと作業ファイル（計43h ＋ 予備2h）

各自、以下の**担当ファイル**を開いて作業を進めてください。

### ■ A担当（計17h）：画面・フロー統合
| 機能・作業 | 時間 | 作業ファイル |
|---|:---:|---|
| ① ホーム / ② 初回案内 | 3h | `src/pages/Home.jsx`<br>`src/pages/Guide.jsx` |
| ⑤ 生活状況アンケート画面（分岐） | 5h | `src/pages/SurveyTopics.jsx`<br>`src/pages/SurveyQuestions.jsx` |
| ⑥ 回答分析連携 / ⑦ 質問結果・提案表示 | 7h | `src/pages/SurveyResult.jsx`<br>`src/context/AppContext.jsx` |
| ⑨ やってみたいことリスト | 2h | `src/pages/WishList.jsx` |

### ■ B担当（計11h）：準備項目系
| 機能・作業 | 時間 | 作業ファイル |
|---|:---:|---|
| ③ 準備項目一覧（7項目） | 4h | `src/pages/ItemList.jsx` |
| ④ 準備状況・優先順位の管理 | 5h | `src/pages/ItemDetail.jsx`<br>`src/components/StatusBadge.jsx` |
| ⑧ 相談先・手続きガイド | 2h | `src/pages/ItemDetail.jsx`<br>`src/data/items.js` |

### ■ C担当（計9h）：データ設計・基本設定
| 機能・作業 | 時間 | 作業ファイル |
|---|:---:|---|
| ⑤ 質問データ作成 | 4h | `src/data/questions.js` |
| ⑥ 回答・提案の対応表作成 | 3h | `src/data/rules.js` |
| ⑩ 基本設定（名前・文字サイズ変更） | 2h | `src/pages/Settings.jsx` |

### ■ 全員（各2h / 計6h）
- **機能の統合・動作確認**: `src/App.jsx` および全画面の結合テスト

---

## 3. おすすめの作業順序

1. **C担当** が質問データ（`questions.js`）と対応表（`rules.js`）を先行して作成する
2. **A担当** はホームや案内画面から着手し、Cのデータ完了後にアンケート画面へ組み込む
3. **B担当** は他と独立しているため、最初から準備項目一覧・詳細画面を並行して進める
4. 最後に全員で各画面をつなぎ、結合テストを行う

---

## 4. 開発ルール（Git）

- 作業開始時は各自のブランチを作成してください（例: `git checkout -b feature/item-detail`）
- 自分の担当ファイル（`src/pages/` や `src/data/`）を中心に編集することで、競合（コンフリクト）を防げます
