import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { TOPICS } from '../data/items'
import { Icon } from '../components/SvgIcons'

const TOPIC_META = {
  money:   { icon: 'clip',   color: 't-teal',  shortDesc: '通帳・書類・保険' },
  medical: { icon: 'heart',  color: 't-rose',  shortDesc: '治療や介護の希望' },
  house:   { icon: 'home',   color: 't-blue',  shortDesc: '権利書・賃貸の管理' },
  grave:   { icon: 'book',   color: 't-slate', shortDesc: 'お墓や葬儀の相談' },
  family:  { icon: 'people', color: 't-amber', shortDesc: '終活ノート・話し合い' },
  pet:     { icon: 'paw',    color: 't-plus',  shortDesc: '引き継ぎ先・お世話の希望' }
}

export default function SurveyTopics() {
  const navigate = useNavigate()
  const { state, updateTopics, resetQuiz } = useApp()

  const [selected, setSelected] = useState(() => ({
    ...state.topics
  }))

  const selectedCount = Object.values(selected).filter(Boolean).length
  const isAllSelected = TOPICS.length > 0 && selectedCount === TOPICS.length

  const toggleTopic = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const toggleAll = () => {
    if (isAllSelected) {
      // 全て解除
      const none = {}
      TOPICS.forEach((t) => { none[t.id] = false })
      setSelected(none)
    } else {
      // 全て選択
      const all = {}
      TOPICS.forEach((t) => { all[t.id] = true })
      setSelected(all)
    }
  }

  const handleStart = () => {
    const hasAny = Object.values(selected).some(Boolean)
    const finalTopics = hasAny ? selected : { money: true, medical: true, house: true, grave: true, family: true, pet: true }
    updateTopics(finalTopics)
    navigate('/survey/q')
  }

  const handleResetAndStart = () => {
    resetQuiz()
    handleStart()
  }

  return (
    <div className="screen-anim">
      {/* 導入バナー（コンパクト化） */}
      <div className="notice notice-teal" style={{ padding: '.75rem .95rem' }}>
        <div className="n-ic" style={{ width: '2.2rem', height: '2.2rem' }}>
          <Icon name="bulb" style={{ width: '1.2rem', height: '1.2rem' }} />
        </div>
        <div className="n-body">
          <h2 className="n-title" style={{ fontSize: '1.02rem' }}>関心のある分野を選んでください</h2>
          <p className="n-sub" style={{ fontSize: '.86rem', marginTop: '.15rem' }}>
            気になる項目をタップ（複数選択可）。選んだ分野の質問を順にお出しします。
          </p>
        </div>
      </div>

      {/* 6分野のメニュータイル（2列×3行） */}
      <div className="tiles" style={{ marginTop: '.85rem' }}>
        {TOPICS.map((tp) => {
          const isChecked = !!selected[tp.id]
          const meta = TOPIC_META[tp.id] || { icon: 'clip', color: 't-teal', shortDesc: tp.d }
          return (
            <button
              key={tp.id}
              type="button"
              className={`tile ${isChecked ? 'on' : ''}`}
              onClick={() => toggleTopic(tp.id)}
              style={{ width: '100%' }}
            >
              <span className="tile-check" aria-hidden="true">
                {isChecked ? '✓' : ''}
              </span>

              <div className={`t-ic ${meta.color}`}>
                <Icon name={meta.icon} />
              </div>

              <span className="t-title">{tp.t}</span>
              <span className="t-desc">{meta.shortDesc}</span>
            </button>
          )
        })}
      </div>

      {/* 全選択 / 全解除の横バー（質問に答えるボタンの上） */}
      <div style={{ marginTop: '1rem' }}>
        <button
          type="button"
          className={`btn btn-block ${isAllSelected ? 'btn-sub' : 'btn-ghost'}`}
          style={{
            minHeight: '2.85rem',
            fontSize: '.92rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem'
          }}
          onClick={toggleAll}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
            <span
              className="mk"
              style={{
                width: '1.25rem',
                height: '1.25rem',
                fontSize: '.76rem',
                background: isAllSelected ? 'var(--brand)' : '#fff',
                color: isAllSelected ? '#fff' : 'inherit'
              }}
            >
              {isAllSelected ? '✓' : ''}
            </span>
            <strong>
              {isAllSelected ? 'すべての分野を選択中（全選択）' : 'すべての分野をまとめて選択する（全選択）'}
            </strong>
          </span>
          <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
            {isAllSelected ? 'タップで解除' : '迷ったら全体確認'}
          </span>
        </button>
      </div>

      {/* 質問に答えるボタン */}
      <div className="btn-row" style={{ marginTop: '.65rem' }}>
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={selectedCount === 0}
          onClick={handleStart}
        >
          {selectedCount === 0
            ? '分野を1つ以上選んでください'
            : `質問に答える（${selectedCount}分野を選択中）`}
        </button>
      </div>

      {state.quizDone && (
        <div style={{ textAlign: 'center', marginTop: '.85rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={handleResetAndStart}
          >
            前回の回答をリセットして最初からやり直す
          </button>
        </div>
      )}
    </div>
  )
}
