import { useState, useEffect } from 'react'
import soundManager from '../utils/sounds'
import ClubBadge from './ClubBadge'
import './MatchCountdown.css'

/**
 * Match Countdown — VS-Walkout mit ClubBadges + inszenierter 3-2-1-LOS-Countdown
 * (ZUT Phase 4, Flutlicht-Gold). Timer-/Sound-Ablauf unverändert:
 * VS-Screen (1,5 s) → 3-2-1 (je 0,8 s, playTone) → LOS (playWhistle) → onComplete.
 * Tap-to-skip bleibt erhalten (Fläche + expliziter Skip-Button).
 */
function MatchCountdown({ opponent, onComplete }) {
  const [count, setCount] = useState(3)
  const [showVS, setShowVS] = useState(true)

  const oppShort = opponent.short || String(opponent.name || '?').slice(0, 3).toUpperCase()
  const oppHue = opponent.badgeHue ?? 215

  useEffect(() => {
    const timers = []

    // Show VS screen briefly, then count down 3-2-1-LOS
    timers.push(setTimeout(() => {
      setShowVS(false)

      let currentCount = 3
      const interval = setInterval(() => {
        if (currentCount > 0) {
          setCount(currentCount)
          soundManager.playCountdownTick(currentCount)
          currentCount--
        } else {
          clearInterval(interval)
          // "LOS!" — Anpfiff-Moment (Pfiff + Crowd-Surge, Fallback: Pfiff)
          soundManager.playCountdownGo()
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

  const skipButton = (
    <button type="button" className="zut-cd__skip" onClick={onComplete}>
      Tippen zum Überspringen
    </button>
  )

  if (showVS) {
    return (
      <div className="zut-cd" onClick={onComplete}>
        {/* VS Screen */}
        <div className="zut-cd__vs">
          {/* MSV Duisburg */}
          <div className="zut-cd__team">
            <ClubBadge short="MSV" size={92} />
            <div className="zut-cd__name">MSV Duisburg</div>
            <div className="zut-cd__tag">Dein Team</div>
          </div>

          <div className="zut-cd__mid" aria-hidden="true">
            <span>VS</span>
          </div>

          {/* Opponent */}
          <div className="zut-cd__team zut-cd__team--away">
            <ClubBadge short={oppShort} hue={oppHue} size={92} />
            <div className="zut-cd__name">{opponent.name}</div>
            <div className="zut-cd__tag">Gegner</div>
          </div>
        </div>
        {skipButton}
      </div>
    )
  }

  return (
    <div className="zut-cd" onClick={onComplete}>
      {/* Countdown */}
      {count > 0 ? (
        <div className="zut-cd__digitwrap" key={count} role="timer" aria-label={`Anpfiff in ${count}`}>
          <i className="zut-cd__ring" aria-hidden="true" />
          <div className="zut-cd__digit">{count}</div>
        </div>
      ) : (
        <div className="text-center">
          <div className="zut-cd__los">LOS!</div>
          <div className="zut-cd__sub">Anpfiff — das Match beginnt</div>
        </div>
      )}
      {skipButton}
    </div>
  )
}

export default MatchCountdown
