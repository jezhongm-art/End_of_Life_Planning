import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ITEMS, TOPICS } from './items'
import { StatusBadge, StatusPicker } from './StatusBadge'
import { Icon } from '../shared/components/SvgIcons'

export default function ItemDetail() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get('id') || 'money'

  const { state, updateItemStatus, toggleItemStep, setItemPriority } = useApp()

  const item = ITEMS.find((it) => it.id === itemId) || ITEMS[0]
  const currentItemState = state.items[item.id]?.state || 'notyet'
  const currentItemDone = state.items[item.id]?.done || []
  const isPriority = state.priority === item.id
  const topicInfo = TOPICS.find((t) => t.id === item.topic)

  const handleStateChange = (newSt) => {
    updateItemStatus(item.id, newSt)
  }

  const handleToggleStep = (index) => {
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
          {isPriority && <span className="tag tag-amber">次の一歩</span>}
        </div>

        <h2 className="card-title" style={{ fontSize: '1.28rem', marginTop: '.4rem' }}>
          {item.title}
        </h2>
        <p className="card-sub">{item.desc}</p>

        {/* 状態表示 & 優先度設定 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span style={{ fontSize: '.88rem', color: 'var(--muted)' }}>現在の状態:</span>
            <StatusBadge state={currentItemState} />
          </div>

          {!isPriority && currentItemState !== 'done' && (
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={handleSetPriority}
            >
              次の一歩に設定
            </button>
          )}
        </div>
      </section>

      {/* 完了時のごほうび案内 */}
      {currentItemState === 'done' && (
        <div className="celebrate">
          <p style={{ fontWeight: 800, color: 'var(--amber)' }}>
            この項目は完了しました。
          </p>
          <p className="note" style={{ color: 'var(--body)', marginTop: '.2rem' }}>
            登録した「やってみたいこと」で自分にごほうびを贈ったり、家族と話し合ってみましょう。
          </p>
          <div style={{ marginTop: '.6rem' }}>
            <Link to="/wishes" className="btn btn-amber btn-small">
              やってみたいことを見る
            </Link>
          </div>
        </div>
      )}

      {/* 状態変更ピッカー */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title">状態を変更する</h3>
        <p className="card-sub">ご自身の現在の進行に合わせて選んでください。</p>
        <StatusPicker current={currentItemState} onChange={handleStateChange} />
      </section>

      {/* 準備手順チェックリスト */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title">具体的な準備手順</h3>
        <p className="card-sub">
          チェックを入れると進行状況が記録されます。
        </p>

        <div style={{ marginTop: '.6rem' }}>
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
                <span className="task-t">{step}</span>
              </label>
            )
          })}
        </div>
      </section>

      {/* 手続き・相談先ガイド */}
      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-title">手続きとポイント</h3>
        <p className="card-sub">{item.guide.lead}</p>

        <ul className="stepnum" style={{ marginTop: '.55rem' }}>
          {item.guide.points.map((pt, idx) => (
            <li key={idx}>{pt}</li>
          ))}
        </ul>

        <h4 className="sec-title" style={{ fontSize: '.98rem', marginTop: '1.2rem' }}>
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
      </section>

      {/* フッターリンク */}
      <div className="btn-row" style={{ marginTop: '1.2rem' }}>
        <Link to="/items" className="btn btn-ghost btn-block">
          一覧に戻る
        </Link>
      </div>
    </div>
  )
}
