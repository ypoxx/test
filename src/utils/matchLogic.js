/**
 * Match Logic Utilities
 */

// List of Bundesliga opponents
export const OPPONENTS = [
  { name: 'Bayern München', logo: '🔴⚪', difficulty: 'hard' },
  { name: 'Borussia Dortmund', logo: '🟡⚫', difficulty: 'hard', isDerby: true },
  { name: 'RB Leipzig', logo: '🔴⚪', difficulty: 'hard' },
  { name: 'Bayer Leverkusen', logo: '🔴⚫', difficulty: 'medium' },
  { name: 'VfB Stuttgart', logo: '⚪🔴', difficulty: 'medium' },
  { name: 'Eintracht Frankfurt', logo: '🔴⚫', difficulty: 'medium' },
  { name: 'FC Köln', logo: '⚪🔴', difficulty: 'medium' },
  { name: 'Schalke 04', logo: '🔵⚪', difficulty: 'medium', isDerby: true },
  { name: 'Werder Bremen', logo: '🟢⚪', difficulty: 'medium' },
  { name: 'Hamburger SV', logo: '🔵⚪', difficulty: 'medium' },
  { name: 'VfL Bochum', logo: '🔵⚪', difficulty: 'easy' },
  { name: 'Fortuna Düsseldorf', logo: '🔴⚪', difficulty: 'easy', isDerby: true },
  { name: 'FC St. Pauli', logo: '🟤⚪', difficulty: 'easy' },
  { name: 'Hertha BSC', logo: '🔵⚪', difficulty: 'easy' }
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
  vocabsPerMatch: 10,
  passingScore: 6 // 6/10 correct = Win
}

/**
 * Check if answer is correct (case-insensitive, trimmed)
 * Accepts multiple valid answers separated by comma or slash
 */
export const checkAnswer = (userAnswer, correctAnswer) => {
  const normalize = (str) => str.toLowerCase().trim()

  const userNormalized = normalize(userAnswer)

  // Split correct answer by comma or slash to handle multiple valid answers
  const validAnswers = correctAnswer
    .split(/[,/]/)
    .map(answer => normalize(answer))

  // Check if user answer matches any valid answer
  return validAnswers.some(validAnswer => {
    // Exact match
    if (userNormalized === validAnswer) return true

    // Allow slight variations (e.g., "laufen" matches "rennen, laufen")
    return validAnswer.includes(userNormalized) || userNormalized.includes(validAnswer)
  })
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
