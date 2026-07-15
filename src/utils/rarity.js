/**
 * Raritäten — Single Source of Truth für das "Zebra Ultimate Team"-Design.
 *
 * Mapping der bestehenden Karten-Raritäten (cards.json: "Common" | "Rare" |
 * "Epic" | "Legendary") auf die ZUT-Folien-Tiers aus der Design-Richtung A
 * ("Flutlicht-Gold"): Bronze / Silber / Gold / Legendär-Holo.
 *
 * Phase 1: Nur Datenschicht — Komponenten werden erst in Phase 4 umgestellt.
 * UI-Styles (CSS-Klassen, Farben) gehören NICHT hierher, sondern in die
 * Komponenten-Schicht; hier gibt es nur semantische Keys.
 */

/**
 * @typedef {Object} Rarity
 * @property {string} key   - Kanonischer Karten-Raritätskey (wie in cards.json)
 * @property {string} label - Deutsches UI-Label (Folien-Name)
 * @property {string} tier  - Semantischer Folien-Tier: 'bronze' | 'silver' | 'gold' | 'holo'
 */

/** @type {Record<string, Rarity>} */
export const RARITIES = {
  Common: { key: 'Common', label: 'Bronze', tier: 'bronze' },
  Rare: { key: 'Rare', label: 'Silber', tier: 'silver' },
  Epic: { key: 'Epic', label: 'Gold', tier: 'gold' },
  Legendary: { key: 'Legendary', label: 'Legendär', tier: 'holo' }
}

/** Reihenfolge vom häufigsten zum seltensten Tier. */
export const RARITY_ORDER = ['Common', 'Rare', 'Epic', 'Legendary']

/**
 * Rarität nachschlagen — case-insensitiv, damit sowohl Karten-Keys
 * ("Common") als auch Achievement-Keys ("common") funktionieren.
 *
 * @param {string} key - Raritätskey, z.B. 'Common', 'rare', 'LEGENDARY'
 * @returns {Rarity} Die Rarität; unbekannte Keys fallen auf Common (Bronze) zurück.
 */
export const getRarity = (key) => {
  if (typeof key === 'string') {
    const normalized = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
    if (RARITIES[normalized]) return RARITIES[normalized]
  }
  return RARITIES.Common
}
