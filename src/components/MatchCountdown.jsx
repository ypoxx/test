import { useState, useEffect } from 'react'
import soundManager from '../utils/sounds'

/**
 * Match Countdown - Epic 3-2-1-LOS animation before match starts
 */
function MatchCountdown({ opponent, onComplete }) {
  const [count, setCount] = useState(3)
  const [showVS, setShowVS] = useState(true)

  useEffect(() => {
    const timers = []

    // Show VS screen briefly, then count down 3-2-1-LOS
    timers.push(setTimeout(() => {
      setShowVS(false)

      let currentCount = 3
      const interval = setInterval(() => {
        if (currentCount > 0) {
          setCount(currentCount)
          soundManager.playTone(400 + (currentCount * 100), 0.1, 'square', 0.3)
          currentCount--
        } else {
          clearInterval(interval)
          // Play final "LOS!" sound — referee kickoff whistle
          soundManager.playWhistle()
          setCount(0)

          // Complete after showing LOS
          timers.push(setTimeout(() => {
            onComplete()
          }, 800))
        }
      }, 800)
      timers.push(interval)
    }, 1500))

    // Cleanup so a tap-to-skip doesn't leave timers/sounds running
    return () => timers.forEach(timer => {
      clearTimeout(timer)
      clearInterval(timer)
    })
  }, [])

  if (showVS) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in"
        onClick={onComplete}
      >
        <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-sm">
          Tippen zum Überspringen
        </div>
        {/* VS Screen */}
        <div className="w-full max-w-4xl px-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* MSV Duisburg */}
            <div className="text-center animate-slide-up">
              <div className="text-6xl mb-4">🔵⚪</div>
              <div className="text-2xl font-bold text-white mb-2">
                MSV Duisburg
              </div>
              <div className="text-white/60">Dein Team</div>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="text-8xl font-bold text-yellow-400 animate-pulse-glow">
                VS
              </div>
            </div>

            {/* Opponent */}
            <div className="text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="text-6xl mb-4">{opponent.logo}</div>
              <div className="text-2xl font-bold text-white mb-2">
                {opponent.name}
              </div>
              <div className="text-white/60">Gegner</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onComplete}
    >
      <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-sm">
        Tippen zum Überspringen
      </div>
      {/* Countdown */}
      {count > 0 ? (
        <div className="text-center animate-bounce-in" key={count}>
          <div
            className="text-[20rem] font-bold text-yellow-400"
            style={{
              textShadow: '0 0 40px rgba(250, 204, 21, 0.8), 0 0 80px rgba(250, 204, 21, 0.4)',
              animation: 'pulse 0.8s ease-out'
            }}
          >
            {count}
          </div>
        </div>
      ) : (
        <div className="text-center animate-bounce-in">
          <div
            className="text-[12rem] font-bold text-green-400"
            style={{
              textShadow: '0 0 40px rgba(34, 197, 94, 0.8), 0 0 80px rgba(34, 197, 94, 0.4)',
              animation: 'pulse 0.8s ease-out'
            }}
          >
            LOS!
          </div>
          <div className="text-2xl text-white/80 mt-4">
            ⚽ Match startet...
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchCountdown
