import React, { useState } from 'react'
import { useApp } from '../shared/context/AppContext'
import { MEMO_QUESTIONS } from '../shared/wishes'
import { Icon } from '../shared/components/SvgIcons'

export default function Memories() {
  const { state, addMemo, deleteMemo } = useApp()

  const [activeTab, setActiveTab] = useState('write') // write | album
  const [selectedCatIdx, setSelectedCatIdx] = useState(0)
  const [titleInput, setTitleInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const activeQuestion = MEMO_QUESTIONS[selectedCatIdx]

  const handleSelectCat = (idx) => {
    setSelectedCatIdx(idx)
    setTitleInput(MEMO_QUESTIONS[idx].q)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!textInput.trim()) return
    addMemo({
      cat: activeQuestion.cat,
      title: titleInput || activeQuestion.q,
      text: textInput.trim(),
      tag: tagInput.trim()
    })
    setTextInput('')
    setTitleInput('')
    setTagInput('')
    setActiveTab('album')
  }

  const categoryColorClass = (cat) => {
    if (cat.includes('子ども')) return 'cl-child'
    if (cat.includes('仕事')) return 'cl-work'
    if (cat.includes('家族')) return 'cl-family'
    return 'cl-hope'
  }

  return (
    <div className="screen-anim">
      {/* 画面説明 */}
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <h2 className="card-title">希望・思い出の記録</h2>
          <span className="tag tag-plus">+α機能</span>
        </div>
        <p className="card-sub">
          これまでの人生の大切な思い出や、家族に伝えておきたい気持ちを文章として残せます。
        </p>

        {/* タブ切り替え */}
        <div className="segtabs" style={{ marginTop: '.9rem' }}>
          <button
            type="button"
            className={`segtab ${activeTab === 'write' ? 'on' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            思い出を書く
          </button>
          <button
            type="button"
            className={`segtab ${activeTab === 'album' ? 'on' : ''}`}
            onClick={() => setActiveTab('album')}
          >
            思い出アルバム（{state.memos.length}件）
          </button>
        </div>
      </section>

      {activeTab === 'write' ? (
        <>
          {/* テーマ選択 */}
          <section className="card" style={{ marginTop: '1rem' }}>
            <h3 className="card-title" style={{ fontSize: '1rem' }}>テーマを選ぶ</h3>
            <p className="card-sub">書きやすいテーマをタップしてください。</p>

            <div className="chips">
              {MEMO_QUESTIONS.map((mq, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`chip ${selectedCatIdx === idx ? 'chip-plus on' : ''}`}
                  onClick={() => handleSelectCat(idx)}
                >
                  {mq.cat}
                </button>
              ))}
            </div>

            <div className="notice notice-plus" style={{ marginTop: '.7rem' }}>
              <div className="n-ic">
                <Icon name="pencil" />
              </div>
              <div className="n-body">
                <p className="n-title">{activeQuestion.q}</p>
                <p className="n-sub">{activeQuestion.help}</p>
              </div>
            </div>
          </section>

          {/* 記録フォーム */}
          <section className="card" style={{ marginTop: '1rem' }}>
            <form onSubmit={handleSave}>
              <div>
                <label className="card-sub" style={{ fontWeight: 700 }}>タイトル</label>
                <input
                  type="text"
                  className="input"
                  style={{ marginTop: '.3rem' }}
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder={activeQuestion.q}
                />
              </div>

              <div style={{ marginTop: '.8rem' }}>
                <label className="card-sub" style={{ fontWeight: 700 }}>本文・思い出の文章</label>
                <div className="field" style={{ marginTop: '.3rem' }}>
                  <textarea
                    rows={5}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="思い出したこと、伝えたい気持ちをご自身の言葉で書いてみましょう。"
                  />
                  <span className="count">{textInput.length} 文字</span>
                </div>
              </div>

              <div style={{ marginTop: '.8rem' }}>
                <label className="card-sub" style={{ fontWeight: 700 }}>タグ（任意）</label>
                <input
                  type="text"
                  className="input"
                  style={{ marginTop: '.3rem' }}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="例）家族へのメッセージ、宝物"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{ marginTop: '1.1rem' }}
                disabled={!textInput.trim()}
              >
                思い出を保存する
              </button>
            </form>
          </section>
        </>
      ) : (
        /* アルバム一覧 */
        <div style={{ marginTop: '1rem' }}>
          {state.memos.length === 0 ? (
            <div className="empty">まだ保存された思い出はありません。「思い出を書く」から記録してみましょう。</div>
          ) : (
            state.memos.map((m) => {
              const isExpanded = expandedId === m.id
              return (
                <div
                  key={m.id}
                  className={`mcard ${categoryColorClass(m.cat)} ${isExpanded ? 'mopen' : ''}`}
                >
                  <button
                    type="button"
                    className="mcard-btn"
                    onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  >
                    <span className="m-title">{m.title}</span>
                    <p className="m-text">{m.text}</p>
                    <div className="m-meta">
                      <span>{m.date}</span>
                      <span className="tag">{m.cat}</span>
                      {m.tag && <span className="tag tag-brand">{m.tag}</span>}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: '.8rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => deleteMemo(m.id)}
                      >
                        削除する
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
