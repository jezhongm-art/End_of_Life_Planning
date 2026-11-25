import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * 画面遷移（パスまたは検索パラメータ変更時）に
 * 画面最上部へスクロールし、メイン領域へフォーカスを移動するコンポーネント
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const mainEl = document.getElementById('screen')
    if (mainEl) {
      mainEl.focus({ preventScroll: true })
    }
  }, [pathname, search])

  return null
}
