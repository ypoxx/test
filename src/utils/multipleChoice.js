/**
 * Generate plausible wrong answers for multiple choice
 * @param {Object} correctVocab - The correct vocabulary
 * @param {Array} allVocabs - All available vocabularies
 * @param {number} count - Number of wrong answers to generate (default 3)
 * @returns {Array} - Array of wrong answers
 */
export const generateWrongAnswers = (correctVocab, allVocabs, count = 3) => {
  // Filter out the correct answer
  const otherVocabs = allVocabs.filter(v => v.id !== correctVocab.id)

  // Prioritize same category for more challenging questions
  const sameCategory = otherVocabs.filter(v => v.category === correctVocab.category)

  // Prioritize similar difficulty
  const sameDifficulty = otherVocabs.filter(v => v.difficulty === correctVocab.difficulty)

  // Create a weighted pool
  const weightedPool = [
    ...sameCategory.map(v => ({ ...v, weight: 3 })), // 3x weight for same category
    ...sameDifficulty.map(v => ({ ...v, weight: 2 })), // 2x weight for same difficulty
    ...otherVocabs.map(v => ({ ...v, weight: 1 })) // 1x weight for all others
  ]

  // Remove duplicates (keep highest weight)
  const uniquePool = Object.values(
    weightedPool.reduce((acc, vocab) => {
      if (!acc[vocab.id] || acc[vocab.id].weight < vocab.weight) {
        acc[vocab.id] = vocab
      }
      return acc
    }, {})
  )

  // Shuffle the pool
  const shuffled = uniquePool.sort(() => Math.random() - 0.5)

  // Select wrong answers based on weights
  const selected = []
  for (const vocab of shuffled) {
    if (selected.length >= count) break

    // Higher weight = higher chance of selection
    const chance = vocab.weight / 3 // Max weight is 3
    if (Math.random() < chance || selected.length < count - 1) {
      selected.push(vocab.german)
    }
  }

  // Fill up if we don't have enough (safety net)
  while (selected.length < count && shuffled.length > selected.length) {
    const vocab = shuffled[selected.length]
    if (!selected.includes(vocab.german)) {
      selected.push(vocab.german)
    }
  }

  return selected.slice(0, count)
}

/**
 * Generate multiple choice options
 * @param {Object} correctVocab - The correct vocabulary
 * @param {Array} allVocabs - All available vocabularies
 * @returns {Array} - Shuffled array of 4 options
 */
export const generateMultipleChoiceOptions = (correctVocab, allVocabs) => {
  const wrongAnswers = generateWrongAnswers(correctVocab, allVocabs, 3)
  const options = [correctVocab.german, ...wrongAnswers]

  // Shuffle the options
  return shuffleArray(options)
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
