/**
 * 画像ファイルを読み込み、HTML5 Canvas で自動リサイズ・JPEG圧縮を行うユーティリティ
 * localStorageの容量制限（約5〜10MB）を考慮し、1枚あたり約50〜100KB程度に軽量化します。
 *
 * @param {File} file - 選択された画像ファイル
 * @param {number} maxWidth - 最大幅（デフォルト800px）
 * @param {number} maxHeight - 最大高さ（デフォルト800px）
 * @param {number} quality - JPEG圧縮品質（0.0 〜 1.0、デフォルト0.75）
 * @returns {Promise<string>} Base64 Data URL
 */
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('有効な画像ファイルではありません'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        // 縦横比を維持しながらリサイズ計算
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
    reader.readAsDataURL(file)
  })
}
