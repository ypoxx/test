import { useState, useEffect } from 'react'
import Welcome from './components/Welcome'
import Stadium from './components/Stadium'
import Match from './components/Match'
import { loadProgress } from './utils/localStorage'
import soundManager from './utils/sounds'

function App() {
  const [gameState, setGameState] = useState('welcome') // 'welcome', 'stadium', or 'match'
  const [progress, setProgress] = useState(null)
  const [soundPromptVisible, setSoundPromptVisible] = useState(true)

  useEffect(() => {
    // Load user progress on mount
    const savedProgress = loadProgress()
    setProgress(savedProgress)
  }, [])

  const startStadium = () => {
    setGameState('stadium')
  }

  const startMatch = () => {
    setGameState('match')
  }

  const endMatch = (matchResult) => {
    setGameState('stadium')
    // Progress will be updated by Match component
    const updatedProgress = loadProgress()
    setProgress(updatedProgress)
  }

  if (!progress) {
    return (
      <div className="flex items-center justify-center min-h-screen stadium-bg">
        <div className="text-2xl text-white">Lade Spiel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen stadium-bg">
      {soundPromptVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white/95 p-6 text-center shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">Sound aktivieren?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Safari benötigt eine Nutzeraktion, damit Sound abgespielt werden darf.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                className="rounded-full bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700"
                onClick={() => {
                  soundManager.init()
                  soundManager.playIntro()
                  setSoundPromptVisible(false)
                }}
              >
                Sound aktivieren
              </button>
              <button
                className="rounded-full bg-gray-100 px-6 py-3 text-gray-700 shadow-sm transition hover:bg-gray-200"
                onClick={() => {
                  soundManager.toggle()
                  setSoundPromptVisible(false)
                }}
              >
                Weiter ohne Sound
              </button>
            </div>
          </div>
        </div>
      )}
      {gameState === 'welcome' ? (
        <Welcome onStart={startStadium} />
      ) : gameState === 'stadium' ? (
        <Stadium progress={progress} onStartMatch={startMatch} />
      ) : (
        <Match progress={progress} onMatchEnd={endMatch} />
      )}
    </div>
  )
}

export default App
