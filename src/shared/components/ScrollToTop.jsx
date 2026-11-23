import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * 画面遷移（パスまたは検索パラメータ変更時）に
 * 常に画面最上部にスクロールするコンポーネント
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])

  return null
}
