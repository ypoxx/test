/**
 * Spaced Repetition Algorithm for selecting vocabularies.
 *
 * Every vocab carries a review interval (in days) and a due date:
 *  - answered wrong  -> interval 0, due immediately (comes back in the next matches)
 *  - answered right  -> interval grows (1 -> 3 -> 7 -> 18 -> ... capped at 60 days)
 *
 * Selection priority:
 *  1. Due words that are still being learned (wrong words beat everything)
 *  2. New, never-seen words
 *  3. Mastered words that are due for a refresh
 *  4. Everything else as filler
 */

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Next review interval in days after an answer.
 * @param {number} currentInterval - Current interval in days (0 or undefined for new/lapsed)
 * @param {boolean} wasCorrect - Whether the answer was correct
 */
export const getNextIntervalDays = (currentInterval, wasCorrect) => {
  if (!wasCorrect) return 0
  if (!currentInterval || currentInterval < 1) return 1
  return Math.min(60, Math.round(currentInterval * 2.5))
}

const isDue = (progress, now) => {
  if (!progress.dueDate) return true // legacy entries without interval data are due
  const due = new Date(progress.dueDate).getTime()
  return Number.isNaN(due) ? true : now >= due
}

const getAccuracy = (progress) => {
  const total = (progress.correct || 0) + (progress.incorrect || 0)
  return total > 0 ? (progress.correct || 0) / total : 0
}

/**
 * Calculate priority score for a vocabulary.
 * Higher score = higher priority to review.
 */
const calculatePriority = (vocab, vocabProgress, now) => {
  const progress = vocabProgress[vocab.id]

  // Never seen before
  if (!progress) {
    return 1000 + Math.random() * 100
  }

  const accuracy = getAccuracy(progress)

  if (isDue(progress, now)) {
    const dueTime = progress.dueDate ? new Date(progress.dueDate).getTime() : now
    const overdueDays = Math.max(0, (now - dueTime) / DAY_MS)

    if (progress.mastered) {
      // Refresh mastered words occasionally, but never before new/learning words
      return 300 + Math.min(20, overdueDays) * 10 + Math.random() * 20
    }

    // Due learning words (especially recently-wrong ones) beat unseen words
    return 1200 + Math.min(10, overdueDays) * 30 + (1 - accuracy) * 300 + Math.random() * 50
  }

  // Not due yet
  if (progress.mastered) {
    return 10 + Math.random() * 10
  }
  return 100 + (1 - accuracy) * 100 + Math.random() * 30
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
  const now = Date.now()

  const vocabsWithPriority = allVocabs.map(vocab => ({
    ...vocab,
    priority: calculatePriority(vocab, vocabProgress, now)
  }))

  vocabsWithPriority.sort((a, b) => b.priority - a.priority)

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
