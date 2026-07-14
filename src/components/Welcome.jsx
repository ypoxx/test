import { useState } from 'react'
import { getPersonalGreeting, getRandomFunFact, getRandomPrompt } from '../utils/funFacts'

function Welcome({ onStart }) {
  const [funFact] = useState(getRandomFunFact())
  const [greeting] = useState(getPersonalGreeting())
  const [prompt] = useState(getRandomPrompt())
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer)
    setAnswered(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 stadium-bg">
      <div className="w-full max-w-2xl">
        {/* Greeting Card */}
        <div className="card p-8 text-center mb-6 animate-slide-up">
          <img
            src="/img/mascot.webp"
            alt="Zebra-Maskottchen"
            className="w-32 h-32 mx-auto mb-4 rounded-full object-cover border-2 border-msv-blue-bright shadow-lg"
            onError={(event) => { event.currentTarget.style.display = 'none' }}
          />
          <h1 className="text-4xl font-extrabold text-white mb-2 uppercase tracking-wide">
            {greeting} Maurice!
          </h1>
          <p className="text-xl text-white/70">
            Willkommen beim MSV Vokabel-Trainer
          </p>
        </div>

        {/* Fun Fact Card */}
        <div className="card p-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-6">
            <div className="text-3xl mb-3">💡</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Wusstest du schon, dass...
            </h2>
            <p className="text-lg text-white/90 leading-relaxed mb-6">
              {funFact.fact}
            </p>
          </div>

          {!answered ? (
            <div className="space-y-3">
              <p className="text-white/70 text-center mb-3">
                {prompt}
              </p>
              <button
                onClick={() => handleAnswer(true)}
                className="btn-primary w-full bg-success hover:bg-green-600"
              >
                ✓ Das ist richtig
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="btn-secondary btn-secondary--soft w-full bg-error hover:bg-red-600"
              >
                ✗ Das ist falsch
              </button>
            </div>
          ) : (
            <>
              <div
                className={`p-6 rounded-lg text-center animate-bounce-in ${
                  selectedAnswer === funFact.isTrue
                    ? 'bg-success/20 border-2 border-success'
                    : 'bg-error/20 border-2 border-error'
                }`}
              >
                <div className="text-5xl mb-3">
                  {selectedAnswer === funFact.isTrue ? '🎉' : '🤔'}
                </div>
                <div className="text-xl font-bold text-white mb-3">
                  {selectedAnswer === funFact.isTrue
                    ? 'Genau richtig!'
                    : 'Nicht ganz!'}
                </div>
                <p className="text-white/90 leading-relaxed">
                  {funFact.explanation}
                </p>
              </div>
              <button
                onClick={onStart}
                className="btn-primary btn-primary--hero w-full mt-4 animate-pulse-glow"
              >
                Los geht's! 🚀
              </button>
            </>
          )}
        </div>

        {/* Skip straight into the stadium */}
        {!answered && (
          <button
            onClick={onStart}
            className="w-full mt-4 text-white/60 hover:text-white text-sm py-2"
          >
            Überspringen und direkt loslegen →
          </button>
        )}
      </div>
    </div>
  )
}

export default Welcome
