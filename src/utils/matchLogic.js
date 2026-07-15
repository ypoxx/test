/**
 * Match Logic Utilities
 */

// Opponent clubs (17 opponents + MSV = 18 teams -> 34 season matchdays)
// `short` (Kurzcode) + `badgeHue` (0-360, Grundfarbe für SVG-Badges) sind
// additiv für das ZUT-Redesign; das `logo`-Emoji bleibt für Alt-Konsumenten.
export const OPPONENTS = [
  { name: 'Bayern München', logo: '🔴⚪', difficulty: 'hard', short: 'FCB', badgeHue: 350 },
  { name: 'Borussia Dortmund', logo: '🟡⚫', difficulty: 'hard', isDerby: true, short: 'BVB', badgeHue: 48 },
  { name: 'RB Leipzig', logo: '🔴⚪', difficulty: 'hard', short: 'RBL', badgeHue: 356 },
  { name: 'Bayer Leverkusen', logo: '🔴⚫', difficulty: 'medium', short: 'B04', badgeHue: 2 },
  { name: 'VfB Stuttgart', logo: '⚪🔴', difficulty: 'medium', short: 'VFB', badgeHue: 348 },
  { name: 'Eintracht Frankfurt', logo: '🔴⚫', difficulty: 'medium', short: 'SGE', badgeHue: 5 },
  { name: 'FC Köln', logo: '⚪🔴', difficulty: 'medium', short: 'KOE', badgeHue: 352 },
  { name: 'Schalke 04', logo: '🔵⚪', difficulty: 'medium', isDerby: true, short: 'S04', badgeHue: 217 },
  { name: 'Werder Bremen', logo: '🟢⚪', difficulty: 'medium', short: 'SVW', badgeHue: 140 },
  { name: 'Hamburger SV', logo: '🔵⚪', difficulty: 'medium', short: 'HSV', badgeHue: 210 },
  { name: 'Borussia Mönchengladbach', logo: '⚫⚪', difficulty: 'medium', isDerby: true, short: 'BMG', badgeHue: 145 },
  { name: 'SC Freiburg', logo: '⚫🔴', difficulty: 'medium', short: 'SCF', badgeHue: 10 },
  { name: 'VfL Bochum', logo: '🔵⚪', difficulty: 'easy', isDerby: true, short: 'BOC', badgeHue: 222 },
  { name: 'Fortuna Düsseldorf', logo: '🔴⚪', difficulty: 'easy', isDerby: true, short: 'F95', badgeHue: 358 },
  { name: 'FC St. Pauli', logo: '🟤⚪', difficulty: 'easy', short: 'STP', badgeHue: 25 },
  { name: 'Hertha BSC', logo: '🔵⚪', difficulty: 'easy', short: 'BSC', badgeHue: 205 },
  { name: '1. FC Union Berlin', logo: '🔴⚪', difficulty: 'easy', short: 'FCU', badgeHue: 12 }
]

/**
 * Select a random opponent
 */
export const selectRandomOpponent = (lastOpponentName = null, filterFn = null) => {
  const pool = filterFn ? OPPONENTS.filter(filterFn) : OPPONENTS
  if (pool.length <= 1) {
    return pool[0] || OPPONENTS[0]
  }

  let opponent = null

  do {
    const randomIndex = Math.floor(Math.random() * pool.length)
    opponent = pool[randomIndex]
  } while (opponent?.name === lastOpponentName)

  return opponent
}

export const getDerbyOpponents = () => OPPONENTS.filter(opponent => opponent.isDerby)

/**
 * Constants for match configuration
 */
export const MATCH_CONFIG = {
  vocabsPerMatch: 10
}

// How long the answer feedback stays visible before the next question.
// Wrong answers get more time so the correction can actually be read.
export const ANSWER_DELAY_CORRECT = 2000
export const ANSWER_DELAY_WRONG = 3500

/**
 * Check if answer is correct (case-insensitive, trimmed)
 * Accepts multiple valid answers separated by comma or slash.
 * Uses exact matching only — substring matching would let a wrong
 * multiple-choice option count as a goal while the UI shows "Daneben!".
 */
export const checkAnswer = (userAnswer, correctAnswer) => {
  const normalize = (str) => String(str).toLowerCase().trim()

  const userNormalized = normalize(userAnswer)

  const validAnswers = String(correctAnswer)
    .split(/[,/]/)
    .map(answer => normalize(answer))
    .filter(Boolean)

  return userNormalized === normalize(correctAnswer) || validAnswers.includes(userNormalized)
}

/**
 * Calculate match result
 * @param {number} msvGoals - Goals scored by MSV (including bonuses)
 * @param {number} correctCount - Number of correct answers
 * @param {number} totalCount - Total number of questions
 * @returns {Object} - Match result with status and score
 */
export const calculateMatchResult = (msvGoals, correctCount, totalCount) => {
  const opponentGoals = totalCount - correctCount

  let status = 'draw'
  if (msvGoals > opponentGoals) {
    status = 'win'
  } else if (msvGoals < opponentGoals) {
    status = 'lose'
  }

  return {
    status, // 'win', 'lose', 'draw'
    msvGoals,
    opponentGoals,
    score: `${msvGoals}:${opponentGoals}`,
    accuracy: Math.round((correctCount / totalCount) * 100)
  }
}

/**
 * Generate match summary message
 */
export const getMatchSummaryMessage = (result, opponent) => {
  const { status, score } = result

  if (status === 'win') {
    return {
      title: `🎉 Sieg!`,
      message: `MSV Duisburg schlägt ${opponent.name} mit ${score}!`,
      emoji: '⚽🎊'
    }
  } else if (status === 'lose') {
    return {
      title: `😞 Niederlage`,
      message: `${opponent.name} gewinnt ${score.split(':').reverse().join(':')} gegen MSV Duisburg.`,
      emoji: '😔'
    }
  } else {
    return {
      title: `🤝 Unentschieden`,
      message: `MSV Duisburg spielt ${score} gegen ${opponent.name}.`,
      emoji: '🤝'
    }
  }
}

/**
 * Generate celebration message based on streak
 */
export const getCelebrationMessage = (streak) => {
  if (streak >= 5) {
    return '🔥 Incredible! 5 in a row!'
  } else if (streak >= 3) {
    return '⚡ On fire! 3 correct!'
  } else if (streak >= 2) {
    return '✨ Great! Keep going!'
  }
  return null
}
