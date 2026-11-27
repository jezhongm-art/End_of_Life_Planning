import React, { useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ITEMS, TOPICS, STATE } from './items'
import { StatusBadge, StatusPicker } from './StatusBadge'
import { Icon } from '../shared/components/SvgIcons'
import { AccessibleDialog } from '../shared/components/AccessibleDialog'

export default function ItemInfo() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get('id') || ITEMS[0].id

  const { state, updateItemStatus, toggleItemStep, setItemPriority } = useApp()
  const [pendingStatusSync, setPendingStatusSync] = useState(null)
  const syncCancelRef = useRef(null)

  const item = ITEMS.find((it) => it.id === itemId) || ITEMS[0]
  const currentItemState = state.items[item.id]?.state || 'notyet'
  const currentItemDone = state.items[item.id]?.done || []
  const doneStepsCount = currentItemDone.filter(Boolean).length
  const isPriority = state.priority === item.id
  const topicInfo = TOPICS.find((t) => t.id === item.topic)

  const handleStateChange = (newSt) => {
    if (newSt === currentItemState) return

    if (newSt === 'done' && doneStepsCount < item.steps.length) {
      const remaining = item.steps.length - doneStepsCount
      setPendingStatusSync({
        targetState: 'done',
        title: 'まだ終わっていない手順があります',
        description: `全${item.steps.length}件の手順のうち、${remaining}件が未チェックです。すべての手順も「完了」に揃えて切り替えますか？`,
        confirmLabel: 'すべての手順も完了にする'
      })
      return
    }

    if (newSt === 'notyet' && doneStepsCount > 0) {
      setPendingStatusSync({
        targetState: 'notyet',
        title: 'チェック済みの手順を未着手に戻しますか？',
        description: `チェックが入っている${doneStepsCount}件の手順をすべて外して、「未着手」に揃えます。よろしいですか？`,
        confirmLabel: 'チェックを外して未着手にする'
      })
      return
    }

    if (newSt === 'doing' && doneStepsCount === item.steps.length) {
      setPendingStatusSync({
        targetState: 'doing',
        title: 'すべての手順が完了しています',
        description: '「準備中」に切り替えるため、最後の手順のチェックを外して状態を揃えます。よろしいですか？',
        confirmLabel: '最後の手順を外して準備中にする'
      })
      return
    }

    updateItemStatus(item.id, newSt, { syncSteps: true })
  }

  const handleConfirmStatusSync = () => {
    if (!pendingStatusSync) return
    updateItemStatus(item.id, pendingStatusSync.targetState, { syncSteps: true })
    setPendingStatusSync(null)
  }

  return (
    <div className="screen-anim">
      <div className="plain-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.35rem' }}>
          {topicInfo && <span className="tag">{topicInfo.t}</span>}
          <StatusBadge state={currentItemState} />
        </div>
        <h2 className="plain-title">{item.title}</h2>
      </div>

      {!isPriority && currentItemState !== 'done' && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className="btn btn-sub btn-block"
            onClick={() => setItemPriority(item.id)}
          >
            この項目をホームの「次にすること」にする
          </button>
        </div>
      )}

      {/* すべての手順チェックリスト */}
      <section className="card">
        <h3 className="card-title">すべての準備手順（{doneStepsCount} / {item.steps.length}）</h3>
        <p className="card-sub">押すと完了・やり直しを切り替えられます。</p>
        <div style={{ marginTop: '.55rem' }}>
          {item.steps.map((step, idx) => {
            const isChecked = !!currentItemDone[idx]
            return (
              <label key={idx} className={`task ${isChecked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItemStep(item.id, idx)}
                />
                <span className="task-t">
                  <strong>{idx + 1}. </strong>{step}
                </span>
              </label>
            )
          })}
        </div>
      </section>

      {/* 注意点・ポイント */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title">進め方のポイント・注意点</h3>
        <ul className="stepnum" style={{ marginTop: '.5rem' }}>
          {item.guide.points.map((pt, idx) => (
            <li key={idx}>{pt}</li>
          ))}
        </ul>
      </section>

      {/* 公的相談先 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title">公的機関・公式相談先</h3>
        <div style={{ marginTop: '.45rem' }}>
          {item.guide.links.map((ln, idx) => (
            <a
              key={idx}
              href={ln.u}
              target="_blank"
              rel="noopener noreferrer"
              className="linkrow"
            >
              <div>
                <span className="lr-t">{ln.t}</span>
                <span className="lr-s">{ln.s}</span>
              </div>
              <Icon name="chev" stroke className="chev" />
            </a>
          ))}
        </div>
      </section>

      {/* 状態の手動変更 */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title">状態を手動で切り替える（現在：{STATE[currentItemState]?.t}）</h3>
        <p className="card-sub">手順のチェック状況と合わせて切り替えます。</p>
        <StatusPicker current={currentItemState} onChange={handleStateChange} />
      </section>

      <div style={{ marginTop: '1.15rem' }}>
        <Link to={`/items/detail?id=${item.id}`} className="btn btn-primary btn-block">
          1手順ずつの画面にもどる
        </Link>
      </div>

      <AccessibleDialog
        isOpen={!!pendingStatusSync}
        onClose={() => setPendingStatusSync(null)}
        title={pendingStatusSync?.title || ''}
        description={pendingStatusSync?.description}
        initialFocusRef={syncCancelRef}
      >
        <div className="btn-row" style={{ marginTop: '1.2rem' }}>
          <button
            ref={syncCancelRef}
            type="button"
            className="btn btn-ghost"
            onClick={() => setPendingStatusSync(null)}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirmStatusSync}
          >
            {pendingStatusSync?.confirmLabel || '切り替える'}
          </button>
        </div>
      </AccessibleDialog>
    </div>
  )
}
