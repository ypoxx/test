/**
 * Match Logic Utilities
 */

// List of Bundesliga opponents
export const OPPONENTS = [
  { name: 'Bayern München', logo: '🔴⚪', difficulty: 'hard' },
  { name: 'Borussia Dortmund', logo: '🟡⚫', difficulty: 'hard' },
  { name: 'RB Leipzig', logo: '🔴⚪', difficulty: 'hard' },
  { name: 'Bayer Leverkusen', logo: '🔴⚫', difficulty: 'medium' },
  { name: 'VfB Stuttgart', logo: '⚪🔴', difficulty: 'medium' },
  { name: 'Eintracht Frankfurt', logo: '🔴⚫', difficulty: 'medium' },
  { name: 'FC Köln', logo: '⚪🔴', difficulty: 'medium' },
  { name: 'Schalke 04', logo: '🔵⚪', difficulty: 'medium' },
  { name: 'Werder Bremen', logo: '🟢⚪', difficulty: 'medium' },
  { name: 'Hamburger SV', logo: '🔵⚪', difficulty: 'medium' },
  { name: 'VfL Bochum', logo: '🔵⚪', difficulty: 'easy' },
  { name: 'Fortuna Düsseldorf', logo: '🔴⚪', difficulty: 'easy' },
  { name: 'FC St. Pauli', logo: '🟤⚪', difficulty: 'easy' },
  { name: 'Hertha BSC', logo: '🔵⚪', difficulty: 'easy' }
]

/**
 * Select a random opponent
 */
export const selectRandomOpponent = () => {
  const randomIndex = Math.floor(Math.random() * OPPONENTS.length)
  return OPPONENTS[randomIndex]
}

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
 * @param {number} correctCount - Number of correct answers
 * @param {number} totalCount - Total number of questions
 * @returns {Object} - Match result with status and score
 */
export const calculateMatchResult = (correctCount, totalCount) => {
  const opponentGoals = totalCount - correctCount
  const msvGoals = correctCount

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
      storyHook: `Maurice siegt gegen ${opponent.name}.`,
      emoji: '⚽🎊'
    }
  } else if (status === 'lose') {
    return {
      title: `😞 Niederlage`,
      message: `${opponent.name} gewinnt ${score.split(':').reverse().join(':')} gegen MSV Duisburg.`,
      storyHook: `Maurice muss sich ${opponent.name} geschlagen geben.`,
      emoji: '😔'
    }
  } else {
    return {
      title: `🤝 Unentschieden`,
      message: `MSV Duisburg spielt ${score} gegen ${opponent.name}.`,
      storyHook: `Maurice teilt die Punkte mit ${opponent.name}.`,
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
