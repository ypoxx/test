import { useState } from 'react'
import Match from '../Match'
import { OPPONENTS } from '../../utils/matchLogic'

/**
 * PreviewMatch — Dev-Harness für den Broadcast-Match-Umbau (ZUT Phase 4).
 *
 * Aufruf: /?zut-preview=match[&opponent=BVB][&matchday=7][&bar=0]
 *   opponent - Vereinskürzel aus matchLogic OPPONENTS (z. B. BVB, S04, FCB).
 *              Erzwingt einen deterministischen Gegner, indem der Harness die
 *              echte <Match>-Komponente im Season-Modus mit diesem Gegner
 *              als seasonOpponent rendert (Match wählt sonst zufällig).
 *   matchday - Spieltag-Anzeige im Season-Modus (Default 7).
 *   bar      - 0 blendet die Dev-Leiste aus (für Screenshots).
 *
 * Zustände (state=countdown|play|result ist NICHT direkt anspringbar, ohne
 * die echte Match-Logik zu ändern — bewusst per Interaktion):
 *   countdown - Initialzustand nach dem Laden.
 *   play      - Countdown antippen (tap-to-skip) → Spielszene mit Score-Bar.
 *   TOR-Beat  - richtige Antwort tippen. Bei leerem Fortschritt fragt Match
 *               immer EN→DE, die korrekte Option ist also vocab.german aus
 *               src/data/vocabs.json (nutzt der Screenshot-Runner).
 *   result    - alle 10 Fragen (+ ggf. Nachspielzeit) beantworten.
 *
 * Hinweis: Es läuft die ECHTE <Match>-Komponente inkl. localStorage-Writes
 * (Fortschritt/XP) — nur für Dev-Zwecke gedacht. onMatchEnd ist ein No-op,
 * der eine Abschluss-Notiz mit Neustart-Button zeigt.
 */

const readParams = () => {
  const params = new URLSearchParams(window.location.search)
  return {
    opponentShort: params.get('opponent'),
    matchday: Number(params.get('matchday')) || 7,
    bar: params.get('bar') !== '0'
  }
}

const STUB_PROGRESS = { vocabProgress: {}, level: 3 }

const barStyle = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 60,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  alignItems: 'center',
  padding: '6px 8px',
  background: 'rgba(2, 6, 18, 0.85)',
  borderTop: '1px solid rgba(255, 203, 45, 0.35)',
  fontFamily: 'system-ui, sans-serif'
}

const btnStyle = {
  minHeight: 44,
  padding: '0 12px',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 700,
  color: '#0A1730',
  background: '#FFCB2D',
  border: '1px solid rgba(150, 180, 230, 0.4)'
}

export default function PreviewMatch() {
  const [{ opponentShort, matchday, bar }] = useState(readParams)
  const [runKey, setRunKey] = useState(0)
  const [endedResult, setEndedResult] = useState(null)

  const forcedOpponent = opponentShort
    ? OPPONENTS.find((entry) => entry.short === opponentShort.toUpperCase()) || null
    : null

  const restart = () => {
    setEndedResult(null)
    setRunKey((key) => key + 1)
  }

  return (
    <div>
      {endedResult ? (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            color: '#E7EEFB',
            background: '#040D24',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: 15 }}>
            onMatchEnd ausgelöst — Ergebnis {endedResult.score} ({endedResult.status}),
            Genauigkeit {endedResult.accuracy}%
          </p>
          <button type="button" style={btnStyle} onClick={restart}>
            Neu starten
          </button>
        </div>
      ) : (
        <Match
          key={runKey}
          progress={STUB_PROGRESS}
          onMatchEnd={(result) => setEndedResult(result)}
          filters={null}
          mode={forcedOpponent ? 'season' : 'training'}
          seasonOpponent={forcedOpponent}
          seasonMatchday={forcedOpponent ? matchday : null}
        />
      )}

      {bar && !endedResult && (
        <div style={barStyle} data-testid="pv-toolbar">
          <span style={{ fontSize: 12, fontWeight: 700, color: '#FFE27A', letterSpacing: '0.08em' }}>
            DEV · MATCH{forcedOpponent ? ` · vs ${forcedOpponent.short}` : ''}
          </span>
          <button type="button" style={btnStyle} onClick={restart}>
            Neu starten
          </button>
        </div>
      )}
    </div>
  )
}
