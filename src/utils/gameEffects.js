/**
 * Streak and Combo System for Match
 */

/**
 * Calculate bonus goals based on streak
 * @param {number} streak - Current correct answer streak
 * @returns {number} - Bonus goals to award
 */
export const calculateStreakBonus = (streak) => {
  if (streak >= 5) {
    return 2 // Epic streak!
  } else if (streak >= 3) {
    return 1 // Good streak!
  }
  return 0
}

/**
 * Get streak message based on current streak
 * @param {number} streak - Current streak count
 * @returns {string|null} - Message to display, or null
 */
export const getStreakMessage = (streak) => {
  if (streak >= 5) {
    return '🔥 ON FIRE! 5 in Folge! +2 Bonus-Tore!'
  } else if (streak >= 4) {
    return '⚡ MEGA! 4 richtig! Noch eins für Bonus!'
  } else if (streak >= 3) {
    return '✨ STARK! 3 in Folge! +1 Bonus-Tor!'
  } else if (streak >= 2) {
    return '💪 Gut! 2 richtig hintereinander!'
  }
  return null
}

/**
 * Get the semantic streak tier for the current streak.
 *
 * Liefert nur einen semantischen Key — kein Emoji, keine CSS-Klasse.
 * Das UI-Mapping (Farbe/Emoji) liegt in src/components/zoneStyles.js.
 *
 * @param {number} streak - Current streak count
 * @returns {'fire'|'lightning'|'sparkle'|'base'} - Semantic tier key
 */
export const getStreakTier = (streak) => {
  if (streak >= 5) return 'fire'
  if (streak >= 3) return 'lightning'
  if (streak >= 2) return 'sparkle'
  return 'base'
}

/**
 * Trigger haptic feedback (vibration) on mobile devices
 * @param {string} pattern - 'success', 'error', 'streak', 'goal'
 */
export const triggerHapticFeedback = (pattern) => {
  if (!navigator.vibrate) return

  switch (pattern) {
    case 'success':
      navigator.vibrate(50) // Short vibration
      break
    case 'error':
      navigator.vibrate([50, 50, 50]) // Three short pulses
      break
    case 'streak':
      navigator.vibrate([30, 30, 30, 30, 100]) // Build-up to celebration
      break
    case 'goal':
      navigator.vibrate([50, 30, 50, 30, 100]) // Goal celebration
      break
    case 'victory':
      navigator.vibrate([100, 50, 100, 50, 200]) // Victory celebration
      break
    default:
      navigator.vibrate(50)
  }
}
