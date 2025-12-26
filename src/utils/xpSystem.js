/**
 * XP and Level System for Maurice's Vocab Trainer
 */

// XP required for each level (exponential growth)
const XP_PER_LEVEL = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  450,    // Level 4
  700,    // Level 5
  1000,   // Level 6
  1350,   // Level 7
  1750,   // Level 8
  2200,   // Level 9
  2700,   // Level 10
  3250,   // Level 11
  3850,   // Level 12
  4500,   // Level 13
  5200,   // Level 14
  5950,   // Level 15
  6750,   // Level 16
  7600,   // Level 17
  8500,   // Level 18
  9450,   // Level 19
  10450,  // Level 20
  11500,  // Level 21
  12600,  // Level 22
  13750,  // Level 23
  14950,  // Level 24
  16200,  // Level 25
  17500,  // Level 26
  18850,  // Level 27
  20250,  // Level 28
  21700,  // Level 29
  23200   // Level 30 (max)
]

/**
 * Calculate level from total XP
 * @param {number} xp - Total XP
 * @returns {number} - Current level
 */
export const calculateLevel = (xp) => {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) {
      return i + 1
    }
  }
  return 1
}

/**
 * Get XP required for next level
 * @param {number} currentLevel - Current level
 * @returns {number} - XP required for next level
 */
export const getXPForNextLevel = (currentLevel) => {
  if (currentLevel >= XP_PER_LEVEL.length) {
    return XP_PER_LEVEL[XP_PER_LEVEL.length - 1]
  }
  return XP_PER_LEVEL[currentLevel]
}

/**
 * Get XP required for current level
 * @param {number} currentLevel - Current level
 * @returns {number} - XP required for current level
 */
export const getXPForCurrentLevel = (currentLevel) => {
  if (currentLevel <= 1) return 0
  return XP_PER_LEVEL[currentLevel - 2]
}

/**
 * Calculate XP progress percentage for current level
 * @param {number} totalXP - Total XP earned
 * @param {number} currentLevel - Current level
 * @returns {number} - Progress percentage (0-100)
 */
export const getXPProgressPercent = (totalXP, currentLevel) => {
  const currentLevelXP = getXPForCurrentLevel(currentLevel)
  const nextLevelXP = getXPForNextLevel(currentLevel)
  const xpInLevel = totalXP - currentLevelXP
  const xpNeeded = nextLevelXP - currentLevelXP

  if (xpNeeded <= 0) return 100

  return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
}

/**
 * Get remaining XP for next level
 * @param {number} totalXP - Total XP earned
 * @param {number} currentLevel - Current level
 * @returns {number} - XP remaining to next level
 */
export const getXPToNextLevel = (totalXP, currentLevel) => {
  const nextLevelXP = getXPForNextLevel(currentLevel)
  return Math.max(0, nextLevelXP - totalXP)
}

/**
 * Calculate XP reward for correct answer
 * @param {number} streak - Current streak
 * @param {number} difficulty - Vocab difficulty (1-3)
 * @returns {number} - XP to award
 */
export const calculateXPReward = (streak = 0, difficulty = 1) => {
  let baseXP = 10

  // Difficulty bonus
  baseXP += (difficulty - 1) * 5

  // Streak bonus
  if (streak >= 5) baseXP += 10
  else if (streak >= 3) baseXP += 5

  return baseXP
}

/**
 * Get level title based on level
 * @param {number} level - Current level
 * @returns {string} - Level title
 */
export const getLevelTitle = (level) => {
  if (level >= 30) return '🏆 Legende'
  if (level >= 25) return '⭐ Superstar'
  if (level >= 20) return '💎 Meister'
  if (level >= 15) return '🔥 Profi'
  if (level >= 10) return '⚡ Fortgeschritten'
  if (level >= 5) return '🎯 Talentiert'
  return '🌟 Anfänger'
}

/**
 * Get level color based on level
 * @param {number} level - Current level
 * @returns {string} - Tailwind color classes
 */
export const getLevelColor = (level) => {
  if (level >= 30) return 'text-yellow-400'
  if (level >= 25) return 'text-purple-400'
  if (level >= 20) return 'text-blue-400'
  if (level >= 15) return 'text-green-400'
  if (level >= 10) return 'text-cyan-400'
  if (level >= 5) return 'text-white'
  return 'text-gray-300'
}
