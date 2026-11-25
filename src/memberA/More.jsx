import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { Icon } from '../shared/components/SvgIcons'

export default function More() {
  const { state } = useApp()

  return (
    <div className="screen-anim">
      <section className="card">
        <h2 className="card-title">その他の機能</h2>
        <p className="card-sub">
          楽しみや思い出の記録、家族との対話、基本設定などをまとめています。
        </p>
      </section>

      <h3 className="sec-title">暮らしと家族の記録</h3>
      <div>
        <Link to="/wishes" className="rowitem">
          <div className="t-ic t-amber" style={{ width: '2.6rem', height: '2.6rem', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
            <Icon name="star" />
          </div>
          <div className="r-main">
            <span className="r-title">やってみたいこと一覧（{state.wishes.length}件）</span>
            <span className="r-sub">楽しみやごほうび目標を登録・確認します</span>
          </div>
          <Icon name="chev" stroke className="chev" />
        </Link>

        <Link to="/memories" className="rowitem">
          <div className="t-ic t-rose" style={{ width: '2.6rem', height: '2.6rem', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
            <Icon name="heart" />
          </div>
          <div className="r-main">
            <span className="r-title">希望・思い出帳（{state.memos.length}件）</span>
            <span className="r-sub">人生の思い出や写真、言葉を残します</span>
          </div>
          <Icon name="chev" stroke className="chev" />
        </Link>

        <Link to="/family" className="rowitem">
          <div className="t-ic t-plus" style={{ width: '2.6rem', height: '2.6rem', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
            <Icon name="people" />
          </div>
          <div className="r-main">
            <span className="r-title">家族との対話・相談練習（{state.talkLogs.length}件）</span>
            <span className="r-sub">話題の確認、相談メッセージ練習、話し合いの記録</span>
          </div>
          <Icon name="chev" stroke className="chev" />
        </Link>
      </div>

      <h3 className="sec-title">案内・設定</h3>
      <div>
        <Link to="/guide" className="rowitem">
          <div className="t-ic t-teal" style={{ width: '2.6rem', height: '2.6rem', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
            <Icon name="book" stroke />
          </div>
          <div className="r-main">
            <span className="r-title">アプリの使い方（初回案内）</span>
            <span className="r-sub">3ステップの流れや安心のポイントを確認します</span>
          </div>
          <Icon name="chev" stroke className="chev" />
        </Link>

        <Link to="/settings" className="rowitem">
          <div className="t-ic t-slate" style={{ width: '2.6rem', height: '2.6rem', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
            <Icon name="gear" />
          </div>
          <div className="r-main">
            <span className="r-title">基本設定・データ管理</span>
            <span className="r-sub">お名前・文字の大きさ・入力例のお試し・消去</span>
          </div>
          <Icon name="chev" stroke className="chev" />
        </Link>
      </div>
    </div>
  )
}
