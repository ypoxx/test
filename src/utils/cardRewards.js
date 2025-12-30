import cards from '../data/cards.json'
import facts from '../data/facts.json'
import { unlockCard, unlockFact, loadProgress } from './localStorage'

const rarityWeights = {
  common: 0.6,
  rare: 0.25,
  epic: 0.12,
  legendary: 0.03
}

const pickRarity = () => {
  const roll = Math.random()
  let cumulative = 0
  for (const [rarity, weight] of Object.entries(rarityWeights)) {
    cumulative += weight
    if (roll <= cumulative) return rarity
  }
  return 'common'
}

const pickCardForRarity = (rarity, unlockedCards) => {
  const available = cards.filter(card => card.rarity === rarity)
  const locked = available.filter(card => !unlockedCards.includes(card.id))
  const pool = locked.length > 0 ? locked : available
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

const pickFact = (unlockedFacts) => {
  const lockedFacts = facts.filter(fact => !unlockedFacts.includes(fact.id))
  const pool = lockedFacts.length > 0 ? lockedFacts : facts
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export const awardMatchRewards = ({ wonMatch, streak }) => {
  const progress = loadProgress()
  const rarity = streak >= 5 ? 'epic' : wonMatch ? pickRarity() : 'common'
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
