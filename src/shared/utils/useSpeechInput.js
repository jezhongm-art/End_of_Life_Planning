import { useState, useRef, useEffect, useCallback } from 'react'

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function useSpeechInput({ onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {}
    }
    setIsListening(false)
  }, [])

  const start = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      onErrorRef.current?.('お使いのブラウザでは音声入力に対応していません。文字でご入力ください。')
      return false
    }

    if (isListening) {
      stop()
      return false
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRec()
    recognition.lang = 'ja-JP'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((r) => r[0]?.transcript || '')
        .join('')
        .trim()
      if (transcript) {
        onResultRef.current?.(transcript)
      }
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        onErrorRef.current?.('マイクの使用が許可されていません。ブラウザの設定をご確認ください。')
      } else if (event?.error !== 'aborted') {
        onErrorRef.current?.('音声を聞き取れませんでした。もう一度お話しください。')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    try {
      setIsListening(true)
      recognition.start()
      return true
    } catch {
      setIsListening(false)
      onErrorRef.current?.('音声入力を開始できませんでした。')
      return false
    }
  }, [isListening, stop])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }
    }
  }, [])

  return {
    isSupported: isSpeechRecognitionSupported(),
    isListening,
    start,
    stop
  }
}
