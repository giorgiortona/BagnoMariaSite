import { useEffect, useId, useRef, useState } from 'react'
import { LANGUAGE_OPTIONS, useLanguage } from '../i18n.jsx'

export default function LanguageSelector({ className = '', onChange }) {
  const { language, setLanguage, copy } = useLanguage()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const menuId = useId()
  const selectedIndex = Math.max(0, LANGUAGE_OPTIONS.findIndex((option) => option.value === language))
  const selected = LANGUAGE_OPTIONS[selectedIndex]

  useEffect(() => {
    if (!open) return undefined

    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus()
  }, [activeIndex, open])

  const openMenu = (index = selectedIndex) => {
    setActiveIndex(index)
    setOpen(true)
  }

  const closeMenu = ({ restoreFocus = false } = {}) => {
    setOpen(false)
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const chooseLanguage = (nextLanguage) => {
    closeMenu()
    if (nextLanguage === language) return
    onChange?.()
    setLanguage(nextLanguage)
  }

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      openMenu((selectedIndex + direction + LANGUAGE_OPTIONS.length) % LANGUAGE_OPTIONS.length)
    }
  }

  const handleOptionKeyDown = (event, index) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index + direction + LANGUAGE_OPTIONS.length) % LANGUAGE_OPTIONS.length)
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setActiveIndex(event.key === 'Home' ? 0 : LANGUAGE_OPTIONS.length - 1)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu({ restoreFocus: true })
      return
    }

    if (event.key === 'Tab') setOpen(false)
  }

  return (
    <div
      className={`language-selector ${open ? 'is-open' : ''} ${className}`.trim()}
      ref={rootRef}
    >
      <button
        className="language-selector-trigger"
        type="button"
        ref={triggerRef}
        aria-label={copy.common.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="language-selector-flag" aria-hidden="true">{selected.flag}</span>
        <span>{selected.label}</span>
        <span className="language-selector-chevron" aria-hidden="true">⌄</span>
      </button>

      {open && (
        <div className="language-selector-menu" id={menuId} role="listbox" aria-label={copy.common.language}>
          {LANGUAGE_OPTIONS.map((option, index) => (
            <button
              className="language-selector-option"
              type="button"
              role="option"
              aria-selected={option.value === language}
              tabIndex={index === activeIndex ? 0 : -1}
              ref={(node) => { optionRefs.current[index] = node }}
              onClick={() => chooseLanguage(option.value)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
              key={option.value}
            >
              <span className="language-selector-flag" aria-hidden="true">{option.flag}</span>
              <span>{option.label}</span>
              <span className="language-selector-check" aria-hidden="true">
                {option.value === language ? '✓' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
