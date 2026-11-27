import React, { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ITEMS } from './items'
import { Icon } from '../shared/components/SvgIcons'

export default function ItemDetail() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get('id') || ITEMS[0].id

  const { state, toggleItemStep } = useApp()
  const [lastCompletedStepIdx, setLastCompletedStepIdx] = useState(null)

  const item = ITEMS.find((it) => it.id === itemId) || ITEMS[0]
  const currentItemState = state.items[item.id]?.state || 'notyet'
  const currentItemDone = state.items[item.id]?.done || []
  const firstUncheckedIdx = item.steps.findIndex((_, idx) => !currentItemDone[idx])
  const isAllDone = currentItemState === 'done' || firstUncheckedIdx === -1
  const isFinalStep = firstUncheckedIdx === item.steps.length - 1

  const handleCompleteFirstStep = (index) => {
    const ok = toggleItemStep(item.id, index)
    if (ok) {
      setLastCompletedStepIdx(index)
    }
  }

  const handleUndoLastStep = () => {
    if (lastCompletedStepIdx === null) return
    const ok = toggleItemStep(item.id, lastCompletedStepIdx)
    if (ok) {
      setLastCompletedStepIdx(null)
    }
  }

  return (
    <div className="screen-anim">
      {/* 純粋に読みやすい見出しと1行説明 */}
      <div className="plain-head">
        <h2 className="plain-title">{item.title}</h2>
        <p className="plain-lead">{item.desc}</p>
      </div>

      {/* 誤操作時の取り消し導線（直前に手順を完了にした場合のみ表示） */}
      {lastCompletedStepIdx !== null && currentItemDone[lastCompletedStepIdx] && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '.6rem',
            padding: '.65rem .85rem',
            marginBottom: '.75rem',
            borderRadius: 'var(--radius-s)',
            background: 'var(--blue-tint)',
            border: '1.5px solid #c4ddf0',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--ink)' }}>
            手順 {lastCompletedStepIdx + 1} を完了にしました
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            style={{ minHeight: '2.2rem', padding: '0 .75rem', fontSize: '.84rem' }}
            onClick={handleUndoLastStep}
          >
            ひとつ前に戻す
          </button>
        </div>
      )}

      {/* 1画面1タスク：いまやる1手順だけを表示 */}
      {isAllDone ? (
        <section className="celebrate" aria-label="完了のお知らせ">
          <p style={{ fontWeight: 800, color: 'var(--brand-deep)', fontSize: '1.12rem' }}>
            この項目の手順はすべて終わりました。
          </p>
          <p className="plain-lead" style={{ marginTop: '.4rem' }}>
            お疲れさまでした。準備一覧にもどって次の項目へ進むか、やってみたいことを眺めましょう。
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            <Link to="/items" className="btn btn-primary btn-block">
              準備一覧にもどる
            </Link>
            <Link to="/wishes" className="btn btn-amber btn-block">
              やってみたいことを見る
            </Link>
          </div>
        </section>
      ) : (
        <section className="hero" aria-label="いまやること" style={{ marginTop: '.4rem' }}>
          <div className="h-eyebrow">
            <Icon name="star" style={{ width: '1rem', height: '1rem' }} />
            いまやること（手順 {firstUncheckedIdx + 1} / {item.steps.length}）
          </div>

          <h3 className="h-title" style={{ fontSize: '1.25rem', marginTop: '.75rem' }}>
            {item.steps[firstUncheckedIdx]}
          </h3>

          <p className="h-reason" style={{ marginTop: '.7rem' }}>
            {item.guide.lead}
          </p>

          <div style={{ marginTop: '1.05rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => handleCompleteFirstStep(firstUncheckedIdx)}
            >
              {isFinalStep ? 'できた（この項目を完了する）' : 'できた（次の手順へ進む）'}
            </button>
          </div>
        </section>
      )}

      {/* 詳しい手順・やり直し・相談先は専用子画面へ分離 */}
      <div style={{ marginTop: '1.1rem' }}>
        <Link
          to={`/items/info?id=${item.id}`}
          className="btn btn-ghost btn-block"
        >
          くわしい手順・やり直し・相談先を見る
        </Link>
      </div>
    </div>
  )
}
