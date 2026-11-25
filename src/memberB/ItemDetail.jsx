import React, { useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ITEMS, TOPICS, STATE } from './items'
import { StatusBadge, StatusPicker } from './StatusBadge'
import { Icon } from '../shared/components/SvgIcons'
import { AccessibleDialog } from '../shared/components/AccessibleDialog'

export default function ItemDetail() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get('id') || ITEMS[0].id

  const { state, updateItemStatus, toggleItemStep, setItemPriority } = useApp()
  const [lastCompletedStepIdx, setLastCompletedStepIdx] = useState(null)
  const [pendingStatusSync, setPendingStatusSync] = useState(null) // { targetState, title, description, confirmLabel }
  const syncCancelRef = useRef(null)

  const item = ITEMS.find((it) => it.id === itemId) || ITEMS[0]
  const currentItemState = state.items[item.id]?.state || 'notyet'
  const currentItemDone = state.items[item.id]?.done || []
  const doneStepsCount = currentItemDone.filter(Boolean).length
  const firstUncheckedIdx = item.steps.findIndex((_, idx) => !currentItemDone[idx])
  const isPriority = state.priority === item.id
  const topicInfo = TOPICS.find((t) => t.id === item.topic)

  const handleStateChange = (newSt) => {
    if (newSt === currentItemState) return

    if (newSt === 'done' && doneStepsCount < item.steps.length) {
      const remaining = item.steps.length - doneStepsCount
      setPendingStatusSync({
        targetState: 'done',
        title: 'まだ終わっていない手順があります',
        description: `全${item.steps.length}件の手順のうち、${remaining}件にまだチェックが入っていません。すべての手順も「完了」に揃えて切り替えますか？`,
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

    setLastCompletedStepIdx(null)
    updateItemStatus(item.id, newSt, { syncSteps: true })
  }

  const handleConfirmStatusSync = () => {
    if (!pendingStatusSync) return
    setLastCompletedStepIdx(null)
    updateItemStatus(item.id, pendingStatusSync.targetState, { syncSteps: true })
    setPendingStatusSync(null)
  }

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

  const handleToggleStep = (index) => {
    setLastCompletedStepIdx(null)
    toggleItemStep(item.id, index)
  }

  const handleSetPriority = () => {
    setItemPriority(item.id)
  }

  return (
    <div className="screen-anim">
      {/* 項目ヘッダー情報 */}
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
          {topicInfo && <span className="tag">{topicInfo.t}</span>}
          {isPriority && <span className="tag tag-amber">次にすること</span>}
        </div>

        <h2 className="card-title" style={{ fontSize: '1.24rem', marginTop: '.4rem' }}>
          {item.title}
        </h2>
        <p className="card-sub">{item.desc}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.85rem', flexWrap: 'wrap', gap: '.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.88rem', color: 'var(--muted)' }}>現在の状態:</span>
            <StatusBadge state={currentItemState} />
            <span style={{ fontSize: '.84rem', color: 'var(--muted)', fontWeight: 700 }}>
              （手順 {doneStepsCount} / {item.steps.length}）
            </span>
          </div>

          {!isPriority && currentItemState !== 'done' && (
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={handleSetPriority}
            >
              次にすることに設定
            </button>
          )}
        </div>
      </section>

      {/* 誤操作時の取り消し導線（直前に手順を完了にした場合のみ表示） */}
      {lastCompletedStepIdx !== null && currentItemDone[lastCompletedStepIdx] && (
        <div className="notice notice-blue" style={{ marginTop: '.9rem' }}>
          <div className="n-body">
            <p className="n-title" style={{ fontSize: '.96rem' }}>
              手順 {lastCompletedStepIdx + 1} を完了にしました（取り消しできます）
            </p>
            <div style={{ marginTop: '.45rem' }}>
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={handleUndoLastStep}
              >
                間違えたので元に戻す
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 最初の一歩（または完了祝い） */}
      {currentItemState === 'done' || firstUncheckedIdx === -1 ? (
        <div className="celebrate" style={{ marginTop: '1rem' }}>
          <p style={{ fontWeight: 800, color: 'var(--brand-deep)', fontSize: '1.05rem' }}>
            この項目の手順が終わりました。
          </p>
          <p className="note" style={{ color: 'var(--body)', marginTop: '.25rem' }}>
            登録した「やってみたいこと」で自分にごほうびを贈ったり、ご家族と話してみましょう。
          </p>
          <div style={{ marginTop: '.7rem' }}>
            <Link to="/wishes" className="btn btn-amber btn-small">
              やってみたいことを見る
            </Link>
          </div>
        </div>
      ) : (
        <section className="hero" style={{ marginTop: '1rem' }} aria-label="最初の一歩">
          <div className="h-eyebrow">
            <Icon name="star" style={{ width: '1rem', height: '1rem' }} />
            まずやること（手順 {firstUncheckedIdx + 1} / {item.steps.length}）
          </div>
          <h3 className="h-title" style={{ fontSize: '1.2rem' }}>
            {item.steps[firstUncheckedIdx]}
          </h3>
          <p className="h-reason">
            {item.guide.lead}
          </p>
          <div className="btn-row" style={{ marginTop: '.9rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => handleCompleteFirstStep(firstUncheckedIdx)}
            >
              この手順を完了にする
            </button>
          </div>
        </section>
      )}

      {/* 詳しい情報（必要な人だけ開くアコーディオン） */}
      <details className="acc">
        <summary>
          すべての準備手順を見る（{doneStepsCount} / {item.steps.length} 完了）
        </summary>
        <div className="acc-body">
          <p className="card-sub">
            押すと進み具合が自動で記録されます（もう一度押すとチェックを外して状態も戻ります）。
          </p>
          <div style={{ marginTop: '.5rem' }}>
            {item.steps.map((step, idx) => {
              const isChecked = !!currentItemDone[idx]
              return (
                <label
                  key={idx}
                  className={`task ${isChecked ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleStep(idx)}
                  />
                  <span className="task-t">
                    <strong>{idx + 1}. </strong>{step}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      </details>

      <details className="acc">
        <summary>
          状態を手動で切り替える（現在：{STATE[currentItemState]?.t}）
        </summary>
        <div className="acc-body">
          <p className="card-sub">今の進み具合に合わせてお選びください（手順チェックと連動します）。</p>
          <StatusPicker current={currentItemState} onChange={handleStateChange} />
        </div>
      </details>

      <details className="acc">
        <summary>
          注意点・詳しいポイントと公的相談先（{item.guide.links.length}件）
        </summary>
        <div className="acc-body">
          <h3 className="card-title" style={{ fontSize: '1rem' }}>進め方のポイント・注意点</h3>
          <ul className="stepnum" style={{ marginTop: '.5rem' }}>
            {item.guide.points.map((pt, idx) => (
              <li key={idx}>{pt}</li>
            ))}
          </ul>

          <h4 className="sec-title" style={{ fontSize: '.98rem', marginTop: '1.1rem' }}>
            公的機関・公式相談先
          </h4>
          <div style={{ marginTop: '.4rem' }}>
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
        </div>
      </details>

      {/* フッターリンク */}
      <div className="btn-row" style={{ marginTop: '1.2rem' }}>
        <Link to="/items" className="btn btn-ghost btn-block">
          一覧にもどる
        </Link>
      </div>

      {/* 手動状態切替とチェックリストの同期確認ダイアログ */}
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
