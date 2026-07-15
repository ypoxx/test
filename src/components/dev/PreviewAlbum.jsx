import { useMemo, useState } from 'react'
import CardAlbum from '../CardAlbum'
import cardsData from '../../data/cards.json'

/**
 * Dev-Harness für CardAlbum (Phase 4 ZUT-Umbau).
 * Aufruf: http://localhost:5175/?zut-preview=album
 *
 * Query-Parameter:
 *   empty=1  — komplett leere Sammlung (alle Karten als Ghost)
 *
 * Standard: realistische Sammlung mit 18 von 28 Karten, quer über
 * alle Raritäten (Bronze 8/10, Silber 6/9, Gold 3/6, Legendär 1/3).
 */

const OWNED_PER_RARITY = { Common: 8, Rare: 6, Epic: 3, Legendary: 1 }

export default function PreviewAlbum() {
  const params = new URLSearchParams(window.location.search)
  const empty = params.get('empty') === '1'

  const unlockedCards = useMemo(() => {
    if (empty) return []
    const seen = {}
    return cardsData
      .filter((card) => {
        seen[card.rarity] = (seen[card.rarity] || 0) + 1
        return seen[card.rarity] <= (OWNED_PER_RARITY[card.rarity] || 0)
      })
      .map((card) => card.id)
  }, [empty])

  const [open, setOpen] = useState(true)

  if (!open) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#040D24'
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            minHeight: 44,
            padding: '0 20px',
            borderRadius: 22,
            border: '1px solid rgba(150,180,230,.3)',
            background: '#10224A',
            color: '#E7EEFB',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Album öffnen
        </button>
      </div>
    )
  }

  return <CardAlbum progress={{ unlockedCards }} onClose={() => setOpen(false)} />
}
