/**
 * Spaced Repetition Algorithm for selecting vocabularies
 * Prioritizes:
 * 1. Never seen vocabs
 * 2. Vocabs not reviewed recently
 * 3. Vocabs with low accuracy
 */

/**
 * Calculate priority score for a vocabulary
 * Higher score = higher priority to review
 */
const calculatePriority = (vocab, vocabProgress) => {
  const progress = vocabProgress[vocab.id]

  // Never seen before - highest priority
  if (!progress) {
    return 1000 + Math.random() * 100 // Random component to shuffle
  }

  // Already mastered - lowest priority
  if (progress.mastered) {
    return 10 + Math.random() * 10
  }

  let score = 500

  // Factor 1: Time since last review (older = higher priority)
  if (progress.lastReviewed) {
    const daysSinceReview = (Date.now() - new Date(progress.lastReviewed).getTime()) / (1000 * 60 * 60 * 24)
    score += daysSinceReview * 20 // +20 points per day
  } else {
    score += 200 // Never reviewed but exists (edge case)
  }

  // Factor 2: Accuracy (lower accuracy = higher priority)
  const total = progress.correct + progress.incorrect
  if (total > 0) {
    const accuracy = progress.correct / total
    const accuracyBonus = (1 - accuracy) * 300 // Up to 300 points for 0% accuracy
    score += accuracyBonus
  }

  // Factor 3: Total attempts (fewer attempts = slightly higher priority for variety)
  if (total < 3) {
    score += 50
  }

  // Add randomness to avoid always same order
  score += Math.random() * 50

  return score
}

/**
 * Select vocabularies for a match using spaced repetition
 * @param {Array} allVocabs - All available vocabularies
 * @param {Object} progress - User progress object
 * @param {number} count - Number of vocabs to select (default 10)
 * @returns {Array} - Selected vocabularies
 */
export const selectVocabsForMatch = (allVocabs, progress, count = 10) => {
  if (!allVocabs || allVocabs.length === 0) {
    return []
  }

  const vocabProgress = progress?.vocabProgress || {}

  // Calculate priority for each vocab
  const vocabsWithPriority = allVocabs.map(vocab => ({
    ...vocab,
    priority: calculatePriority(vocab, vocabProgress)
  }))

  // Sort by priority (highest first)
  vocabsWithPriority.sort((a, b) => b.priority - a.priority)

  // Select top N vocabs
  const selected = vocabsWithPriority.slice(0, Math.min(count, vocabsWithPriority.length))

  // Shuffle selected vocabs so they don't appear in priority order
  return shuffleArray(selected)
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Filter vocabularies by category
 * @param {Array} allVocabs - All vocabularies
 * @param {Array} categories - Categories to include
 * @returns {Array} - Filtered vocabularies
 */
export const filterByCategory = (allVocabs, categories) => {
  if (!categories || categories.length === 0) {
    return allVocabs
  }
  return allVocabs.filter(vocab => categories.includes(vocab.category))
}

/**
 * Filter vocabularies by difficulty
 * @param {Array} allVocabs - All vocabularies
 * @param {Array} difficulties - Difficulty levels to include (1, 2, 3)
 * @returns {Array} - Filtered vocabularies
 */
export const filterByDifficulty = (allVocabs, difficulties) => {
  if (!difficulties || difficulties.length === 0) {
    return allVocabs
  }
  return allVocabs.filter(vocab => difficulties.includes(vocab.difficulty))
}

/**
 * Get statistics about vocabulary progress
 */
export const getVocabStats = (allVocabs, progress) => {
  const vocabProgress = progress?.vocabProgress || {}

  const stats = {
    total: allVocabs.length,
    neverSeen: 0,
    learning: 0,
    mastered: 0,
    totalCorrect: 0,
    totalIncorrect: 0
  }

  allVocabs.forEach(vocab => {
    const vp = vocabProgress[vocab.id]

    if (!vp) {
      stats.neverSeen++
    } else if (vp.mastered) {
      stats.mastered++
      stats.totalCorrect += vp.correct
      stats.totalIncorrect += vp.incorrect
    } else {
      stats.learning++
      stats.totalCorrect += vp.correct
      stats.totalIncorrect += vp.incorrect
    }
  })

  const total = stats.totalCorrect + stats.totalIncorrect
  stats.overallAccuracy = total > 0 ? (stats.totalCorrect / total * 100).toFixed(1) : 0

  return stats
}
