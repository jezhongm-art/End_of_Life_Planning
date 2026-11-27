import React from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { SvgSprite } from './shared/components/SvgIcons'
import { Header } from './shared/components/Header'
import { BottomNav } from './shared/components/BottomNav'
import { AiHelpWidget } from './shared/components/AiHelpWidget'
import { ScrollToTop } from './shared/components/ScrollToTop'
import { useApp } from './shared/context/AppContext'

// ■ A担当の画面
import Home from './memberA/Home'
import Guide from './memberA/Guide'
import SurveyTopics from './memberA/SurveyTopics'
import SurveyQuestions from './memberA/SurveyQuestions'
import SurveyResult from './memberA/SurveyResult'
import WishList from './memberA/WishList'
import More from './memberA/More'

// ■ B担当の画面
import ItemList from './memberB/ItemList'
import ItemDetail from './memberB/ItemDetail'
import ItemInfo from './memberB/ItemInfo'
import Memories from './memberB/Memories'
import FamilyTalk from './memberB/FamilyTalk'

// ■ C担当の画面
import Settings from './memberC/Settings'

export default function App() {
  const location = useLocation()
  const { saveError, loadError, clearSaveError, clearLoadError, retrySave } = useApp()

  // 画面ごとのヘッダータイトル定義
  const getHeaderTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return null // ブランドロゴ表示
      case '/guide':
        return 'アプリの使い方'
      case '/survey':
        return '生活状況アンケート'
      case '/survey/q':
        return 'アンケート'
      case '/survey/result':
        return 'アンケートの結果'
      case '/items':
        return '準備項目一覧'
      case '/items/detail':
        return '準備項目の詳細'
      case '/items/info':
        return 'くわしい案内'
      case '/wishes':
        return 'やってみたいこと'
      case '/settings':
        return '基本設定・管理'
      case '/memories':
        return '希望・思い出帳'
      case '/family':
        return '家族との対話'
      case '/more':
        return 'その他の機能'
      default:
        return null
    }
  }

  const title = getHeaderTitle(location.pathname)

  return (
    <>
      <SvgSprite />

      <a href="#screen" className="skip-link">
        メインコンテンツへ移動
      </a>

      <div className="app">
        <ScrollToTop />
        <Header title={title} />

        {(loadError || saveError) && (
          <div
            className="notice notice-rose"
            role="alert"
            aria-live="assertive"
            style={{ marginBottom: '1rem' }}
          >
            <div className="n-body">
              <p className="n-title">データの保存・読み込みに関するお知らせ</p>
              {loadError && <p className="n-sub" style={{ color: 'var(--ink)' }}>{loadError}</p>}
              {saveError && <p className="n-sub" style={{ color: 'var(--ink)' }}>{saveError.message}</p>}
              <div className="btn-row" style={{ marginTop: '.65rem' }}>
                {saveError && (
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={retrySave}
                  >
                    もう一度保存を試す
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={() => {
                    if (loadError) clearLoadError()
                    if (saveError) clearSaveError()
                  }}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        <main id="screen" tabIndex={-1} className="screen-focus">
          <Routes>
            {/* ■ A担当の画面 */}
            <Route path="/" element={<Home />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/survey" element={<SurveyTopics />} />
            <Route path="/survey/q" element={<SurveyQuestions />} />
            <Route path="/survey/result" element={<SurveyResult />} />
            <Route path="/wishes" element={<WishList />} />
            <Route path="/more" element={<More />} />

            {/* ■ B担当の画面 */}
            <Route path="/items" element={<ItemList />} />
            <Route path="/items/detail" element={<ItemDetail />} />
            <Route path="/items/info" element={<ItemInfo />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/family" element={<FamilyTalk />} />

            {/* ■ C担当の画面 */}
            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <AiHelpWidget />
      <BottomNav />
    </>
  )
}
