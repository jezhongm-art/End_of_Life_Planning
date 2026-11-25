import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ITEMS, TOPICS } from './items'
import { StatusBadge } from './StatusBadge'
import { ProgressBar } from '../shared/components/ProgressBar'
import { Icon } from '../shared/components/SvgIcons'

const FILTER_TABS = [
  { id: 'all', label: (total) => `すべて（${total}）` },
  { id: 'doing', label: (_, remaining) => `これから（${remaining}）` },
  { id: 'done', label: (_, __, done) => `完了（${done}）` }
]

export default function ItemList() {
  const { state, calcProgress } = useApp()
  const progress = calcProgress()
  const remainingCount = progress.total - progress.doneCount

  const [filter, setFilter] = useState('all') // all | doing | done

  const filteredItems = ITEMS.filter((item) => {
    const itemState = state.items[item.id]?.state || 'notyet'
    if (filter === 'doing') {
      return itemState !== 'done'
    }
    if (filter === 'done') {
      return itemState === 'done'
    }
    return true
  })

  const handleTabKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = FILTER_TABS[(idx + 1) % FILTER_TABS.length]
      setFilter(next.id)
      document.getElementById(`item-filter-tab-${next.id}`)?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = FILTER_TABS[(idx - 1 + FILTER_TABS.length) % FILTER_TABS.length]
      setFilter(prev.id)
      document.getElementById(`item-filter-tab-${prev.id}`)?.focus()
    }
  }

  return (
    <div className="screen-anim">
      {/* 画面説明 & 進捗 */}
      <section className="card">
        <h2 className="card-title">準備項目一覧（全{ITEMS.length}項目）</h2>
        <p className="card-sub">
          終活に必要な基本的な{ITEMS.length}つの準備です。気になる項目を選んで手順を確認できます。
        </p>
        <div style={{ marginTop: '.6rem' }}>
          <ProgressBar pct={progress.pct} label={`完了: ${progress.doneCount} / ${progress.total} 項目`} />
        </div>
      </section>

      {/* フィルタータブ */}
      <div
        className="segtabs segtabs-3"
        style={{ marginTop: '1rem' }}
        role="tablist"
        aria-label="準備項目の絞り込み"
      >
        {FILTER_TABS.map((tab, idx) => {
          const isSelected = filter === tab.id
          return (
            <button
              key={tab.id}
              id={`item-filter-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={`segtab ${isSelected ? 'on' : ''}`}
              onClick={() => setFilter(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
            >
              {tab.label(ITEMS.length, remainingCount, progress.doneCount)}
            </button>
          )
        })}
      </div>

      {/* 項目リスト */}
      <div role="tabpanel" aria-labelledby={`item-filter-tab-${filter}`}>
        {filteredItems.length === 0 ? (
          <div className="empty">
            {filter === 'done'
              ? 'まだ完了した項目はありません。'
              : 'すべての項目が完了しています。'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const itemState = state.items[item.id]?.state || 'notyet'
            const itemDone = state.items[item.id]?.done || []
            const stepsCount = item.steps.length
            const doneStepsCount = itemDone.filter(Boolean).length
            const isPriority = state.priority === item.id
            const topicInfo = TOPICS.find((t) => t.id === item.topic)

            return (
              <Link
                key={item.id}
                to={`/items/detail?id=${item.id}`}
                className={`rowitem ${isPriority ? 'priority' : ''}`}
              >
                <div className="r-main">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap' }}>
                    <span className="r-title">{item.title}</span>
                    {isPriority && (
                      <span className="tag tag-amber">次にすること</span>
                    )}
                    {topicInfo && (
                      <span className="tag">{topicInfo.t}</span>
                    )}
                  </div>

                  <span className="r-sub">{item.desc}</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                    <StatusBadge state={itemState} />
                    <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                      手順：{doneStepsCount} / {stepsCount}
                    </span>
                  </div>
                </div>

                <Icon name="chev" stroke className="chev" />
              </Link>
            )
          })
        )}
      </div>

      {/* アンケート誘導 */}
      {!state.quizDone && (
        <div className="notice notice-amber" style={{ marginTop: '1.4rem' }}>
          <div className="n-ic">
            <Icon name="bulb" />
          </div>
          <div className="n-body">
            <p className="n-title">優先順位に迷ったら</p>
            <p className="n-sub">
              簡単な質問に答えると、あなたに最適な準備を自動で提案します。
            </p>
            <div style={{ marginTop: '.6rem' }}>
              <Link to="/survey" className="btn btn-amber btn-small">
                質問に答えてみる
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
