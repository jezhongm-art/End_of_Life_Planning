import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../shared/context/AppContext'
import { ITEMS } from '../memberB/items'
import { pickPriorityItem, resolveLatestAnalysis } from '../memberC/rules'
import { StatusBadge } from '../memberB/StatusBadge'
import { Icon } from '../shared/components/SvgIcons'

export default function SurveyResult() {
  const { state, getQuizStatus, setItemPriority } = useApp()
  const [showAllNewly, setShowAllNewly] = useState(false)

  const quizStatus = getQuizStatus()
  const analysis = resolveLatestAnalysis(state)

  if (!analysis) {
    return (
      <div className="screen-anim">
        <div className="empty">
          まだアンケートのお答えがありません。<br />
          質問に答えると、いまの状況に合った準備をご案内します。
        </div>
        <div className="btn-row" style={{ marginTop: '1rem' }}>
          <Link to="/survey" className="btn btn-primary btn-block">
            アンケートを始める
          </Link>
        </div>
      </div>
    )
  }

  const newlyItems = (analysis?.newly || []).map((n) => {
    const item = ITEMS.find((it) => it.id === n.id)
    return { ...n, item }
  }).filter((n) => !!n.item)

  const knownItems = (analysis?.known || []).map((k) => {
    const item = ITEMS.find((it) => it.id === k.id)
    return { ...k, item }
  }).filter((k) => !!k.item)

  const neutralItems = (analysis?.neutral || []).map((neu) => {
    const item = ITEMS.find((it) => it.id === neu.id)
    return { ...neu, item }
  }).filter((neu) => !!neu.item)

  const unconfirmedItems = (analysis?.unconfirmed || []).map((id) =>
    ITEMS.find((it) => it.id === id)
  ).filter(Boolean)

  // おすすめ項目が未完なら最優先、すべて完了済みなら別の未完了項目を選ぶ
  const topPick = pickPriorityItem(analysis, state.items, state.priority)

  const handleSetPriority = (id) => {
    setItemPriority(id)
  }

  const visibleNewly = showAllNewly ? newlyItems : newlyItems.slice(0, 3)
  const hiddenNewlyCount = Math.max(0, newlyItems.length - 3)

  return (
    <div className="screen-anim">
      {/* 途中結果か完了結果かのバナー */}
      {!state.quizDone ? (
        <div className="notice notice-amber">
          <div className="n-ic">
            <Icon name="bulb" />
          </div>
          <div className="n-body">
            <h2 className="n-title">
              途中の答えによる仮の結果（{quizStatus.answeredCount} / {quizStatus.totalCount} 問）
            </h2>
            <p className="n-sub">
              まだ最後まで終わっていません。残りの質問に答えると、より合った案内になります。
            </p>
            <div style={{ marginTop: '.65rem' }}>
              <Link to="/survey/q" className="btn btn-amber btn-small">
                続きから答える（残り{quizStatus.remainingCount}問）
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="notice notice-teal">
          <div className="n-ic">
            <Icon name="check" stroke />
          </div>
          <div className="n-body">
            <h2 className="n-title">アンケートの結果</h2>
            <p className="n-sub">
              お答えいただいた内容をもとに、いまの確認状況と次に取り組める項目をまとめました。
            </p>
          </div>
        </div>
      )}

      {/* 最初におすすめする次の一歩（全項目完了時はお祝い表示） */}
      {topPick && topPick.item ? (
        <section className="hero" style={{ marginTop: '1rem' }}>
          <div className="h-eyebrow">
            <Icon name="star" style={{ width: '1rem', height: '1rem' }} /> まず取り組みたいこと
          </div>
          <h3 className="h-title">{topPick.item.title}</h3>
          <p className="card-sub">{topPick.item.desc}</p>
          <div className="h-reason">
            <strong>理由：</strong> {topPick.reason}
          </div>

          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <Link
              to={`/items/detail?id=${topPick.item.id}`}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              進め方を見る
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => handleSetPriority(topPick.item.id)}
            >
              ホームの「次にすること」に設定
            </button>
          </div>
        </section>
      ) : (
        <section className="celebrate" style={{ marginTop: '1rem' }}>
          <p style={{ fontWeight: 800, color: 'var(--brand-deep)', fontSize: '1.08rem' }}>
            すべての準備項目（{ITEMS.length}項目）が完了しています
          </p>
          <p className="note" style={{ color: 'var(--body)', marginTop: '.25rem' }}>
            どの項目も確認が終わっています。状況が変わったときは、一覧からいつでも見直せます。
          </p>
        </section>
      )}

      {/* 新しく見つかった準備（最初は上位3件までに制限） */}
      <h3 className="sec-title">確認をおすすめする項目（{newlyItems.length}件）</h3>
      {newlyItems.length === 0 ? (
        <div className="card" style={{ marginTop: '.6rem', background: 'var(--surface-2)' }}>
          <p style={{ fontWeight: 700, color: 'var(--ink)' }}>
            今回お答えいただいた範囲では、今すぐ新しく始める項目は見つかりませんでした。
          </p>
          <p className="note" style={{ marginTop: '.35rem' }}>
            準備がすべて不要という意味ではありません。まだお答えいただいていない項目や、ご自身のペースで進めている項目も大切ですので、必要に応じて下の項目や「準備項目の一覧」からご確認ください。
          </p>
        </div>
      ) : (
        <>
          {visibleNewly.map(({ item, reason }) => {
            const itemState = state.items[item.id]?.state || 'notyet'
            return (
              <Link
                key={item.id}
                to={`/items/detail?id=${item.id}`}
                className="rowitem"
              >
                <div className="r-main">
                  <span className="r-title">{item.title}</span>
                  <span className="r-sub">{reason}</span>
                  <div style={{ marginTop: '.4rem' }}>
                    <StatusBadge state={itemState} />
                  </div>
                </div>
                <Icon name="chev" stroke className="chev" />
              </Link>
            )
          })}
          {newlyItems.length > 3 && (
            <button
              type="button"
              className="btn btn-sub btn-block"
              style={{ marginTop: '.75rem' }}
              onClick={() => setShowAllNewly((prev) => !prev)}
            >
              {showAllNewly
                ? '上位3件だけの表示に戻す'
                : `他のおすすめ項目を見る（残り${hiddenNewlyCount}件）`}
            </button>
          )}
        </>
      )}

      {/* おひとり・頼れる家族がいない場合の公的相談窓口 */}
      {analysis?.needsSoloSupport && (
        <section
          className="card"
          style={{ marginTop: '1.1rem', borderColor: '#c4ddf0', background: '#f7fbfe' }}
          aria-label="おひとり・頼れる家族がいない場合の相談窓口"
        >
          <h3 className="card-title" style={{ fontSize: '1.02rem' }}>
            おひとりで進めるときの公的相談窓口
          </h3>
          <p className="card-sub">
            頼れるご家族が近くにいない場合でも、地域の窓口へ早めに相談しておくと、緊急時や手続きの備えを一緒に整えられます。お住まいの自治体の福祉・高齢者支援窓口もあわせてご活用ください。
          </p>
          <div style={{ marginTop: '.6rem' }}>
            <a
              href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/kaigo_koureisha/chiiki-houkatsu/"
              target="_blank"
              rel="noopener noreferrer"
              className="linkrow"
            >
              <div>
                <span className="lr-t">地域包括支援センター（お住まいの市区町村窓口）</span>
                <span className="lr-s">高齢者の暮らし・介護・見守り・生活支援の総合相談</span>
              </div>
              <Icon name="chev" stroke className="chev" />
            </a>
            <a
              href="https://www.houterasu.or.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="linkrow"
            >
              <div>
                <span className="lr-t">法テラス（日本司法支援センター）</span>
                <span className="lr-s">遺言書・任意後見・死後事務委任などの法律相談案内</span>
              </div>
              <Icon name="chev" stroke className="chev" />
            </a>
          </div>
        </section>
      )}

      {/* 中立的な状態の項目（今はひとりで整理したい等） */}
      {neutralItems.length > 0 && (
        <section className="card" style={{ marginTop: '1.1rem', borderColor: '#c4ddf0', background: '#f7fbfe' }}>
          <h3 className="card-title" style={{ fontSize: '1rem' }}>
            ご自身のペースで様子を見る項目（{neutralItems.length}件）
          </h3>
          <p className="card-sub">
            いまは急いで対応せず、ご自身のタイミングで見直せる項目です（まだ完了扱いにはしていません）。
          </p>
          {neutralItems.map(({ item, reason }) => {
            const itemState = state.items[item.id]?.state || 'notyet'
            return (
              <Link
                key={item.id}
                to={`/items/detail?id=${item.id}`}
                className="rowitem"
                style={{ marginTop: '.65rem' }}
              >
                <div className="r-main">
                  <span className="r-title">{item.title}</span>
                  <span className="r-sub">{reason}</span>
                  <div style={{ marginTop: '.4rem' }}>
                    <StatusBadge state={itemState} />
                  </div>
                </div>
                <Icon name="chev" stroke className="chev" />
              </Link>
            )
          })}
        </section>
      )}

      {/* 未確認・スキップした項目 */}
      {unconfirmedItems.length > 0 && (
        <details className="acc" style={{ marginTop: '1rem' }}>
          <summary>まだ確認していない・飛ばした項目を見る（{unconfirmedItems.length}件）</summary>
          <div className="acc-body">
            <p className="card-sub">
              「答えたくない」「わからない」などで未確認のまま残っている項目です。気になるものがあればいつでも確認できます。
            </p>
            {unconfirmedItems.map((item) => {
              const itemState = state.items[item.id]?.state || 'notyet'
              return (
                <Link
                  key={item.id}
                  to={`/items/detail?id=${item.id}`}
                  className="rowitem"
                  style={{ marginTop: '.65rem' }}
                >
                  <div className="r-main">
                    <span className="r-title">{item.title}</span>
                    <span className="r-sub">{item.desc}</span>
                    <div style={{ marginTop: '.4rem' }}>
                      <StatusBadge state={itemState} />
                    </div>
                  </div>
                  <Icon name="chev" stroke className="chev" />
                </Link>
              )
            })}
          </div>
        </details>
      )}

      {/* すでに把握・対応できている項目 */}
      {knownItems.length > 0 && (
        <details className="acc" style={{ marginTop: '1rem' }}>
          <summary>すでに整理できている・進めている項目（{knownItems.length}件）</summary>
          <div className="acc-body">
            {knownItems.map(({ item, reason }) => {
              const itemState = state.items[item.id]?.state || 'notyet'
              return (
                <div key={item.id} className="card" style={{ marginTop: '.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800 }}>{item.title}</span>
                    <StatusBadge state={itemState} />
                  </div>
                  <p className="note" style={{ marginTop: '.3rem' }}>{reason}</p>
                </div>
              )
            })}
          </div>
        </details>
      )}

      {/* 家族に伝えるまとめカード */}
      <details className="acc" style={{ marginTop: '1rem' }}>
        <summary>家族に相談するときの伝え方例を見る</summary>
        <div className="acc-body">
          <p className="card-sub">
            ご家族に話すとき、そのまま使っていただける言葉の例です。
          </p>
          <div className="qbubble" style={{ marginTop: '.7rem' }}>
            「終活みちしるべで確かめたところ、まずは『
            {topPick?.item?.title || '準備項目'}』から整理を始めようと思っています。
            {newlyItems.length > 0 && `あわせて${newlyItems.map((n) => n.item.title).join('、')}も確認していく予定です。`}
            無理のないペースで進めるので、相談に乗ってくれると助かります。」
          </div>
        </div>
      </details>

      {/* アクションボタン */}
      <div className="btn-row" style={{ marginTop: '1.3rem' }}>
        <Link to="/items" className="btn btn-primary btn-block">
          準備項目の一覧へ進む
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '.7rem' }}>
        <Link to="/" className="btn btn-ghost btn-small">
          ホームにもどる
        </Link>
      </div>
    </div>
  )
}
