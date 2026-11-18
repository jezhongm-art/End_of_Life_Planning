import React, { useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { SvgSprite } from './shared/components/SvgIcons'
import { Header } from './shared/components/Header'
import { BottomNav } from './shared/components/BottomNav'
import { DevNavigationSheet } from './shared/components/DevNavigationSheet'

// ■ A担当の画面
import Home from './memberA/Home'
import Guide from './memberA/Guide'
import SurveyTopics from './memberA/SurveyTopics'
import SurveyQuestions from './memberA/SurveyQuestions'
import SurveyResult from './memberA/SurveyResult'
import WishList from './memberA/WishList'

// ■ B担当の画面
import ItemList from './memberB/ItemList'
import ItemDetail from './memberB/ItemDetail'
import Memories from './memberB/Memories'
import FamilyTalk from './memberB/FamilyTalk'

// ■ C担当の画面
import Settings from './memberC/Settings'

export default function App() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const location = useLocation()

  // 画面ごとのヘッダータイトル定義
  const getHeaderTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return null // ブランドロゴ表示
      case '/guide':
        return '初回案内'
      case '/survey':
        return '生活状況アンケート'
      case '/survey/q':
        return 'アンケート：質問'
      case '/survey/result':
        return '質問結果・準備の提案'
      case '/items':
        return '準備項目一覧'
      case '/items/detail':
        return '準備項目の詳細'
      case '/wishes':
        return 'やってみたいことリスト'
      case '/settings':
        return '基本設定'
      case '/memories':
        return '希望・思い出の記録'
      case '/family':
        return '家族との対話・ごほうび相談'
      default:
        return null
    }
  }

  const title = getHeaderTitle(location.pathname)

  return (
    <>
      <SvgSprite />

      {/* 開発・チーム共有用プロトタイプバー */}
      <div className="protobar">
        <div className="pb-in">
          <span className="pb-tag">3人チーム開発環境</span>
          <span className="pb-now">{title || '終活みちしるべ（ホーム）'}</span>
          <button
            type="button"
            className="pb-btn"
            onClick={() => setIsSheetOpen(true)}
          >
            画面一覧・テスト
          </button>
        </div>
      </div>

      <div className="app">
        <Header
          title={title}
          onOpenSheet={() => setIsSheetOpen(true)}
        />

        <main id="screen">
          <Routes>
            {/* ■ A担当の画面 */}
            <Route path="/" element={<Home />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/survey" element={<SurveyTopics />} />
            <Route path="/survey/q" element={<SurveyQuestions />} />
            <Route path="/survey/result" element={<SurveyResult />} />
            <Route path="/wishes" element={<WishList />} />

            {/* ■ B担当の画面 */}
            <Route path="/items" element={<ItemList />} />
            <Route path="/items/detail" element={<ItemDetail />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/family" element={<FamilyTalk />} />

            {/* ■ C担当の画面 */}
            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <p className="foot">
          終活みちしるべ｜Webアプリ版<br />
          入力内容はこの端末のブラウザ（localStorage）に保存され、設定からいつでも削除できます。
        </p>
      </div>

      <BottomNav />

      <DevNavigationSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </>
  )
}
