import cardsData from '../data/cards.json'
import factsData from '../data/facts.json'
import { loadProgress, unlockCard, unlockFact } from './localStorage'

export const CARD_RARITIES = ['Common', 'Rare', 'Epic', 'Legendary']

const RARITY_WEIGHTS = {
  Common: 60,
  Rare: 25,
  Epic: 12,
  Legendary: 3
}

const getAvailableRarities = (cards) => {
  const available = new Set(cards.map(card => card.rarity))
  return CARD_RARITIES.filter(rarity => available.has(rarity))
}

const rollRarity = (cards) => {
  const availableRarities = getAvailableRarities(cards)
  const totalWeight = availableRarities.reduce(
    (sum, rarity) => sum + (RARITY_WEIGHTS[rarity] || 0),
    0
  )
  let roll = Math.random() * totalWeight

  for (const rarity of availableRarities) {
    roll -= RARITY_WEIGHTS[rarity]
    if (roll <= 0) {
      return rarity
    }
  }

  return availableRarities[0]
}

const pickRandomCard = (cards) => {
  const rarity = rollRarity(cards)
  const candidates = cards.filter(card => card.rarity === rarity)
  const pool = candidates.length > 0 ? candidates : cards
  return pool[Math.floor(Math.random() * pool.length)]
}

const pickFact = (unlockedFacts) => {
  const lockedFacts = factsData.filter(fact => !unlockedFacts.includes(fact.id))
  if (lockedFacts.length === 0) return null
  return lockedFacts[Math.floor(Math.random() * lockedFacts.length)]
}

export const shouldGrantCardReward = ({ resultStatus, streak }) => {
  return resultStatus === 'win' || streak >= 4
}

/**
 * The single card reward per match: one card for a win (or a strong streak
 * in a lost match), plus one new football fact as long as there are locked
 * facts left. Returns null when no reward was earned.
 */
export const rollCardReward = ({ resultStatus, streak }) => {
  if (!shouldGrantCardReward({ resultStatus, streak })) {
    return null
  }

  const progress = loadProgress()
  const unlockedCards = progress.unlockedCards || []
  const lockedCards = cardsData.filter(card => !unlockedCards.includes(card.id))

  const selectionPool = lockedCards.length > 0 ? lockedCards : cardsData
  const card = pickRandomCard(selectionPool)
  const isNew = !unlockedCards.includes(card.id)

  if (isNew) {
    unlockCard(card.id)
  }

  const fact = pickFact(progress.unlockedFacts || [])
  if (fact) {
    unlockFact(fact.id)
  }

  return { card, isNew, fact }
}

export const getCardCompletion = (progress) => {
  const unlockedCards = progress.unlockedCards || []
  return {
    unlockedCount: unlockedCards.length,
    totalCount: cardsData.length
  }
}
