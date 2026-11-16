import React, { useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { SvgSprite } from './components/SvgIcons'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { DevNavigationSheet } from './components/DevNavigationSheet'

import Home from './pages/Home'
import Guide from './pages/Guide'
import SurveyTopics from './pages/SurveyTopics'
import SurveyQuestions from './pages/SurveyQuestions'
import SurveyResult from './pages/SurveyResult'
import ItemList from './pages/ItemList'
import ItemDetail from './pages/ItemDetail'
import WishList from './pages/WishList'
import Settings from './pages/Settings'
import Memories from './pages/Memories'
import FamilyTalk from './pages/FamilyTalk'

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
        return 'アンケート：分野選択'
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
            <Route path="/" element={<Home />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/survey" element={<SurveyTopics />} />
            <Route path="/survey/q" element={<SurveyQuestions />} />
            <Route path="/survey/result" element={<SurveyResult />} />
            <Route path="/items" element={<ItemList />} />
            <Route path="/items/detail" element={<ItemDetail />} />
            <Route path="/wishes" element={<WishList />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/family" element={<FamilyTalk />} />
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
