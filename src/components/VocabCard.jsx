import { useState } from 'react'
import soundManager from '../utils/sounds'
import { ANSWER_DELAY_CORRECT, ANSWER_DELAY_WRONG } from '../utils/matchLogic'
import './VocabCard.css'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/* Check-/Kreuz-Glyphen als Inline-SVG — richtig/falsch nie nur über Farbe */
function CheckGlyph() {
  return (
    <svg width="15" height="12" viewBox="0 0 15 12" aria-hidden="true">
      <path
        d="M1.5 6.5 5.5 10.5 13.5 1.5"
        fill="none"
        stroke="#0B2C1C"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CrossGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M1.5 1.5 10.5 10.5 M10.5 1.5 1.5 10.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* Hebt das abgefragte Wort im Beispielsatz golden hervor (best effort:
   Wortstamm-Präfix, damit auch flektierte Formen wie "scores" treffen). */
function highlightSentence(sentence, word) {
  if (!sentence || !word) return sentence
  const stem = word.replace(/^to\s+/i, '').split(/[\s,/]/)[0]
  if (stem.length < 3) return sentence
  const prefix = stem.slice(0, Math.max(3, stem.length - 2)).toLowerCase()
  return sentence.split(/(\s+)/).map((token, index) => {
    const clean = token.replace(/[^A-Za-zÄÖÜäöüß]/g, '').toLowerCase()
    return clean && clean.startsWith(prefix) ? <b key={index}>{token}</b> : token
  })
}

/**
 * VocabCard — der Lern-Loop als Spielszene (ZUT Phase 4, Flutlicht-Gold).
 *
 * Vertrag mit Match.jsx (unverändert):
 *   { vocab, options, direction, onAnswer, currentIndex, total, extraTime }
 *
 * initialAnswer ist ein optionaler Dev-Prop (nur PreviewLoop): startet die
 * Karte direkt im Feedback-Zustand, ohne den Produktions-Flow zu berühren.
 */
function VocabCard({ vocab, options, direction = 'en-de', onAnswer, currentIndex, total, extraTime = false, initialAnswer = null }) {
  const isDeEn = direction === 'de-en'
  const question = isDeEn ? vocab.german : vocab.english
  const correctOption = isDeEn ? vocab.english : vocab.german

  const [selectedAnswer, setSelectedAnswer] = useState(initialAnswer)
  const [showFeedback, setShowFeedback] = useState(initialAnswer !== null)
  const [isCorrect, setIsCorrect] = useState(initialAnswer !== null && initialAnswer === correctOption)

  const handleSelectAnswer = (answer) => {
    if (showFeedback) return // Prevent multiple selections

    // Initialize sound on first user click (browsers require a gesture)
    if (!soundManager.initialized) {
      soundManager.init()
    }

    setSelectedAnswer(answer)
    const correct = answer === correctOption
    setIsCorrect(correct)
    setShowFeedback(true)

    // Call parent callback
    onAnswer(answer)

    // Reset once the parent advances to the next question
    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)
    }, correct ? ANSWER_DELAY_CORRECT : ANSWER_DELAY_WRONG)
  }

  const wordClass = question.length > 14 ? 'vc-word vc-word--long' : 'vc-word'

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-2">
      {/* Fortschritt: Gold-Segmente */}
      <div className="vc-prog">
        <div className="vc-prog-label">
          <span className="vc-prog-kicker">{extraTime ? 'NACHSPIELZEIT' : 'VOKABEL'}</span>
          <span className="vc-prog-count">
            {currentIndex + 1}&thinsp;/&thinsp;{total}
          </span>
        </div>
        <div className="vc-segs" aria-hidden="true">
          {Array.from({ length: total }, (_, index) => (
            <i key={index} className={index <= currentIndex ? 'vc-seg vc-seg--on' : 'vc-seg'} />
          ))}
        </div>
      </div>

      {/* Frage-Bühne: Stadion-Schild */}
      <div className="vc-stage">
        <div className="vc-coach">
          <span className="vc-coach-pic">
            <img src="/img/mascot.webp" alt="" />
          </span>
          <span className="vc-kicker">{isDeEn ? 'WIE HEISST AUF ENGLISCH …' : 'WAS BEDEUTET …'}</span>
        </div>
        <div className={wordClass} lang={isDeEn ? 'de' : 'en'}>
          {question}
        </div>
        {/* Beispielsatz nur, wenn das englische Wort gezeigt wird */}
        {!isDeEn && vocab.exampleSentence && (
          <>
            <div className="vc-rule" />
            <p className="vc-sentence" lang="en">
              &bdquo;{highlightSentence(vocab.exampleSentence, vocab.english)}&ldquo;
            </p>
          </>
        )}
      </div>

      {/* Antworten: Metallschilder mit Letter-Chips */}
      <div className="vc-answers">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option
          const isCorrectOption = option === correctOption

          let buttonClass = 'vc-answer'
          let glyph = null
          let srHint = null
          if (showFeedback) {
            if (isCorrectOption) {
              buttonClass += ' vc-answer--correct'
              if (isSelected) buttonClass += ' vc-answer--picked'
              glyph = <CheckGlyph />
              srHint = 'richtige Antwort'
            } else if (isSelected) {
              buttonClass += ' vc-answer--wrong'
              glyph = <CrossGlyph />
              srHint = 'falsche Antwort'
            } else {
              buttonClass += ' vc-answer--dim'
            }
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectAnswer(option)}
              disabled={showFeedback}
              className={buttonClass}
            >
              <span className="vc-akey" aria-hidden="true">{LETTERS[index] || index + 1}</span>
              <span className="vc-atext">{option}</span>
              {glyph && <span className="vc-glyph">{glyph}</span>}
              {srHint && <span className="sr-only">({srHint})</span>}
            </button>
          )
        })}
      </div>

      {/* Ergebnis-Banner (kompakt, ohne Emoji) */}
      <div role="status" aria-live="polite">
        {showFeedback && (
          isCorrect ? (
            <div className="vc-banner vc-banner--goal">
              <span className="vc-banner-title">Tor!</span>
              <span className="vc-banner-sub">Volltreffer f&uuml;r den MSV!</span>
            </div>
          ) : (
            <div className="vc-banner vc-banner--miss">
              <span className="vc-banner-title vc-banner-title--miss">Daneben</span>
              <span className="vc-banner-sub">Richtig w&auml;re: &bdquo;{correctOption}&ldquo;</span>
              <span className="vc-banner-vocab">
                {isDeEn ? vocab.german : vocab.english} = {correctOption}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default VocabCard
