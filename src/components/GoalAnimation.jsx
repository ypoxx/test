import { useEffect, useState } from 'react'

/**
 * Ball animation that flies into the goal when scoring
 */
function GoalAnimation({ isCorrect, onComplete }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isCorrect) {
      setShow(true)
      // Hide after animation completes
      const timer = setTimeout(() => {
        setShow(false)
        if (onComplete) onComplete()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isCorrect, onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Ball flying into goal */}
      <div className="ball-shoot absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2">
        <div className="text-6xl animate-spin-slow">
          ⚽
        </div>
      </div>

      {/* Goal flash effect */}
      <div className="goal-flash absolute inset-0 bg-green-400/30 animate-flash" />

      {/* Net shake effect (goal posts) */}
      <div className="goal-net absolute top-8 right-8 text-8xl opacity-30 animate-shake">
        🥅
      </div>
    </div>
  )
}

export default GoalAnimation
