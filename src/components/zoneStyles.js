/**
 * UI-Mapping für semantische Keys aus der Logik-Schicht (Phase 1 "Fundament").
 *
 * Die Utils (season.js, achievements.js) liefern nur noch semantische Keys —
 * hier werden sie auf Tailwind-Klassen abgebildet. Farben entsprechen 1:1 dem
 * Stand vor dem Refactoring; die ZUT-Neugestaltung folgt in Phase 4.
 */

/** Tabellen-Zonen (season.js getRankZone → zone) → Textfarbe. */
export const ZONE_STYLES = {
  champions: { text: 'text-yellow-300' },
  promotion: { text: 'text-blue-300' },
  europa: { text: 'text-emerald-300' },
  midtable: { text: 'text-white' },
  relegation: { text: 'text-red-300' }
}

/**
 * @param {'champions'|'promotion'|'europa'|'midtable'|'relegation'} zone
 * @returns {{ text: string }}
 */
export const getZoneStyle = (zone) => ZONE_STYLES[zone] || ZONE_STYLES.midtable

/** Streak-Tiers (gameEffects.js getStreakTier) → Textfarbe + Emoji. */
export const STREAK_STYLES = {
  fire: { text: 'text-orange-500', emoji: '🔥' },
  lightning: { text: 'text-yellow-400', emoji: '⚡' },
  sparkle: { text: 'text-blue-400', emoji: '✨' },
  base: { text: 'text-white', emoji: '⚽' }
}

/**
 * @param {'fire'|'lightning'|'sparkle'|'base'} tier
 * @returns {{ text: string, emoji: string }}
 */
export const getStreakStyle = (tier) => STREAK_STYLES[tier] || STREAK_STYLES.base

/** Raritäts-Tiers (rarity.js → tier) → Badge-Klassen für Achievements. */
export const RARITY_TIER_BADGE = {
  bronze: 'bg-gray-500 border-gray-400',
  silver: 'bg-blue-500 border-blue-400',
  gold: 'bg-purple-500 border-purple-400',
  holo: 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-300'
}

/**
 * @param {'bronze'|'silver'|'gold'|'holo'} tier
 * @returns {string} Tailwind-Klassen für das Raritäts-Badge
 */
export const getRarityBadgeClass = (tier) => RARITY_TIER_BADGE[tier] || RARITY_TIER_BADGE.bronze
