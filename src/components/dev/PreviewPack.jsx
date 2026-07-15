import { useState } from 'react'
import CardReveal from '../CardReveal'
import cards from '../../data/cards.json'
import { getRarity, RARITY_ORDER } from '../../utils/rarity'

/**
 * PreviewPack — Dev-Harness für CardReveal (Phase 4, ZUT-Umbau).
 *
 * Aufruf: /?zut-preview=pack&card=<id>&victory=0|1&fact=0|1
 *   card    - Karten-ID aus src/data/cards.json (Default: card_zebra_legend)
 *   victory - Sieg-Kontext an CardReveal durchreichen (Default 0)
 *   fact    - Fußball-Fact-Block anzeigen (Default 1)
 *
 * Über die Leiste unten lassen sich alle vier Tiers durchspielen;
 * "Neu starten" setzt die Sequenz zurück (closed → opening → revealed).
 */

const SAMPLE_FACT = {
  text: 'Der MSV Duisburg war 1963 Gründungsmitglied der Bundesliga und stand im ersten Endspiel um den DFB-Pokal der Bundesliga-Ära.'
}

/* erste Karte je Rarität als Tier-Beispiel */
const TIER_SAMPLES = RARITY_ORDER.map((key) => {
  const card = cards.find((entry) => entry.rarity === key)
  return { key, label: getRarity(key).label, id: card?.id }
}).filter((entry) => entry.id)

const readParams = () => {
  const params = new URLSearchParams(window.location.search)
  return {
    cardId: params.get('card') || 'card_zebra_legend',
    victory: params.get('victory') === '1',
    fact: params.get('fact') !== '0',
    bar: params.get('bar') !== '0'
  }
}

const writeParams = ({ cardId, victory }) => {
  const params = new URLSearchParams(window.location.search)
  params.set('zut-preview', 'pack')
  params.set('card', cardId)
  params.set('victory', victory ? '1' : '0')
  window.history.replaceState(null, '', `?${params.toString()}`)
}

const barStyle = {
  position: 'fixed',
  left: 0,
  right: 0,
  top: 0,
  zIndex: 50,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  alignItems: 'center',
  padding: '6px 8px',
  background: 'rgba(2, 6, 18, 0.85)',
  borderBottom: '1px solid rgba(150, 180, 230, 0.3)',
  fontFamily: 'system-ui, sans-serif'
}

const btnStyle = (active) => ({
  minHeight: 44,
  padding: '0 12px',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 700,
  color: active ? '#0A1730' : '#E7EEFB',
  background: active ? '#FFCB2D' : 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(150, 180, 230, 0.4)'
})

export default function PreviewPack() {
  const [initial] = useState(readParams)
  const [cardId, setCardId] = useState(initial.cardId)
  const [victory, setVictory] = useState(initial.victory)
  const [runKey, setRunKey] = useState(0)
  const [closedAt, setClosedAt] = useState(null)

  const card = cards.find((entry) => entry.id === cardId) || cards[0]
  const rarity = getRarity(card.rarity)

  const restart = (nextId = cardId, nextVictory = victory) => {
    setCardId(nextId)
    setVictory(nextVictory)
    setClosedAt(null)
    setRunKey((key) => key + 1)
    writeParams({ cardId: nextId, victory: nextVictory })
  }

  return (
    <div>
      {closedAt ? (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            color: '#E7EEFB',
            background: '#040D24',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          <p style={{ fontSize: 15 }}>
            onClose ausgelöst ({closedAt}) — Karte „{card.name}“ ({rarity.label})
          </p>
          <button type="button" style={btnStyle(true)} onClick={() => restart()}>
            Neu starten
          </button>
        </div>
      ) : (
        <CardReveal
          key={`${cardId}-${victory ? 1 : 0}-${runKey}`}
          card={card}
          isNew
          fact={initial.fact ? SAMPLE_FACT : null}
          isVictory={victory}
          onClose={() => setClosedAt(new Date().toLocaleTimeString('de-DE'))}
        />
      )}

      {initial.bar && (
      <div style={barStyle} data-testid="pv-toolbar">
        <span style={{ fontSize: 12, fontWeight: 700, color: '#AFC4E8', letterSpacing: '0.08em' }}>
          DEV · PACK
        </span>
        {TIER_SAMPLES.map((tier) => (
          <button
            key={tier.key}
            type="button"
            style={btnStyle(tier.id === cardId)}
            onClick={() => restart(tier.id)}
          >
            {tier.label}
          </button>
        ))}
        <button
          type="button"
          style={btnStyle(victory)}
          onClick={() => restart(cardId, !victory)}
        >
          Sieg: {victory ? 'an' : 'aus'}
        </button>
        <button type="button" style={btnStyle(false)} onClick={() => restart()}>
          Neu starten
        </button>
      </div>
      )}
    </div>
  )
}
