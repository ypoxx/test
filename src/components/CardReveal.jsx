import { useEffect, useRef, useState } from 'react'
import soundManager from '../utils/sounds'
import { getRarity } from '../utils/rarity'
import StadiumScene from './StadiumScene'
import FutCard from './FutCard'
import cards from '../data/cards.json'
import './CardReveal.css'

/**
 * CardReveal — Pack-Opening mit Raritäts-Dramaturgie
 * (Design-Richtung A "Flutlicht-Gold", Artboard "pack").
 *
 * State-Machine: closed → opening → revealed.
 * Die Rarität "leakt" während des Openings über das Licht:
 *   bronze/silver  ~700ms — Pack reißt auf, kühler Blitz, direkt zur Karte.
 *   gold          ~1500ms — goldene Beams (Scene-Variante 'gold') + Funken.
 *   holo          ~3000ms — volles Walkout: Bühne dunkelt ab, Kartenrücken
 *                  fährt hoch, Beams schwenken, Fanfare am Höhepunkt, Flip.
 *
 * Props (abwärtskompatibel zu Match.jsx — neue Props sind optional):
 * @param {Object}   props.card      - Eintrag aus src/data/cards.json
 * @param {boolean}  [props.isNew]   - Karte ist neu im Album
 * @param {Object}   [props.fact]    - optionaler Fußball-Fact ({ text })
 * @param {Function} props.onClose   - Weiter-Callback ("In die Sammlung")
 * @param {boolean}  [props.isVictory=false] - Sieg-Kontext (Gold-Pack-Asset)
 * @param {number}   [props.serial]  - Serien-Nr.; Default: 1-basierte Position
 *                                     der Karte in cards.json
 */

const OPEN_MS = { bronze: 700, silver: 700, gold: 1500, holo: 3000 }
const HOLO_FANFARE_MS = 2100

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Serien-Nr.-Konvention: 1-basierte Position in cards.json */
const serialFor = (card) => {
  const index = cards.findIndex((entry) => entry.id === card.id)
  return index >= 0 ? index + 1 : undefined
}

const ArrowIcon = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true" focusable="false">
    <path
      d="M1 7h12M9 2l5 5-5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <path
      d="M1.5 6.5l3 3 6-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function CardReveal({ card, isNew, fact, onClose, isVictory = false, serial }) {
  const [stage, setStage] = useState('closed')
  const timersRef = useRef([])

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach(clearTimeout)
  }, [])

  if (!card) return null

  const rarity = getRarity(card.rarity)
  const tier = rarity.tier
  const serialNumber = serial ?? serialFor(card)

  const isGoldPack = isVictory || tier === 'holo'
  const packSrc = isGoldPack ? '/img/pack-gold.svg' : '/img/pack-blue.svg'
  const packLine = `${isGoldPack ? 'GOLD-PACK' : 'MSV-PACK'} · SPIELTAG-BELOHNUNG`

  const sceneVariant =
    stage === 'revealed'
      ? tier === 'gold' || tier === 'holo'
        ? 'gold'
        : 'default'
      : stage === 'opening' && tier === 'gold'
        ? 'gold'
        : 'walkout'

  const openPack = () => {
    if (stage !== 'closed') return
    // WICHTIG: playPack() bleibt direkt im Tap-Handler (iOS-Audio-Unlock).
    soundManager.playPack()

    if (prefersReducedMotion()) {
      // Reduced Motion: kein Walkout-Zwang — sofort statischer Endzustand.
      if (tier === 'holo') soundManager.playAchievement('legendary')
      setStage('revealed')
      return
    }

    setStage('opening')
    if (tier === 'holo') {
      timersRef.current.push(
        setTimeout(() => soundManager.playAchievement('legendary'), HOLO_FANFARE_MS)
      )
    }
    timersRef.current.push(
      setTimeout(() => setStage('revealed'), OPEN_MS[tier] ?? OPEN_MS.bronze)
    )
  }

  return (
    <StadiumScene variant={sceneVariant} className="cr-scene">
      <div className="cr-wrap">
        {stage === 'closed' && (
          <div className="cr-stage cr-stage--closed">
            <header className="cr-head">
              <p className="cr-kicker">SPIELTAG-BELOHNUNG</p>
              <h2 className="cr-title">KARTENPACK</h2>
              <p className="cr-sub">Ziehe deine Belohnung!</p>
            </header>

            <div className="cr-pack-zone">
              <div className="cr-pack cr-pack--float">
                <i className="cr-pack-glow" aria-hidden="true" />
                <img className="cr-pack-img" src={packSrc} alt="" draggable="false" />
              </div>
              <i className="cr-ground-glow" aria-hidden="true" />
            </div>

            <button type="button" className="cr-cta" onClick={openPack}>
              Pack öffnen
              <ArrowIcon />
            </button>
          </div>
        )}

        {stage === 'opening' && (
          <div className={`cr-stage cr-stage--opening cr-open--${tier}`}>
            <p className="cr-sr-only" role="status">
              Pack wird geöffnet …
            </p>

            {tier !== 'holo' ? (
              <div className="cr-pack-zone" aria-hidden="true">
                <div className="cr-pack cr-pack--rip">
                  <img className="cr-pack-half cr-pack-half--top" src={packSrc} alt="" />
                  <img className="cr-pack-half cr-pack-half--bot" src={packSrc} alt="" />
                </div>
                <i className="cr-flash" />
                {tier === 'gold' && <i className="cr-sparks" />}
              </div>
            ) : (
              <div className="cr-walkout" aria-hidden="true">
                <i className="cr-dim" />
                <i className="cr-wbeam cr-wbeam--l" />
                <i className="cr-wbeam cr-wbeam--r" />
                <i className="cr-sparks cr-sparks--holo" />
                <div className="cr-cardback-rise">
                  <img className="cr-cardback" src="/img/card-back.svg" alt="" />
                </div>
                <i className="cr-ground-glow cr-ground-glow--holo" />
              </div>
            )}
          </div>
        )}

        {stage === 'revealed' && (
          <div className="cr-stage cr-stage--revealed">
            <header className="cr-head">
              <p className="cr-kicker">NEUE KARTE GEZOGEN</p>
              <h2 className={`cr-headline${tier === 'holo' ? ' cr-headline--holo' : ''}`}>
                {rarity.label.toUpperCase()}!
              </h2>
              <p className="cr-sub">{packLine}</p>
            </header>

            <div className="cr-card-zone">
              {isNew && (
                <span className="cr-new">
                  <CheckIcon />
                  NEU IM ALBUM
                </span>
              )}
              <div className={`cr-card ${tier === 'holo' ? 'cr-card--flip' : 'cr-card--pop'}`}>
                <FutCard variant="reveal" card={card} serial={serialNumber} />
              </div>
              <i className="cr-ground-glow" aria-hidden="true" />
            </div>

            {fact && (
              <div className="cr-fact">
                <div className="cr-fact-head">
                  <img className="cr-fact-icon" src="/img/ball.svg" alt="" />
                  <span>Fußball-Fact</span>
                </div>
                <p className="cr-fact-text">{fact.text}</p>
              </div>
            )}

            <button type="button" className="cr-cta" onClick={onClose}>
              In die Sammlung
              <ArrowIcon />
            </button>
          </div>
        )}
      </div>
    </StadiumScene>
  )
}

export default CardReveal
