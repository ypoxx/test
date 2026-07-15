import ClubBadge from './ClubBadge'
import './ScoreDisplay.css'

/**
 * ScoreDisplay — Broadcast-Lower-Third (ZUT-Umbau Phase 4).
 *
 * Bestehender Prop-Vertrag bleibt erhalten: { msvGoals, opponentGoals, opponent }.
 * Additiv (optional, alle Aufrufer ohne diese Props sehen nur die nackte Bar):
 *   minute — Spielminuten-Label (z. B. "62′" oder "90+2′"); zeigt den Gold-Chip
 *   streak — aktuelle Serie; ab 2 erscheint der "SERIE ×N"-Chip mit Flamme
 *   final  — Ergebnis-Screen: Gold-Chip zeigt "ENDE" statt Minute
 */

const FlameIcon = () => (
  <svg width="10" height="14" viewBox="0 0 11 15" fill="currentColor" aria-hidden="true">
    <path d="M5.5 0C7 2.8 10 5 10 9.2 10 12.4 8 15 5.5 15 3 15 1 12.9 1 9.9 1 7.6 2.2 6 3.4 4.6c.2 1.2.7 2 1.6 2.5C4.6 4.8 4.8 2.3 5.5 0z" />
  </svg>
)

function ScoreDisplay({ msvGoals, opponentGoals, opponent, minute = null, streak = 0, final = false }) {
  const oppShort = opponent.short || String(opponent.name || '?').slice(0, 3).toUpperCase()
  const oppHue = opponent.badgeHue ?? 215
  const showChip = final || minute

  return (
    <div
      className="zut-sb"
      role="status"
      aria-label={`Spielstand: MSV Duisburg ${msvGoals}, ${opponent.name} ${opponentGoals}${streak >= 2 ? `, Serie ${streak}` : ''}`}
    >
      <div className="zut-sb__bar" aria-hidden="true">
        {/* MSV Duisburg */}
        <div className="zut-sb__seg zut-sb__team">
          <ClubBadge short="MSV" size={26} />
          <span className="zut-sb__code">MSV</span>
        </div>

        {/* Score mit Doppelkontur + Punch-Tick */}
        <div className="zut-sb__seg zut-sb__score">
          <span key={`h-${msvGoals}`} className="zut-sb__num zut-sb__num--tick">{msvGoals}</span>
          <span className="zut-sb__colon">:</span>
          <span key={`a-${opponentGoals}`} className="zut-sb__num zut-sb__num--tick">{opponentGoals}</span>
        </div>

        {/* Gegner */}
        <div className="zut-sb__seg zut-sb__team">
          <span className="zut-sb__code">{oppShort}</span>
          <ClubBadge short={oppShort} hue={oppHue} size={26} />
        </div>

        {/* Spielminuten-Chip */}
        {showChip && (
          <div className="zut-sb__seg zut-sb__min">
            <div>
              {final ? (
                <small>ENDE</small>
              ) : (
                <>
                  <b>{minute}</b>
                  <small>MIN</small>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SERIE ×N */}
      {streak >= 2 && (
        <div className="zut-sb__streak" aria-hidden="true">
          <FlameIcon />
          <span>SERIE ×{streak}</span>
        </div>
      )}
    </div>
  )
}

export default ScoreDisplay
