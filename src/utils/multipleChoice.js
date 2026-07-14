/**
 * Multiple choice option generation.
 * Supports both quiz directions:
 *  - 'en-de' (default): question shows the English word, options are German
 *  - 'de-en': question shows the German word, options are English
 */

/**
 * Split a vocab value like "rennen, laufen" or "Saison/Spielzeit"
 * into normalized alternatives.
 */
const splitAlternatives = (value) =>
  String(value)
    .split(/[,/]/)
    .map(part => part.trim().toLowerCase())
    .filter(Boolean)

/**
 * Two answers collide if they share at least one alternative
 * (e.g. "schießen" collides with "treten, schießen"). Colliding
 * distractors would be a second "correct" option in disguise.
 */
const collides = (a, b) => {
  const alternativesA = splitAlternatives(a)
  return splitAlternatives(b).some(alt => alternativesA.includes(alt))
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
 * Generate plausible wrong answers for multiple choice
 * @param {Object} correctVocab - The correct vocabulary
 * @param {Array} allVocabs - All available vocabularies
 * @param {number} count - Number of wrong answers to generate (default 3)
 * @param {string} field - Which side of the vocab to use ('german' or 'english')
 * @returns {Array} - Array of wrong answers
 */
export const generateWrongAnswers = (correctVocab, allVocabs, count = 3, field = 'german') => {
  const correctValue = correctVocab[field]

  // Exclude the vocab itself and anything that would also be a correct answer
  const otherVocabs = allVocabs.filter(
    v => v.id !== correctVocab.id && !collides(v[field], correctValue)
  )

  const sameCategory = otherVocabs.filter(v => v.category === correctVocab.category)
  const sameDifficulty = otherVocabs.filter(
    v => v.category !== correctVocab.category && v.difficulty === correctVocab.difficulty
  )
  const rest = otherVocabs.filter(
    v => v.category !== correctVocab.category && v.difficulty !== correctVocab.difficulty
  )

  // Same-category distractors first (harder, more plausible), then same difficulty
  const candidates = [
    ...shuffleArray(sameCategory),
    ...shuffleArray(sameDifficulty),
    ...shuffleArray(rest)
  ]

  const selected = []
  for (const vocab of candidates) {
    if (selected.length >= count) break
    const value = vocab[field]
    if (!selected.some(existing => collides(existing, value))) {
      selected.push(value)
    }
  }

  return selected
}

/**
 * Generate multiple choice options
 * @param {Object} correctVocab - The correct vocabulary
 * @param {Array} allVocabs - All available vocabularies
 * @param {string} direction - 'en-de' (German options) or 'de-en' (English options)
 * @returns {Array} - Shuffled array of 4 options
 */
export const generateMultipleChoiceOptions = (correctVocab, allVocabs, direction = 'en-de') => {
  const field = direction === 'de-en' ? 'english' : 'german'
  const wrongAnswers = generateWrongAnswers(correctVocab, allVocabs, 3, field)
  const options = [correctVocab[field], ...wrongAnswers]

  return shuffleArray(options)
}
