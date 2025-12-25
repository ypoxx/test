import { useState } from 'react'

function VocabCard({ vocab, onAnswer, currentIndex, total }) {
  const [userAnswer, setUserAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!userAnswer.trim()) return

    const correct = onAnswer(userAnswer.trim())
    setIsCorrect(correct)
    setShowFeedback(true)

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      setShowFeedback(false)
      setUserAnswer('')
    }, 1500)
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
          <div className="text-3xl font-bold text-white mb-4">
            {vocab.english}
          </div>
        </div>

        {/* Example Sentence */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="text-white/70 text-xs mb-1">Beispiel:</div>
          <div className="text-white/90 italic">
            "{vocab.exampleSentence}"
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white/70 text-sm mb-2">
              Deutsche Übersetzung:
            </label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-white/20
                       text-white text-lg placeholder-white/40
                       focus:outline-none focus:border-msv-blue transition-colors"
              placeholder="Deine Antwort..."
              disabled={showFeedback}
              autoFocus
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={!userAnswer.trim() || showFeedback}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Antwort prüfen
          </button>
        </form>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div
          className={`card p-6 text-center animate-fade-in ${
            isCorrect ? 'bg-success/20 border-success' : 'bg-error/20 border-error'
          }`}
        >
          <div className="text-4xl mb-2">
            {isCorrect ? '⚽ TOR!' : '❌ Daneben!'}
          </div>
          <div className="text-xl font-bold mb-2">
            {isCorrect
              ? 'Richtig! MSV schießt ein Tor!'
              : `Leider falsch. Richtig ist: "${vocab.german}"`}
          </div>
        </div>
      )}
    </div>
  )
}

export default VocabCard
