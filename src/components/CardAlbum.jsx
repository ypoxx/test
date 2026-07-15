import { useEffect, useMemo, useRef, useState } from 'react'
import cardsData from '../data/cards.json'
import StadiumScene from './StadiumScene'
import FutCard from './FutCard'
import { RARITIES, RARITY_ORDER } from '../utils/rarity'
import './CardAlbum.css'

/**
 * CardAlbum — Sammelalbum als inszenierter Vollbild-Screen
 * (Phase 4 "Zebra Ultimate Team", Design-Richtung A "Flutlicht-Gold",
 * Artboard "album" in scratchpad/design/direction-a.html; Fehlt-Mechanik
 * aus direction-b.html via FutCard variant="ghost").
 *
 * Vertrag mit Stadium.jsx (UNVERÄNDERT):
 *   <CardAlbum progress={progress} onClose={() => setShowAlbum(false)} />
 *   progress.unlockedCards = Array der besessenen Karten-IDs (cards.json).
 *
 * Serien-Nummern-Konvention: Position der Karte in src/data/cards.json,
 * 1-basiert — FutCard formatiert daraus "#NNN" bzw. "Nr. N".
 */

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
)

/* Punkt-Icon für den aktiven Filter — Zustand nicht nur über Farbe */
const ActiveDot = () => (
  <svg
    className="ca-pill-dot"
    viewBox="0 0 10 10"
    width="10"
    height="10"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="5" cy="5" r="4" fill="currentColor" />
  </svg>
)

function CardAlbum({ progress, onClose }) {
  const [activeFilter, setActiveFilter] = useState('Alle')
  const [detail, setDetail] = useState(null) // { card, serial } | null
  const detailCloseRef = useRef(null)
  const rootRef = useRef(null)
  const closeBtnRef = useRef(null)
  const detailTriggerRef = useRef(null)

  const unlockedCards = progress?.unlockedCards || []

  /* Alle Karten mit fester Serien-Nr. (1-basierte Position in cards.json) */
  const entries = useMemo(() => {
    const owned = new Set(unlockedCards)
    return cardsData.map((card, index) => ({
      card,
      serial: index + 1,
      owned: owned.has(card.id)
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedCards.join(',')])

  const totalCount = entries.length
  const ownedCount = entries.filter((entry) => entry.owned).length
  const progressPct = totalCount ? Math.round((ownedCount / totalCount) * 100) : 0

  /* Raritäts-Zähler aus echten Daten (rarity.js als Single Source of Truth) */
  const rarityCounts = useMemo(
    () =>
      RARITY_ORDER.map((key) => {
        const ofRarity = entries.filter((entry) => entry.card.rarity === key)
        return {
          key,
          label: RARITIES[key].label,
          tier: RARITIES[key].tier,
          owned: ofRarity.filter((entry) => entry.owned).length,
          total: ofRarity.length
        }
      }),
    [entries]
  )

  const visibleEntries = useMemo(() => {
    if (activeFilter === 'Alle') return entries
    return entries.filter((entry) => entry.card.rarity === activeFilter)
  }, [entries, activeFilter])

  /* Escape: erst Großansicht schließen, sonst Album */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (detail) {
        setDetail(null)
      } else {
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [detail, onClose])

  /* Fokus beim Öffnen ins Album holen, beim Schließen an den Auslöser zurückgeben */
  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeBtnRef.current?.focus()
    return () => {
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
    }
  }, [])

  /* Fokus in die Großansicht holen bzw. zurück auf die auslösende Kachel */
  useEffect(() => {
    if (detail && detailCloseRef.current) {
      detailCloseRef.current.focus()
    } else if (!detail && detailTriggerRef.current) {
      detailTriggerRef.current.focus()
      detailTriggerRef.current = null
    }
  }, [detail])

  /* Einfache Fokus-Falle: aria-modal sperrt den Hintergrund nicht wirklich —
     Tab zykliert innerhalb des Dialogs (bei offener Großansicht nur in ihr) */
  const trapFocus = (event) => {
    if (event.key !== 'Tab') return
    const scope = detail
      ? rootRef.current?.querySelector('.ca-detail')
      : rootRef.current
    if (!scope) return
    const focusables = scope.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const filters = ['Alle', ...RARITY_ORDER]

  return (
    <div
      ref={rootRef}
      className="card-album"
      role="dialog"
      aria-modal="true"
      aria-label="Sammelalbum"
      onKeyDown={trapFocus}
    >
      <StadiumScene variant="default" className="card-album__scene">
        <button
          ref={closeBtnRef}
          type="button"
          className="ca-close"
          onClick={onClose}
          aria-label="Sammelalbum schließen"
        >
          <CloseIcon />
        </button>

        <div className="ca-scroll">
          <div className="ca-wrap">
            <header className="ca-head">
              <div className="ca-head-row">
                <div className="ca-head-titles">
                  <h2 className="ca-title">Sammelalbum</h2>
                  <p className="ca-sub">Zebra-Kader</p>
                </div>
              </div>
              <p className="ca-count">
                <span className="ca-count-n">{`${ownedCount} / ${totalCount}`}</span>
                <span className="ca-count-l">Karten</span>
              </p>
              <div
                className="ca-bar"
                role="progressbar"
                aria-label="Sammelfortschritt"
                aria-valuemin={0}
                aria-valuemax={totalCount}
                aria-valuenow={ownedCount}
                aria-valuetext={`${ownedCount} von ${totalCount} Karten`}
              >
                <i style={{ width: `${progressPct}%` }} />
              </div>
            </header>

            <ul className="ca-rarities" aria-label="Fortschritt je Rarität">
              {rarityCounts.map(({ key, label, tier, owned, total }) => (
                <li key={key} className="ca-rar">
                  <span className={`ca-gem ca-gem--${tier}`} aria-hidden="true" />
                  <span className="ca-rar-name">{label}</span>
                  <span className="ca-rar-count">
                    {owned}/{total}
                  </span>
                </li>
              ))}
            </ul>

            <div className="ca-filters" role="group" aria-label="Karten nach Rarität filtern">
              {filters.map((filterKey) => {
                const isActive = activeFilter === filterKey
                const label = filterKey === 'Alle' ? 'Alle' : RARITIES[filterKey].label
                return (
                  <button
                    key={filterKey}
                    type="button"
                    className="ca-pill"
                    aria-pressed={isActive}
                    onClick={() => setActiveFilter(filterKey)}
                  >
                    {isActive && <ActiveDot />}
                    {label}
                  </button>
                )
              })}
            </div>

            <ul className="ca-grid">
              {visibleEntries.map(({ card, serial, owned }) => (
                <li key={card.id} className="ca-cell">
                  {owned ? (
                    <button
                      type="button"
                      className="ca-cardbtn"
                      onClick={(event) => {
                        detailTriggerRef.current = event.currentTarget
                        setDetail({ card, serial })
                      }}
                      aria-label={`${card.name} in Großansicht öffnen`}
                    >
                      <FutCard card={card} variant="tile" serial={serial} />
                    </button>
                  ) : (
                    <FutCard card={card} variant="ghost" serial={serial} />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </StadiumScene>

      {detail && (
        <div
          className="ca-detail"
          role="dialog"
          aria-modal="true"
          aria-label={`Großansicht: ${detail.card.name}`}
          onClick={() => setDetail(null)}
        >
          <button
            ref={detailCloseRef}
            type="button"
            className="ca-detail-close"
            onClick={(event) => {
              event.stopPropagation()
              setDetail(null)
            }}
            aria-label="Großansicht schließen"
          >
            <CloseIcon />
          </button>
          <div className="ca-detail-card" onClick={(event) => event.stopPropagation()}>
            <FutCard card={detail.card} variant="reveal" serial={detail.serial} />
          </div>
        </div>
      )}
    </div>
  )
}

export default CardAlbum
