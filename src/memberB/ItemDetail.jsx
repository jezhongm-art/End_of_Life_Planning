import React, { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ITEMS, TOPICS, STATE } from './items'
import { StatusBadge, StatusPicker } from './StatusBadge'
import { Icon } from '../shared/components/SvgIcons'

export default function ItemDetail() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get('id') || ITEMS[0].id

  const { state, updateItemStatus, toggleItemStep, setItemPriority, toast } = useApp()
  const [lastCompletedStepIdx, setLastCompletedStepIdx] = useState(null)

  const item = ITEMS.find((it) => it.id === itemId) || ITEMS[0]
  const currentItemState = state.items[item.id]?.state || 'notyet'
  const currentItemDone = state.items[item.id]?.done || []
  const doneStepsCount = currentItemDone.filter(Boolean).length
  const firstUncheckedIdx = item.steps.findIndex((_, idx) => !currentItemDone[idx])
  const isPriority = state.priority === item.id
  const topicInfo = TOPICS.find((t) => t.id === item.topic)

  const handleStateChange = (newSt) => {
    setLastCompletedStepIdx(null)
    updateItemStatus(item.id, newSt)
  }

  const handleCompleteFirstStep = (index) => {
    const ok = toggleItemStep(item.id, index)
    if (ok) {
      setLastCompletedStepIdx(index)
      toast(`手順 ${index + 1} を完了にしました`)
    }
  }

  const handleUndoLastStep = () => {
    if (lastCompletedStepIdx === null) return
    const ok = toggleItemStep(item.id, lastCompletedStepIdx)
    if (ok) {
      toast(`手順 ${lastCompletedStepIdx + 1} を完了前に戻しました`)
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
        <div className="notice notice-blue" style={{ marginTop: '.9rem' }} role="status">
          <div className="n-body">
            <p className="n-title" style={{ fontSize: '.96rem' }}>
              手順 {lastCompletedStepIdx + 1} を完了にしました
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
            押すと進み具合が自動で記録されます（もう一度押すと元に戻せます）。
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
          <p className="card-sub">今の進み具合に合わせてお選びください。</p>
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
    </div>
  )
}
