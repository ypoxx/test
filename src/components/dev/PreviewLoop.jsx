import { useState } from 'react'
import VocabCard from '../VocabCard'

/**
 * PreviewLoop — Dev-Harness für VocabCard (Phase 4, ZUT-Umbau).
 *
 * Aufruf: /?zut-preview=loop&state=neutral|richtig|falsch&dir=en-de|de-en&extra=0|1
 *   state - Feedback-Zustand beim Mount (Default: neutral)
 *   dir   - Abfragerichtung (Default: en-de)
 *   extra - Nachspielzeit-Label (Default: 0)
 *
 * Zustands-Buttons re-mounten die Karte mit dem Dev-Prop initialAnswer,
 * damit richtig/falsch dauerhaft sichtbar bleiben (kein Reset-Timeout).
 */

const SAMPLE_VOCAB = {
  id: 'vocab_003',
  english: 'to score',
  german: 'ein Tor schießen',
  exampleSentence: 'MSV Duisburg scores in the last minute',
  category: 'sport',
  difficulty: 1
}

const OPTIONS = ['ein Tor schießen', 'gewinnen', 'passen, abgeben', 'laufen']
const WRONG_PICK = 'gewinnen'
const STATES = ['neutral', 'richtig', 'falsch']

const readParams = () => {
  const params = new URLSearchParams(window.location.search)
  const state = params.get('state')
  return {
    state: STATES.includes(state) ? state : 'neutral',
    dir: params.get('dir') === 'de-en' ? 'de-en' : 'en-de',
    extra: params.get('extra') === '1',
    bar: params.get('bar') !== '0'
  }
}

const writeParams = ({ state, dir, extra }) => {
  const params = new URLSearchParams(window.location.search)
  params.set('zut-preview', 'loop')
  params.set('state', state)
  params.set('dir', dir)
  params.set('extra', extra ? '1' : '0')
  window.history.replaceState(null, '', `?${params.toString()}`)
}

const pageStyle = {
  minHeight: '100vh',
  padding: '28px 0 120px',
  background: 'linear-gradient(180deg, #040D24 0%, #071630 38%, #0A1F44 100%)',
  fontFamily: '"Archivo Variable", system-ui, sans-serif'
}

const barStyle = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 50,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  alignItems: 'center',
  padding: '8px 8px calc(8px + env(safe-area-inset-bottom, 0px))',
  background: 'rgba(2, 6, 18, 0.9)',
  borderTop: '1px solid rgba(150, 180, 230, 0.3)',
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

/* initialAnswer je Zustand — bei de-en ist die englische Vokabel richtig */
const answerForState = (state, dir) => {
  const correct = dir === 'de-en' ? SAMPLE_VOCAB.english : SAMPLE_VOCAB.german
  if (state === 'richtig') return correct
  if (state === 'falsch') return dir === 'de-en' ? 'to win' : WRONG_PICK
  return null
}

const optionsForDir = (dir) =>
  dir === 'de-en' ? ['to score', 'to win', 'to pass', 'to run'] : OPTIONS

export default function PreviewLoop() {
  const [initial] = useState(readParams)
  const [state, setState] = useState(initial.state)
  const [dir, setDir] = useState(initial.dir)
  const [extra, setExtra] = useState(initial.extra)
  const [runKey, setRunKey] = useState(0)
  const [lastAnswer, setLastAnswer] = useState(null)

  const apply = (nextState = state, nextDir = dir, nextExtra = extra) => {
    setState(nextState)
    setDir(nextDir)
    setExtra(nextExtra)
    setLastAnswer(null)
    setRunKey((key) => key + 1)
    writeParams({ state: nextState, dir: nextDir, extra: nextExtra })
  }

  return (
    <div style={pageStyle}>
      <VocabCard
        key={`${state}-${dir}-${extra ? 1 : 0}-${runKey}`}
        vocab={SAMPLE_VOCAB}
        options={optionsForDir(dir)}
        direction={dir}
        onAnswer={(answer) => setLastAnswer(answer)}
        currentIndex={3}
        total={10}
        extraTime={extra}
        initialAnswer={answerForState(state, dir)}
      />

      {lastAnswer && (
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#AFC4E8' }}>
          onAnswer: &bdquo;{lastAnswer}&ldquo;
        </p>
      )}

      {initial.bar && (
        <div style={barStyle} data-testid="pv-toolbar">
          <span style={{ fontSize: 12, fontWeight: 700, color: '#AFC4E8', letterSpacing: '0.08em' }}>
            DEV · LOOP
          </span>
          {STATES.map((entry) => (
            <button
              key={entry}
              type="button"
              style={btnStyle(entry === state)}
              onClick={() => apply(entry)}
            >
              {entry}
            </button>
          ))}
          <button type="button" style={btnStyle(dir === 'de-en')} onClick={() => apply(state, dir === 'de-en' ? 'en-de' : 'de-en')}>
            DE→EN: {dir === 'de-en' ? 'an' : 'aus'}
          </button>
          <button type="button" style={btnStyle(extra)} onClick={() => apply(state, dir, !extra)}>
            Nachspielzeit: {extra ? 'an' : 'aus'}
          </button>
        </div>
      )}
    </div>
  )
}
