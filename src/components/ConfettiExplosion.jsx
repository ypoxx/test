import { useEffect, useState } from 'react'
import './ConfettiExplosion.css'

/**
 * Confetti explosion effect for victories — kleine CSS-Rechtecke in
 * Vereinsfarben (MSV-Blau/Weiß/Gold) statt Emoji-Spans (ZUT Phase 4).
 * Bei prefers-reduced-motion werden 0 Teilchen erzeugt.
 */

const CLUB_COLORS = ['#005CA9', '#0A7AD1', '#FFFFFF', '#FFCB2D', '#FFE27A']
const PIECE_COUNT = 60

function ConfettiExplosion({ trigger }) {
  const [confetti, setConfetti] = useState([])

  useEffect(() => {
    if (!trigger) return undefined

    // Reduced Motion: keine Teilchen (zusätzlich versteckt das CSS die Ebene)
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setConfetti([])
      return undefined
    }

    const pieces = Array.from({ length: PIECE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.4,
      color: CLUB_COLORS[i % CLUB_COLORS.length],
      width: 5 + Math.random() * 5,
      height: 9 + Math.random() * 8,
      drift: (Math.random() * 2 - 1) * 120,
      rotation: Math.round(Math.random() * 360),
      spin: Math.round(360 + Math.random() * 540)
    }))

    setConfetti(pieces)

    // Clear confetti after animation
    const timer = setTimeout(() => {
      setConfetti([])
    }, 4500)

    return () => clearTimeout(timer)
  }, [trigger])

  if (confetti.length === 0) return null

  return (
    <div className="zut-confetti" aria-hidden="true">
      {confetti.map((piece) => (
        <span
          key={piece.id}
          className="zut-confetti__piece"
          style={{
            left: `${piece.left}%`,
            width: `${piece.width}px`,
            height: `${piece.height}px`,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            '--zut-rot0': `${piece.rotation}deg`,
            '--zut-drift': `${piece.drift}px`,
            '--zut-spin': `${piece.spin}deg`
          }}
        />
      ))}
    </div>
  )
}

export default ConfettiExplosion
