import { LEAGUE_THRESHOLDS } from '../utils/localStorage'

const getStreakCopy = (streak) => {
  if (streak >= 5) {
    return {
      title: `🔥 ${streak}er-Serie!`,
      text: 'Maurice ist nicht zu stoppen.'
    }
  }

  if (streak >= 3) {
    return {
      title: `⚡ ${streak} in Folge!`,
      text: 'Der Lauf bleibt heiß.'
    }
  }

  return {
    title: `✨ ${streak}er-Streak`,
    text: 'Maurice sammelt weiter Punkte.'
  }
}

function ShareCard({ streak, leagueKey, achievement, showMauriceBadge = false }) {
  const leagueInfo = leagueKey ? LEAGUE_THRESHOLDS[leagueKey] : null

  const shareContent = (() => {
    if (achievement) {
      return {
        title: `${achievement.emoji || '🏆'} ${achievement.name}`,
        text: achievement.description || 'Neues Achievement freigeschaltet.'
      }
    }

    if (leagueInfo) {
      return {
        title: `${leagueInfo.emoji} ${leagueInfo.name}`,
        text: `Maurice spielt jetzt in der ${leagueInfo.name}.`
      }
    }

    if (streak) {
      return getStreakCopy(streak)
    }

    return {
      title: 'Teile deinen Erfolg!',
      text: 'Zeig deinen Freunden, wie stark du bist.'
    }
  })()

  return (
    <div className="card p-6 text-center space-y-3">
      <h3 className="text-2xl font-bold text-white">{shareContent.title}</h3>
      <p className="text-base text-white/80">{shareContent.text}</p>

      {showMauriceBadge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm text-white/80">
          <span className="text-lg">🦓</span>
          <span>Maurice aus Mülheim</span>
        </div>
      )}
    </div>
  )
}

export default ShareCard
