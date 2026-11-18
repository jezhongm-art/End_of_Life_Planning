import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ITEMS } from '../memberB/items'
import { StatusBadge } from '../memberB/StatusBadge'
import { Icon } from '../shared/components/SvgIcons'

export default function SurveyResult() {
  const navigate = useNavigate()
  const { state, setItemPriority, toast } = useApp()

  const analysis = state.analysis

  // 提案項目リストの組み立て
  const newlyItems = (analysis?.newly || []).map((n) => {
    const item = ITEMS.find((it) => it.id === n.id)
    return { ...n, item }
  }).filter((n) => !!n.item)

  const knownItems = (analysis?.known || []).map((k) => {
    const item = ITEMS.find((it) => it.id === k.id)
    return { ...k, item }
  }).filter((k) => !!k.item)

  // おすすめの次の一歩（新しく見つかったものから1つ、なければ優先項目）
  const topPick = newlyItems.length > 0 ? newlyItems[0] : (ITEMS[0] ? { id: ITEMS[0].id, item: ITEMS[0], reason: '基本となる準備から始めましょう' } : null)

  const handleSetPriority = (id) => {
    setItemPriority(id)
  }

  return (
    <div className="screen-anim">
      {/* 完了バナー */}
      <div className="notice notice-teal">
        <div className="n-ic">
          <Icon name="check" stroke />
        </div>
        <div className="n-body">
          <h2 className="n-title">アンケート集計結果</h2>
          <p className="n-sub">
            ご回答内容にもとづき、優先して確認が必要な項目をまとめました。
          </p>
        </div>
      </div>

      {/* 最初におすすめする次の一歩 */}
      {topPick && topPick.item && (
        <section className="hero" style={{ marginTop: '1rem' }}>
          <div className="h-eyebrow">
            <Icon name="star" style={{ width: '1rem', height: '1rem' }} /> 優先する取り組み
          </div>
          <h3 className="h-title">{topPick.item.title}</h3>
          <p className="card-sub">{topPick.item.desc}</p>
          <div className="h-reason">
            <strong>理由：</strong> {topPick.reason}
          </div>

          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <Link
              to={`/items/detail?id=${topPick.item.id}`}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              手順を確認する
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => handleSetPriority(topPick.item.id)}
            >
              次の取り組みに設定
            </button>
          </div>
        </section>
      )}

      {/* 新しく見つかった準備 */}
      <h3 className="sec-title">確認をおすすめする項目（{newlyItems.length}件）</h3>
      {newlyItems.length === 0 ? (
        <div className="empty">
          回答された範囲では、新しく優先すべき項目はありません。
        </div>
      ) : (
        newlyItems.map(({ item, reason }) => {
          const itemState = state.items[item.id]?.state || 'unknown'
          return (
            <Link
              key={item.id}
              to={`/items/detail?id=${item.id}`}
              className="rowitem"
            >
              <div className="r-main">
                <span className="r-title">{item.title}</span>
                <span className="r-sub">{reason}</span>
                <div style={{ marginTop: '.4rem' }}>
                  <StatusBadge state={itemState} />
                </div>
              </div>
              <Icon name="chev" stroke className="chev" />
            </Link>
          )
        })
      )}

      {/* すでに把握・対応できている項目 */}
      {knownItems.length > 0 && (
        <>
          <h3 className="sec-title" style={{ marginTop: '1.4rem' }}>
            把握済みの項目（{knownItems.length}件）
          </h3>
          {knownItems.map(({ item, reason }) => {
            const itemState = state.items[item.id]?.state || 'unknown'
            return (
              <div key={item.id} className="card" style={{ marginTop: '.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800 }}>{item.title}</span>
                  <StatusBadge state={itemState} />
                </div>
                <p className="note" style={{ marginTop: '.3rem' }}>{reason}</p>
              </div>
            )
          })}
        </>
      )}

      {/* 家族に伝えるまとめカード */}
      <section className="card" style={{ marginTop: '1.4rem' }}>
        <h3 className="card-title">家族への相談用メモ</h3>
        <p className="card-sub">
          家族に相談するとき、そのまま伝えられる文面の例です。
        </p>

        <div className="qbubble" style={{ marginTop: '.7rem' }}>
          「終活みちしるべで確認したところ、まずは『
          {topPick?.item?.title || '準備項目'}』から整理を始めようと思っています。
          {newlyItems.length > 0 && `あわせて${newlyItems.map((n) => n.item.title).join('、')}も確認していく予定です。`}
          無理のないペースで進めるので、相談に乗ってくれると助かります。」
        </div>
      </section>

      {/* アクションボタン */}
      <div className="btn-row" style={{ marginTop: '1.4rem' }}>
        <Link to="/items" className="btn btn-primary btn-block">
          準備項目の一覧へ進む
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '.7rem' }}>
        <Link to="/" className="btn btn-ghost btn-small">
          ホームへ戻る
        </Link>
      </div>
    </div>
  )
}
