import React from 'react'

export function ProgressBar({ pct = 0, label, showPct = true }) {
  const safePct = Math.min(100, Math.max(0, pct))
  return (
    <div>
      {(label || showPct) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          {label && <span className="card-sub" style={{ marginTop: 0 }}>{label}</span>}
          {showPct && <span className="big-num">{safePct}%</span>}
        </div>
      )}
      <div className="bar">
        <i style={{ width: `${safePct}%` }} />
      </div>
    </div>
  )
}

export function QuizProgressBar({ current, total, pct = 0 }) {
  const safePct = Math.min(100, Math.max(0, pct))
  return (
    <div style={{ margin: '.4rem 0 .8rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
        <span className="q-label">質問 {current} / {total}</span>
        <span className="q-label" style={{ fontWeight: 700 }}>進み具合 {safePct}%</span>
      </div>
      <div className="q-progress">
        <i style={{ width: `${safePct}%` }} />
      </div>
    </div>
  )
}
