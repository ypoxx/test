import { useState } from 'react'

function VocabCard({ vocab, options, onAnswer, currentIndex, total }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSelectAnswer = (answer) => {
    if (showFeedback) return // Prevent multiple selections

    setSelectedAnswer(answer)
    const correct = answer === vocab.german
    setIsCorrect(correct)
    setShowFeedback(true)

    // Call parent callback
    onAnswer(answer)

    // Auto-advance after 2 seconds
    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)
    }, 2000)
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Progress Indicator */}
      <div className="mb-4 text-center">
        <span className="text-white/70 text-sm">
          Vokabel {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Vocab Card */}
      <div className="card p-6 mb-6">
        {/* English Word */}
        <div className="text-center mb-6">
          <div className="text-white/70 text-sm mb-2">Englisch:</div>
          <div className="text-4xl font-bold text-white mb-4">
            {vocab.english}
          </div>
        </div>

        {/* Example Sentence */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="text-white/70 text-xs mb-1">Beispiel:</div>
          <div className="text-white/90 italic text-sm md:text-base">
            "{vocab.exampleSentence}"
          </div>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm mb-2 text-center">
            Wähle die richtige deutsche Übersetzung:
          </div>
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isCorrectOption = option === vocab.german

            let buttonClass = 'w-full px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 '

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
          className={`card p-6 text-center animate-bounce-in ${
            isCorrect ? 'bg-success/20 border-success' : 'bg-error/20 border-error'
          }`}
        >
          <div className="text-5xl mb-3">
            {isCorrect ? '⚽ TOR!' : '❌ Daneben!'}
          </div>
          <div className="text-xl font-bold mb-2">
            {isCorrect
              ? 'Richtig! MSV Duisburg schießt ein Tor!'
              : `Leider falsch. Richtig ist: "${vocab.german}"`}
          </div>
        </div>
      )}
    </div>
  )
}

export default VocabCard
