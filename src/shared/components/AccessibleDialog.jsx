import React, { useEffect, useId, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ')

export function AccessibleDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  initialFocusRef,
  closeOnBackdrop = true,
  dialogClassName = ''
}) {
  const titleId = useId()
  const descId = useId()
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined

    previousFocusRef.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusInitial = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
        return
      }
      const dialogEl = dialogRef.current
      if (!dialogEl) return
      const focusables = dialogEl.querySelectorAll(FOCUSABLE_SELECTOR)
      if (focusables.length > 0) {
        focusables[0].focus()
      } else {
        dialogEl.focus()
      }
    }

    const frameId = requestAnimationFrame(focusInitial)

    const handleKeyDown = (e) => {
      const dialogEl = dialogRef.current
      if (!dialogEl) return

      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onCloseRef.current?.()
        return
      }

      if (e.key === 'Tab') {
        const focusables = Array.from(dialogEl.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
          (el) => el.offsetParent !== null || el === document.activeElement
        )

        if (focusables.length === 0) {
          e.preventDefault()
          dialogEl.focus()
          return
        }

        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement

        if (e.shiftKey) {
          if (active === first || !dialogEl.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last || !dialogEl.contains(active)) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      cancelAnimationFrame(frameId)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = prevOverflow
      const prevEl = previousFocusRef.current
      if (prevEl && typeof prevEl.focus === 'function' && document.contains(prevEl)) {
        prevEl.focus()
      }
    }
  }, [isOpen, initialFocusRef])

  if (!isOpen) return null

  return (
    <div
      className="overlay center"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose?.()
        }
      }}
    >
      <div
        ref={dialogRef}
        className={`dialog ${dialogClassName}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        {description && <p id={descId}>{description}</p>}
        {children}
      </div>
    </div>
  )
}
