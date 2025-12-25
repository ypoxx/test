import { useEffect, useState } from 'react'

/**
 * Confetti explosion effect for victories
 */
function ConfettiExplosion({ trigger }) {
  const [confetti, setConfetti] = useState([])

  useEffect(() => {
    if (trigger) {
      // Generate confetti pieces
      const pieces = []
      const colors = ['#FFD700', '#1E40AF', '#FFFFFF', '#10B981', '#EF4444', '#8B5CF6']
      const emojis = ['⚽', '🎉', '⭐', '💙', '🏆', '✨']

      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          size: 20 + Math.random() * 20,
          rotation: Math.random() * 360
        })
      }

      setConfetti(pieces)

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setConfetti([])
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [trigger])

  if (confetti.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti absolute"
          style={{
            left: `${piece.left}%`,
            top: '-10%',
            fontSize: `${piece.size}px`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`
          }}
        >
          {piece.emoji}
        </div>
      ))}
    </div>
  )
}

export default ConfettiExplosion
