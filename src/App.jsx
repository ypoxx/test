import { useState, useEffect } from 'react'
import Welcome from './components/Welcome'
import Stadium from './components/Stadium'
import Match from './components/Match'
import { loadProgress, loadSettings, saveSettings, resetProgress } from './utils/localStorage'
import soundManager from './utils/sounds'

function App() {
  const [gameState, setGameState] = useState('welcome') // 'welcome', 'stadium', or 'match'
  const [progress, setProgress] = useState(null)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    // Load user progress on mount
    const savedProgress = loadProgress()
    const savedSettings = loadSettings()
    setProgress(savedProgress)
    setSettings(savedSettings)
    soundManager.setEnabled(savedSettings.soundEnabled)
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

  const handleUpdateSettings = (nextSettings) => {
    const updatedSettings = saveSettings(nextSettings)
    setSettings(updatedSettings)
    soundManager.setEnabled(updatedSettings.soundEnabled)
  }

  const handleResetProgress = () => {
    const reset = resetProgress()
    setProgress(reset)
  }

  if (!progress || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen stadium-bg">
        <div className="text-2xl text-white">Lade Spiel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen stadium-bg">
      {gameState === 'welcome' ? (
        <Welcome onStart={startStadium} />
      ) : gameState === 'stadium' ? (
        <Stadium
          progress={progress}
          settings={settings}
          onStartMatch={startMatch}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
        />
      ) : (
        <Match progress={progress} onMatchEnd={endMatch} />
      )}
    </div>
  )
}

export default App
