import React from 'react'
import { STATE, STATE_ORDER } from './items'

export function StatusBadge({ state }) {
  const m = STATE[state] || STATE.unknown
  return (
    <span className={`st ${m.cls}`}>
      <span className="mk" aria-hidden="true">{m.mk}</span>
      {m.t}
    </span>
  )
}

export function StatusPicker({ current, onChange }) {
  return (
    <div className="statusgrid">
      {STATE_ORDER.map((k) => {
        const m = STATE[k]
        const isOn = current === k
        return (
          <button
            key={k}
            type="button"
            className={`stbtn ${m.btnCls} ${isOn ? 'on' : ''}`}
            onClick={() => onChange(k)}
          >
            <span className="mk" aria-hidden="true">{m.mk}</span>
            <div>
              <span className="sb-t">{m.t}</span>
              <span className="sb-s">{m.help}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
