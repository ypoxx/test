import { useState } from 'react'
import GoalAnimation from './GoalAnimation'
import soundManager from '../utils/sounds'
import { ANSWER_DELAY_CORRECT, ANSWER_DELAY_WRONG } from '../utils/matchLogic'

function VocabCard({ vocab, options, direction = 'en-de', onAnswer, currentIndex, total, extraTime = false }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const isDeEn = direction === 'de-en'
  const question = isDeEn ? vocab.german : vocab.english
  const correctOption = isDeEn ? vocab.english : vocab.german

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

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-2">
      {/* Progress Indicator */}
      <div className="mb-2 text-center">
        <span className="text-white/70 text-xs">
          {extraTime ? 'Nachspielzeit' : 'Vokabel'} {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Vocab Card */}
      <div className="card p-4 mb-3">
        {/* Question Word */}
        <div className="text-center mb-3">
          <div className="text-white/70 text-xs mb-1">{isDeEn ? 'Deutsch:' : 'Englisch:'}</div>
          <div className="text-2xl md:text-3xl font-bold text-white mb-2">
            {question}
          </div>
        </div>

        {/* Example Sentence (only helpful when the English word is shown) */}
        {!isDeEn && (
          <div className="bg-white/5 rounded-lg p-2 mb-3">
            <div className="text-white/70 text-xs mb-1">Beispiel:</div>
            <div className="text-white/90 italic text-xs md:text-sm">
              "{vocab.exampleSentence}"
            </div>
          </div>
        )}

        {/* Multiple Choice Options */}
        <div className="space-y-2">
          <div className="text-white/70 text-xs mb-1 text-center">
            {isDeEn ? 'Wähle das richtige englische Wort:' : 'Wähle die richtige deutsche Übersetzung:'}
          </div>
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isCorrectOption = option === correctOption

            let buttonClass = 'w-full px-4 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 '

            if (!showFeedback) {
              // Before answer
              buttonClass += 'bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-msv-blue text-white active:scale-95'
            } else if (isSelected && isCorrect) {
              // Selected and correct
              buttonClass += 'bg-success border-2 border-success text-white scale-105 shadow-lg'
            } else if (isSelected && !isCorrect) {
              // Selected and wrong
              buttonClass += 'bg-error border-2 border-error text-white'
            } else if (isCorrectOption) {
              // Show correct answer
              buttonClass += 'bg-success/50 border-2 border-success text-white'
            } else {
              // Other options (dimmed)
              buttonClass += 'bg-white/5 border-2 border-white/10 text-white/50'
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                disabled={showFeedback}
                className={buttonClass}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div
          className={`card p-4 text-center animate-bounce-in ${
            isCorrect ? 'bg-success/20 border-success' : 'bg-error/20 border-error'
          }`}
        >
          <div className="text-4xl mb-2">
            {isCorrect ? '⚽ TOR!' : '❌ Daneben!'}
          </div>
          <div className="text-base md:text-lg font-bold">
            {isCorrect
              ? 'Richtig! MSV Duisburg schießt ein Tor!'
              : `Leider falsch. Richtig ist: "${correctOption}"`}
          </div>
          {!isCorrect && (
            <div className="text-sm text-white/70 mt-2">
              {isDeEn ? vocab.german : vocab.english} = {correctOption}
            </div>
          )}
        </div>
      )}

      {/* Goal Animation */}
      <GoalAnimation isCorrect={showFeedback && isCorrect} />
    </div>
  )
}

export default VocabCard
