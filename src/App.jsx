import { useState, useEffect } from 'react'
import Stadium from './components/Stadium'
import Match from './components/Match'
import { loadProgress } from './utils/localStorage'

function App() {
  const [gameState, setGameState] = useState('stadium') // 'stadium' or 'match'
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    // Load user progress on mount
    const savedProgress = loadProgress()
    setProgress(savedProgress)
  }, [])

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
        <div className="text-2xl">Lade Spiel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen stadium-bg">
      {gameState === 'stadium' ? (
        <Stadium progress={progress} onStartMatch={startMatch} />
      ) : (
        <Match progress={progress} onMatchEnd={endMatch} />
      )}
    </div>
  )
}

export default App
