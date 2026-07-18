import { useState } from 'react'
import { getPersonalGreeting, getRandomFunFact, getRandomPrompt } from '../utils/funFacts'
import StadiumScene from './StadiumScene'
import FutCard from './FutCard'
import cardsData from '../data/cards.json'
import soundManager from '../utils/sounds'
import './Welcome.css'

/**
 * Welcome — Startseite als Stadion-Moment "Zebra Ultimate Team"
 * (Design-Richtung A "Flutlicht-Gold"). Vertrag mit App.jsx UNVERÄNDERT:
 * <Welcome onStart={startStadium} /> — Fun-Fact-/Greeting-Logik bleibt gleich.
 */

/* Sammel-Teaser: drei echte Einträge aus cards.json (Silber/Gold/Legendär),
   Serien-Nr. = 1-basierte Position in cards.json (Konvention wie im Album). */
const TEASER_IDS = ['captains-band', 'card_zebra_legend', 'derby-fire']
const TEASER_CARDS = TEASER_IDS
  .map((id) => {
    const index = cardsData.findIndex((card) => card.id === id)
    return index === -1 ? null : { card: cardsData[index], serial: index + 1 }
  })
  .filter(Boolean)

/* ---------- Inline-SVG-Icons (statt Emojis) ---------- */
const FloodlightIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 2.6c-3 0-5.4 2.3-5.4 5.2 0 1.8 1 3 1.9 4 .7.8 1.2 1.5 1.4 2.5h4.2c.2-1 .7-1.7 1.4-2.5.9-1 1.9-2.2 1.9-4 0-2.9-2.4-5.2-5.4-5.2z"
      fill="currentColor"
    />
    <path
      d="M9.8 16.4h4.4v1.4a1.4 1.4 0 0 1-1.4 1.4h-1.6a1.4 1.4 0 0 1-1.4-1.4zM11 19.8h2v1.6h-2z"
      fill="currentColor"
      opacity=".75"
    />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M2.5 8.5l3.6 3.6L13.5 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CrossIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M3.5 3.5l9 9M12.5 3.5l-9 9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  </svg>
)

const StarIcon = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <path
      d="M6 .6l1.6 3.4 3.8.5-2.8 2.6.7 3.7L6 9l-3.3 1.8.7-3.7L.6 4.5l3.8-.5z"
      fill="currentColor"
    />
  </svg>
)

const QuestionIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M8.6 9.2A3.5 3.5 0 0 1 12 6.4c1.9 0 3.4 1.4 3.4 3.1 0 1.3-.8 2-1.7 2.7-.9.7-1.7 1.3-1.7 2.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="18.4" r="1.5" fill="currentColor" />
  </svg>
)

const ArrowIcon = () => (
  <svg viewBox="0 0 16 14" aria-hidden="true" focusable="false">
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

const CardsIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <rect
      x="2"
      y="4.5"
      width="9.5"
      height="13"
      rx="2"
      transform="rotate(-8 6.75 11)"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <rect
      x="9"
      y="3"
      width="9.5"
      height="13"
      rx="2"
      transform="rotate(7 13.75 9.5)"
      fill="currentColor"
      opacity=".85"
    />
  </svg>
)

function Welcome({ onStart }) {
  const [funFact] = useState(getRandomFunFact())
  const [greeting] = useState(getPersonalGreeting())
  const [prompt] = useState(getRandomPrompt())
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const handleAnswer = (answer) => {
    // Earliest real tap in a returning session (sound preference already
    // stored, so the "Sound aktivieren" prompt no longer shows) — attempt
    // the iOS audio unlock here so it happens inside a genuine gesture.
    soundManager.init()
    setSelectedAnswer(answer)
    setAnswered(true)
  }

  const guessedRight = selectedAnswer === funFact.isTrue

  return (
    <StadiumScene variant="gold">
      <div className="wl-scroll pt-safe">
        <div className="wl-wrap">
          {/* Tribünen-Backdrop (rein dekorativ) */}
          <div className="wl-backdrop" aria-hidden="true">
            <img
              src="/img/stadium-backdrop.webp"
              alt=""
              onError={(event) => { event.currentTarget.style.display = 'none' }}
            />
          </div>

          {/* Hero: Maskottchen + Gold-Begrüßung */}
          <header className="wl-hero">
            <div className="wl-mascot">
              <img
                src="/img/mascot.webp"
                alt="Zebra-Maskottchen"
                onError={(event) => { event.currentTarget.style.display = 'none' }}
              />
            </div>
            <h1 className="wl-title">
              <span className="wl-title-hi">{greeting},</span>
              <span className="wl-title-name">Maurice!</span>
            </h1>
            <p className="wl-sub">MSV Duisburg · Vokabel-Trainer</p>
          </header>

          {/* Fun-Fact als ZUT-Panel mit Gold-Hairline */}
          <section className="wl-panel">
            <div className="wl-panel-head">
              <span className="wl-panel-icon" aria-hidden="true">
                <FloodlightIcon />
              </span>
              <h2 className="wl-panel-kicker">Wusstest du schon &hellip;?</h2>
            </div>
            <p className="wl-fact">{funFact.fact}</p>

            {!answered ? (
              <>
                <p className="wl-prompt">{prompt}</p>
                <div className="wl-quiz">
                  <button onClick={() => handleAnswer(true)} className="wl-answer">
                    <span className="wl-akey wl-akey--true" aria-hidden="true">
                      <CheckIcon />
                    </span>
                    <span className="wl-atext">Das ist richtig</span>
                  </button>
                  <button onClick={() => handleAnswer(false)} className="wl-answer">
                    <span className="wl-akey wl-akey--false" aria-hidden="true">
                      <CrossIcon />
                    </span>
                    <span className="wl-atext">Das ist falsch</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`wl-result ${guessedRight ? 'wl-result--goal' : 'wl-result--miss'}`}>
                  <span className="wl-result-icon" aria-hidden="true">
                    {guessedRight ? <StarIcon /> : <QuestionIcon />}
                  </span>
                  <div className="wl-result-title">
                    {guessedRight ? 'Genau richtig!' : 'Nicht ganz!'}
                  </div>
                  <p className="wl-result-text">{funFact.explanation}</p>
                </div>
                <button onClick={onStart} className="wl-cta">
                  Anpfiff — los geht&rsquo;s!
                  <ArrowIcon />
                </button>
              </>
            )}
          </section>

          {/* Direkt ins Stadion */}
          {!answered && (
            <button onClick={() => { soundManager.init(); onStart() }} className="wl-skip">
              Überspringen und direkt loslegen
              <ArrowIcon />
            </button>
          )}

          {/* Sammel-Teaser: gefächerte FutCards */}
          <section className="wl-teaser">
            <div className="wl-fan" aria-hidden="true">
              {TEASER_CARDS.map(({ card, serial }, index) => (
                <div key={card.id} className={`wl-fan-card wl-fan-card--${index}`}>
                  <FutCard card={card} variant="tile" serial={serial} />
                </div>
              ))}
            </div>
            <p className="wl-teaser-line">
              <CardsIcon aria-hidden="true" />
              Sammle alle {cardsData.length} Karten!
            </p>
          </section>
        </div>
      </div>
    </StadiumScene>
  )
}

export default Welcome
