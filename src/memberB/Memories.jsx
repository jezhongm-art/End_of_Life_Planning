import React, { useState } from 'react'
import { useApp } from '../shared/context/AppContext'
import { MEMO_QUESTIONS } from '../shared/wishes'
import { Icon } from '../shared/components/SvgIcons'
import { compressImage } from '../shared/utils/imageCompressor'

export default function Memories() {
  const { state, addMemo, updateMemo, deleteMemo, toast } = useApp()

  const [activeTab, setActiveTab] = useState('write') // write | album
  const [selectedCatIdx, setSelectedCatIdx] = useState(0)
  const [titleInput, setTitleInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [imageInput, setImageInput] = useState(null)
  const [editingMemoId, setEditingMemoId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const activeQuestion = MEMO_QUESTIONS[selectedCatIdx]

  const handleSelectCat = (idx) => {
    setSelectedCatIdx(idx)
    if (!editingMemoId) {
      setTitleInput(MEMO_QUESTIONS[idx].q)
    }
  }

  // 写真選択・圧縮処理
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      toast('写真を最適化しています...')
      const compressed = await compressImage(file)
      setImageInput(compressed)
      toast('写真を追加しました')
    } catch (err) {
      toast('写真の読み込みに失敗しました')
      console.error(err)
    }
    e.target.value = ''
  }

  const handleRemoveImage = () => {
    setImageInput(null)
    toast('写真を外しました')
  }

  // 編集開始
  const handleStartEdit = (memo) => {
    setEditingMemoId(memo.id)
    setTitleInput(memo.title)
    setTextInput(memo.text)
    setTagInput(memo.tag || '')
    setImageInput(memo.image || null)

    const idx = MEMO_QUESTIONS.findIndex((mq) => mq.cat === memo.cat)
    if (idx >= 0) setSelectedCatIdx(idx)

    setActiveTab('write')
    window.scrollTo(0, 0)
  }

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingMemoId(null)
    setTitleInput('')
    setTextInput('')
    setTagInput('')
    setImageInput(null)
    setActiveTab('album')
  }

  // 保存（新規または更新）
  const handleSave = (e) => {
    e.preventDefault()
    if (!textInput.trim()) return

    const title = titleInput.trim() || activeQuestion.q
    const text = textInput.trim()
    const tag = tagInput.trim()
    const cat = activeQuestion.cat

    if (editingMemoId) {
      updateMemo(editingMemoId, {
        title,
        text,
        tag,
        image: imageInput,
        cat
      })
      setEditingMemoId(null)
    } else {
      addMemo({
        cat,
        title,
        text,
        tag,
        image: imageInput
      })
    }

    setTextInput('')
    setTitleInput('')
    setTagInput('')
    setImageInput(null)
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
        <h2 className="card-title">希望・思い出の記録</h2>
        <p className="card-sub">
          これまでの人生の大切な思い出や、ご家族へ残したい写真・メッセージを手帳のように記録できます。
        </p>

        {/* タブ切り替え */}
        <div className="segtabs" style={{ marginTop: '.9rem' }}>
          <button
            type="button"
            className={`segtab ${activeTab === 'write' ? 'on' : ''}`}
            onClick={() => {
              if (activeTab !== 'write') {
                if (!editingMemoId) {
                  setTitleInput(activeQuestion.q)
                }
                setActiveTab('write')
              }
            }}
          >
            {editingMemoId ? '思い出を編集する' : '思い出を書く'}
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

              {/* 写真添付エリア */}
              <div style={{ marginTop: '.8rem' }}>
                <label className="card-sub" style={{ fontWeight: 700 }}>思い出の写真（任意・1枚）</label>
                {imageInput ? (
                  <div className="img-preview-wrap">
                    <img src={imageInput} alt="思い出の写真プレビュー" />
                    <button
                      type="button"
                      className="img-remove-btn"
                      onClick={handleRemoveImage}
                      aria-label="写真を外す"
                    >
                      ✕ 写真を外す
                    </button>
                  </div>
                ) : (
                  <label className="img-upload-zone" style={{ marginTop: '.3rem' }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <Icon name="clip" style={{ width: '1.4rem', height: '1.4rem', color: 'var(--brand)' }} />
                    <span style={{ fontWeight: 700, fontSize: '.95rem' }}>写真を追加する</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                      カメラで撮影するか、保存されている写真を選べます
                    </span>
                  </label>
                )}
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

              <div className="btn-row" style={{ marginTop: '1.2rem' }}>
                {editingMemoId && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleCancelEdit}
                  >
                    編集をキャンセル
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={!textInput.trim()}
                >
                  {editingMemoId ? '変更を保存する' : '思い出を保存する'}
                </button>
              </div>
            </form>
          </section>
        </>
      ) : (
        /* アルバム一覧 */
        <div style={{ marginTop: '1rem' }}>
          {state.memos.length === 0 ? (
            <div className="empty">
              まだ保存された思い出はありません。<br />
              「思い出を書く」から大切な記憶や写真を記録してみましょう。
            </div>
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
                    <div className="mcard-layout">
                      <div className="mcard-content">
                        <span className="m-title">{m.title}</span>
                        <p className="m-text">{m.text}</p>
                      </div>
                      {m.image && !isExpanded && (
                        <img
                          src={m.image}
                          alt={m.title}
                          className="m-thumb"
                        />
                      )}
                    </div>

                    {/* 展開時の写真大サイズ表示 */}
                    {m.image && isExpanded && (
                      <img
                        src={m.image}
                        alt={m.title}
                        className="m-full-img"
                      />
                    )}

                    <div className="m-meta">
                      <span>{m.date}</span>
                      <span className="tag">{m.cat}</span>
                      {m.tag && <span className="tag tag-brand">{m.tag}</span>}
                      {m.image && <span className="tag tag-amber">写真あり</span>}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '.6rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        onClick={() => handleStartEdit(m)}
                      >
                        編集する
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => {
                          if (window.confirm('この思い出を削除してもよろしいですか？')) {
                            deleteMemo(m.id)
                          }
                        }}
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
