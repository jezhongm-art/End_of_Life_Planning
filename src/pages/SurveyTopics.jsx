import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { TOPICS } from '../data/items'
import { Icon } from '../components/SvgIcons'

export default function SurveyTopics() {
  const navigate = useNavigate()
  const { state, updateTopics, resetQuiz } = useApp()

  const [selected, setSelected] = useState(() => ({
    ...state.topics
  }))

  const toggleTopic = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const selectAll = () => {
    const all = {}
    TOPICS.forEach((t) => { all[t.id] = true })
    setSelected(all)
  }

  const handleStart = () => {
    // 少なくとも1つ選択されているか確認
    const hasAny = Object.values(selected).some(Boolean)
    const finalTopics = hasAny ? selected : { money: true, medical: true, house: true, grave: true, family: true }
    updateTopics(finalTopics)
    navigate('/survey/q')
  }

  const handleResetAndStart = () => {
    resetQuiz()
    handleStart()
  }

  const hasAnySelected = Object.values(selected).some(Boolean)

  return (
    <div className="screen-anim">
      <div className="notice notice-teal">
        <div className="n-ic">
          <Icon name="bulb" />
        </div>
        <div className="n-body">
          <h2 className="n-title">関心のある分野を選んでください</h2>
          <p className="n-sub">
            選んだ分野についての質問を順番にお出しします。（複数選べます）
          </p>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button
          type="button"
          className="btn btn-sub btn-small btn-block"
          onClick={selectAll}
        >
          何から始めればよいか分からない（全体を確認する）
        </button>
      </div>

      <div style={{ marginTop: '.8rem' }}>
        {TOPICS.map((tp) => {
          const isChecked = !!selected[tp.id]
          return (
            <div
              key={tp.id}
              className={`opt ${isChecked ? 'on' : ''}`}
              onClick={() => toggleTopic(tp.id)}
            >
              <span className="mk" aria-hidden="true">
                {isChecked ? '✓' : ''}
              </span>
              <div>
                <span className="opt-t">{tp.t}</span>
                <span className="opt-s">{tp.d}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="btn-row" style={{ marginTop: '1.2rem' }}>
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!hasAnySelected}
          onClick={handleStart}
        >
          質問に答える（次へ）
        </button>
      </div>

      {state.quizDone && (
        <div style={{ textAlign: 'center', marginTop: '.9rem' }}>
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
