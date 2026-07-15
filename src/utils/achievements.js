/**
 * Achievement and Badge System
 */
import { getRarity } from './rarity'

// matchHistory is capped at 20 entries, so lifetime counts must use the
// dedicated counter (with the history length as fallback for old saves).
const getMatchesPlayed = (progress) =>
  Math.max(progress.totalMatchesPlayed || 0, progress.matchHistory?.length || 0)

export const ACHIEVEMENTS = {
  // Erste Schritte
  FIRST_MATCH: {
    id: 'first_match',
    name: 'Erste Schritte',
    description: 'Dein erstes Spiel gespielt',
    emoji: '👟',
    rarity: 'common',
    condition: (progress) => getMatchesPlayed(progress) >= 1
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
    description: 'Alle Vokabeln eines Spiels richtig beantwortet',
    emoji: '💯',
    rarity: 'rare',
    condition: (progress) => {
      // Streak bonus goals inflate the own score (a perfect match ends e.g.
      // 24:0), so "perfect" means: the opponent never scored.
      return progress.matchHistory.some(m => {
        const opponentGoals = Number(m.score?.split(':')[1])
        return opponentGoals === 0 && (m.vocabsReviewed || 0) > 0
      })
    }
  },

  // Ausdauer
  ZEBRA_FAN_10: {
    id: 'zebra_fan_10',
    name: 'Zebra-Fan',
    description: '10 Spiele gespielt',
    emoji: '🦓',
    rarity: 'common',
    condition: (progress) => getMatchesPlayed(progress) >= 10
  },
  UNAUFHALTSAM_25: {
    id: 'unaufhaltsam_25',
    name: 'Unaufhaltsam',
    description: '25 Spiele gespielt',
    emoji: '🚀',
    rarity: 'rare',
    condition: (progress) => getMatchesPlayed(progress) >= 25
  },
  MARATHONLAEUFER_50: {
    id: 'marathonlaeufer_50',
    name: 'Marathonläufer',
    description: '50 Spiele gespielt',
    emoji: '🏃',
    rarity: 'epic',
    condition: (progress) => getMatchesPlayed(progress) >= 50
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

  // Saison
  SAISON_KAEMPFER: {
    id: 'saison_kaempfer',
    name: 'Saison-Kämpfer',
    description: 'Eine komplette Saison (34 Spieltage) gespielt',
    emoji: '📅',
    rarity: 'rare',
    condition: (progress) => (progress.seasonHistory || []).length >= 1
  },
  EUROPAPOKAL: {
    id: 'europapokal',
    name: 'Europapokal',
    description: 'Eine Saison in den Top 7 abgeschlossen',
    emoji: '🌍',
    rarity: 'epic',
    condition: (progress) => (progress.seasonHistory || []).some(s => s.rank <= 7)
  },
  DEUTSCHER_MEISTER: {
    id: 'deutscher_meister',
    name: 'Deutscher Meister',
    description: 'Eine Saison auf Platz 1 abgeschlossen',
    emoji: '🏆',
    rarity: 'legendary',
    condition: (progress) => (progress.seasonHistory || []).some(s => s.rank === 1)
  },

  // Besondere Erfolge
  COMEBACK_KING: {
    id: 'comeback_king',
    name: 'Comeback-King',
    description: 'Spiel nach 0:3 Rückstand gewonnen',
    emoji: '🔄',
    rarity: 'epic',
    condition: (progress) => {
      return progress.matchHistory.some(match => match.comebackWin)
    }
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
 * Get the semantic rarity tier (Single Source of Truth: utils/rarity.js).
 *
 * Liefert nur einen semantischen Key — das UI-Mapping (Badge-Klassen)
 * liegt in src/components/zoneStyles.js (getRarityBadgeClass).
 *
 * @param {string} rarity - Achievement rarity ('common'|'rare'|'epic'|'legendary')
 * @returns {'bronze'|'silver'|'gold'|'holo'} - Semantic tier key
 */
export const getRarityTier = (rarity) => getRarity(rarity).tier

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
