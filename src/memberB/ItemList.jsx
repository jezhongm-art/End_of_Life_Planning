import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ITEMS } from './items'
import { StatusBadge } from './StatusBadge'
import { ProgressBar } from '../shared/components/ProgressBar'
import { Icon } from '../shared/components/SvgIcons'

const PAGE_SIZE = 3

const FILTER_TABS = [
  { id: 'doing', label: (remaining) => `これから（${remaining}）` },
  { id: 'done', label: (_, done) => `完了済み（${done}）` }
]

export default function ItemList() {
  const { state, calcProgress } = useApp()
  const progress = calcProgress()
  const remainingCount = progress.total - progress.doneCount

  const [filter, setFilter] = useState('doing') // doing | done
  const [page, setPage] = useState(0)

  const filteredItems = ITEMS.filter((item) => {
    const itemState = state.items[item.id]?.state || 'notyet'
    return filter === 'done' ? itemState === 'done' : itemState !== 'done'
  })

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visibleItems = filteredItems.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  useEffect(() => {
    setPage(0)
  }, [filter])

  const handleTabKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const next = FILTER_TABS[(idx + 1) % FILTER_TABS.length]
      setFilter(next.id)
      document.getElementById(`item-filter-tab-${next.id}`)?.focus()
    }
  }

  return (
    <div className="screen-anim">
      {/* シンプルな進み具合（重複タイトルカードなし） */}
      <div className="plain-head">
        <ProgressBar
          pct={progress.pct}
          label={`全${ITEMS.length}項目のうち ${progress.doneCount}項目完了`}
        />
      </div>

      {/* 2択フィルタータブ */}
      <div
        className="segtabs"
        style={{ marginTop: '.75rem' }}
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
              {tab.label(remainingCount, progress.doneCount)}
            </button>
          )
        })}
      </div>

      {/* 1回に3件ずつ・2要素（項目名＋状態）のみ表示 */}
      <div role="tabpanel" aria-labelledby={`item-filter-tab-${filter}`}>
        {visibleItems.length === 0 ? (
          <div className="empty">
            {filter === 'done'
              ? 'まだ完了した項目はありません。'
              : 'すべての項目が完了しています。'}
          </div>
        ) : (
          visibleItems.map((item) => {
            const itemState = state.items[item.id]?.state || 'notyet'
            const isPriority = state.priority === item.id

            return (
              <Link
                key={item.id}
                to={`/items/detail?id=${item.id}`}
                className={`rowitem rowitem-compact ${isPriority && itemState !== 'done' ? 'priority' : ''}`}
              >
                <div className="r-main">
                  <span className="r-title">{item.title}</span>
                  <StatusBadge state={itemState} />
                </div>

                <Icon name="chev" stroke className="chev" />
              </Link>
            )
          })
        )}
      </div>

      {/* ページ送り（3件ずつ表示して視線と操作を制限） */}
      {totalPages > 1 && (
        <div className="pager" aria-label="ページの切り替え">
          <button
            type="button"
            className="btn btn-ghost btn-small"
            disabled={safePage === 0}
            onClick={() => {
              setPage((p) => Math.max(0, p - 1))
              window.scrollTo(0, 0)
            }}
          >
            まえの項目
          </button>

          <span className="pager-info">
            {safePage + 1} / {totalPages}
          </span>

          <button
            type="button"
            className="btn btn-primary btn-small"
            disabled={safePage + 1 >= totalPages}
            onClick={() => {
              setPage((p) => Math.min(totalPages - 1, p + 1))
              window.scrollTo(0, 0)
            }}
          >
            つぎの項目
          </button>
        </div>
      )}

      {/* アンケート未完了時のシンプルな誘導リンク */}
      {!state.quizDone && (
        <div style={{ marginTop: '1.15rem', textAlign: 'center' }}>
          <Link to="/survey" className="btn btn-sub btn-block">
            迷ったら：質問でおすすめを探す
          </Link>
        </div>
      )}
    </div>
  )
}
