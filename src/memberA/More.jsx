import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { Icon } from '../shared/components/SvgIcons'

export default function More() {
  const { state } = useApp()

  return (
    <div className="screen-anim">
      <h2 className="sec-title" style={{ marginTop: 0 }}>暮らしと家族の記録</h2>
      <div>
        <Link to="/wishes" className="rowitem rowitem-compact">
          <div className="t-ic t-amber" style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
            <Icon name="star" />
          </div>
          <div className="r-main" style={{ display: 'block' }}>
            <span className="r-title">
              やってみたいこと <span className="nowrap">（{state.wishes.length}件）</span>
            </span>
            <span className="r-sub">楽しみやごほうびを登録します</span>
          </div>
          <Icon name="chev" stroke className="chev" />
        </Link>

        <Link to="/memories" className="rowitem rowitem-compact">
          <div className="t-ic t-rose" style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
            <Icon name="heart" />
          </div>
          <div className="r-main" style={{ display: 'block' }}>
            <span className="r-title">
              希望・思い出帳 <span className="nowrap">（{state.memos.length}件）</span>
            </span>
            <span className="r-sub">大切な思い出や写真を残します</span>
          </div>
          <Icon name="chev" stroke className="chev" />
        </Link>

        <Link to="/family" className="rowitem rowitem-compact">
          <div className="t-ic t-plus" style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
            <Icon name="people" />
          </div>
          <div className="r-main" style={{ display: 'block' }}>
            <span className="r-title">
              家族との話し合い <span className="nowrap">（{state.talkLogs.length}件）</span>
            </span>
            <span className="r-sub">話題の練習や記録を残します</span>
          </div>
          <Icon name="chev" stroke className="chev" />
        </Link>
      </div>

      <h2 className="sec-title">案内・設定</h2>
      <div>
        <Link to="/guide" className="rowitem rowitem-compact">
          <div className="t-ic t-teal" style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
            <Icon name="book" stroke />
          </div>
          <div className="r-main" style={{ display: 'block' }}>
            <span className="r-title">このアプリの使い方</span>
            <span className="r-sub">3つの流れや安心のポイント</span>
          </div>
          <Icon name="chev" stroke className="chev" />
        </Link>

        <Link to="/settings" className="rowitem rowitem-compact">
          <div className="t-ic t-slate" style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
            <Icon name="gear" />
          </div>
          <div className="r-main" style={{ display: 'block' }}>
            <span className="r-title">文字の大きさ・設定</span>
            <span className="r-sub">お名前・文字・データの管理</span>
          </div>
          <Icon name="chev" stroke className="chev" />
        </Link>
      </div>
    </div>
  )
}
