/**
 * Achievement and Badge System
 */

export const ACHIEVEMENTS = {
  // Erste Schritte
  FIRST_MATCH: {
    id: 'first_match',
    name: 'Erste Schritte',
    description: 'Dein erstes Spiel gespielt',
    emoji: '👟',
    rarity: 'common',
    condition: (progress) => progress.matchHistory.length >= 1
  },
  FIRST_WIN: {
    id: 'first_win',
    name: 'Erster Sieg',
    description: 'Dein erstes Spiel gewonnen',
    emoji: '🎉',
    rarity: 'common',
    condition: (progress) => {
      return progress.matchHistory.some(m => {
        const [msv, opp] = m.score.split(':').map(Number)
        return msv > opp
      })
    }
  },

  // Tore
  TORJAEGER_50: {
    id: 'torjaeger_50',
    name: 'Torjäger',
    description: '50 Tore geschossen',
    emoji: '⚽',
    rarity: 'common',
    condition: (progress) => progress.totalGoalsScored >= 50
  },
  TORMASCHINE_100: {
    id: 'tormaschine_100',
    name: 'Tormaschine',
    description: '100 Tore geschossen',
    emoji: '🔥',
    rarity: 'rare',
    condition: (progress) => progress.totalGoalsScored >= 100
  },
  BOMBER_200: {
    id: 'bomber_200',
    name: 'Bomber',
    description: '200 Tore geschossen',
    emoji: '💣',
    rarity: 'epic',
    condition: (progress) => progress.totalGoalsScored >= 200
  },
  LEGENDE_500: {
    id: 'legende_500',
    name: 'MSV Legende',
    description: '500 Tore geschossen',
    emoji: '👑',
    rarity: 'legendary',
    condition: (progress) => progress.totalGoalsScored >= 500
  },

  // Perfektion
  PERFEKT: {
    id: 'perfekt',
    name: 'Perfekt!',
    description: '10/10 richtig beantwortet',
    emoji: '💯',
    rarity: 'rare',
    condition: (progress) => {
      return progress.matchHistory.some(m => m.score === '10:0')
    }
  },

  // Ausdauer
  ZEBRA_FAN_10: {
    id: 'zebra_fan_10',
    name: 'Zebra-Fan',
    description: '10 Spiele gespielt',
    emoji: '🦓',
    rarity: 'common',
    condition: (progress) => progress.matchHistory.length >= 10
  },
  UNAUFHALTSAM_25: {
    id: 'unaufhaltsam_25',
    name: 'Unaufhaltsam',
    description: '25 Spiele gespielt',
    emoji: '🚀',
    rarity: 'rare',
    condition: (progress) => progress.matchHistory.length >= 25
  },
  MARATHONLAEUFER_50: {
    id: 'marathonlaeufer_50',
    name: 'Marathonläufer',
    description: '50 Spiele gespielt',
    emoji: '🏃',
    rarity: 'epic',
    condition: (progress) => progress.matchHistory.length >= 50
  },

  // Liga
  AUFSTEIGER_REGIONAL: {
    id: 'aufsteiger_regional',
    name: 'Aufsteiger',
    description: 'Regionalliga erreicht',
    emoji: '📈',
    rarity: 'common',
    condition: (progress) => progress.totalGoalsScored >= 200
  },
  ZWEITLIGA_HELD: {
    id: 'zweitliga_held',
    name: '2. Liga Held',
    description: '2. Bundesliga erreicht',
    emoji: '🥈',
    rarity: 'rare',
    condition: (progress) => progress.totalGoalsScored >= 500
  },
  BUNDESLIGA_STAR: {
    id: 'bundesliga_star',
    name: 'Bundesliga-Star',
    description: 'Bundesliga erreicht',
    emoji: '⭐',
    rarity: 'legendary',
    condition: (progress) => progress.totalGoalsScored >= 1000
  },

  // Vokabeln
  LERNER: {
    id: 'lerner',
    name: 'Lerner',
    description: '25 Vokabeln gemeistert',
    emoji: '📚',
    rarity: 'common',
    condition: (progress) => {
      return Object.values(progress.vocabProgress).filter(v => v.mastered).length >= 25
    }
  },
  WORTMEISTER: {
    id: 'wortmeister',
    name: 'Wortmeister',
    description: '50 Vokabeln gemeistert',
    emoji: '🎓',
    rarity: 'rare',
    condition: (progress) => {
      return Object.values(progress.vocabProgress).filter(v => v.mastered).length >= 50
    }
  },
  BERNARD_DIETZ: {
    id: 'bernard_dietz',
    name: 'Bernard Dietz',
    description: '100 Vokabeln gemeistert',
    emoji: '🏆',
    rarity: 'legendary',
    condition: (progress) => {
      return Object.values(progress.vocabProgress).filter(v => v.mastered).length >= 100
    }
  },

  // Besondere Erfolge
  COMEBACK_KING: {
    id: 'comeback_king',
    name: 'Comeback-King',
    description: 'Spiel nach 0:3 Rückstand gewonnen',
    emoji: '🔄',
    rarity: 'epic',
    condition: (progress) => false // Will be checked during match
  },
  DERBY_SIEGER: {
    id: 'derby_sieger',
    name: 'Derby-Sieger',
    description: 'Schalke 04 besiegt',
    emoji: '⚔️',
    rarity: 'rare',
    condition: (progress) => {
      return progress.matchHistory.some(m => {
        const [msv, opp] = m.score.split(':').map(Number)
        return m.opponent === 'Schalke 04' && msv > opp
      })
    }
  },
  GIGANTEN_BEZWINGER: {
    id: 'giganten_bezwinger',
    name: 'Giganten-Bezwinger',
    description: 'Bayern München besiegt',
    emoji: '🗡️',
    rarity: 'epic',
    condition: (progress) => {
      return progress.matchHistory.some(m => {
        const [msv, opp] = m.score.split(':').map(Number)
        return m.opponent === 'Bayern München' && msv > opp
      })
    }
  }
}

/**
 * Check which new achievements were unlocked
 * @param {Object} oldProgress - Progress before action
 * @param {Object} newProgress - Progress after action
 * @returns {Array} - Array of newly unlocked achievement objects
 */
export const checkNewAchievements = (oldProgress, newProgress) => {
  const oldAchievements = oldProgress.achievements || []
  const newlyUnlocked = []

  Object.values(ACHIEVEMENTS).forEach(achievement => {
    // Skip if already unlocked
    if (oldAchievements.includes(achievement.id)) return

    // Check if condition is met
    if (achievement.condition(newProgress)) {
      newlyUnlocked.push(achievement)
    }
  })

  return newlyUnlocked
}

/**
 * Get all unlocked achievements for a user
 * @param {Object} progress - User progress
 * @returns {Array} - Array of achievement objects
 */
export const getUnlockedAchievements = (progress) => {
  const unlockedIds = progress.achievements || []
  return Object.values(ACHIEVEMENTS).filter(a => unlockedIds.includes(a.id))
}

/**
 * Get rarity color
 * @param {string} rarity - Achievement rarity
 * @returns {string} - Tailwind color classes
 */
export const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-500 border-gray-400'
    case 'rare':
      return 'bg-blue-500 border-blue-400'
    case 'epic':
      return 'bg-purple-500 border-purple-400'
    case 'legendary':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-300'
    default:
      return 'bg-gray-500'
  }
}

/**
 * Get rarity label
 * @param {string} rarity - Achievement rarity
 * @returns {string} - German label
 */
export const getRarityLabel = (rarity) => {
  switch (rarity) {
    case 'common':
      return 'Gewöhnlich'
    case 'rare':
      return 'Selten'
    case 'epic':
      return 'Episch'
    case 'legendary':
      return 'Legendär'
    default:
      return 'Unbekannt'
  }
}
