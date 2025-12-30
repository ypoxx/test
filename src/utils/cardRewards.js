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

const pickRarity = () => rollRarity(cardsData)

const pickCardForRarity = (rarity, unlockedCards) => {
  const available = cardsData.filter(card => card.rarity === rarity)
  const locked = available.filter(card => !unlockedCards.includes(card.id))
  const pool = locked.length > 0 ? locked : available
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

const pickFact = (unlockedFacts) => {
  const lockedFacts = factsData.filter(fact => !unlockedFacts.includes(fact.id))
  const pool = lockedFacts.length > 0 ? lockedFacts : factsData
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export const shouldGrantCardReward = ({ resultStatus, streak }) => {
  return resultStatus === 'win' || streak >= 4
}

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

  return { card, isNew }
}

export const getCardCompletion = (progress) => {
  const unlockedCards = progress.unlockedCards || []
  return {
    unlockedCount: unlockedCards.length,
    totalCount: cardsData.length
  }
}

export const awardMatchRewards = ({ wonMatch, streak }) => {
  const progress = loadProgress()
  const rarity = streak >= 5 ? 'Epic' : wonMatch ? pickRarity() : 'Common'
  const card = pickCardForRarity(rarity, progress.unlockedCards || [])
  const fact = pickFact(progress.unlockedFacts || [])

  if (card) {
    unlockCard(card.id)
  }

  if (fact) {
    unlockFact(fact.id)
  }

  return {
    card,
    fact,
    rarity
  }
}
