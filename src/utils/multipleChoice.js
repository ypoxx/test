/**
 * Multiple choice option generation.
 * Supports both quiz directions:
 *  - 'en-de' (default): question shows the English word, options are German
 *  - 'de-en': question shows the German word, options are English
 */

/**
 * Split a vocab value like "rennen, laufen" or "Saison/Spielzeit" into
 * normalized alternatives. Verb triples are reduced to their base form
 * BEFORE the alternative split, so the slash inside
 * "be – was/were – been" doesn't leak past-tense forms as alternatives.
 */
const splitAlternatives = (value) =>
  String(value)
    .split('–')[0]
    .split(/[,/]/)
    .map(part => part.trim().toLowerCase())
    .filter(Boolean)

/**
 * Reduce an alternative to its core word, so that different spellings of
 * the same word count as equal: "tragen (Kleidung)" → "tragen",
 * "to save" → "save".
 */
const toLemma = (alternative) =>
  alternative
    .replace(/\s*\([^)]*\)/g, '')
    .trim()
    .replace(/^to\s+/, '')

/**
 * Two answers collide if they share at least one alternative
 * (e.g. "schießen" collides with "treten, schießen"). Comparison happens
 * on lemma level, so "to wear", "wear – wore – worn" and
 * "tragen (Kleidung)" vs. "tragen" collide too. Colliding distractors
 * would be a second "correct" option in disguise.
 */
const collides = (a, b) => {
  const lemmasA = splitAlternatives(a).map(toLemma).filter(Boolean)
  return splitAlternatives(b)
    .map(toLemma)
    .filter(Boolean)
    .some(lemma => lemmasA.includes(lemma))
}

/**
 * Synonym pairs that share no word string, so collides() cannot detect
 * them — but for a question about one of them the other would also be a
 * correct answer (e.g. "Prüfung" → "exam" AND "test"). These pairs must
 * never appear together in one question.
 */
const CONFLICT_PAIRS = [
  ['vocab_087', 'vocab_107'], // test / exam — beide "Prüfung"
  ['vocab_105', 'vocab_140'], // timetable / schedule — beide "Stundenplan/Zeitplan"
  ['vocab_268', 'vocab_269'], // city / town — beide "Stadt"
  ['vocab_307', 'vocab_308'], // lake / sea — "See" ist beides
  ['vocab_308', 'vocab_309'], // sea / ocean — beide "Meer"
]

const inConflict = (idA, idB) =>
  CONFLICT_PAIRS.some(([x, y]) => (x === idA && y === idB) || (x === idB && y === idA))

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
  const otherField = field === 'german' ? 'english' : 'german'

  // Exclude the vocab itself and anything that would also be a correct
  // answer. A distractor must differ on BOTH sides — e.g. for the question
  // "essen" neither "to eat" nor "eat – ate – eaten" may appear as a wrong
  // option, because both share the German meaning.
  const otherVocabs = allVocabs.filter(
    v => v.id !== correctVocab.id
      && !inConflict(v.id, correctVocab.id)
      && !collides(v[field], correctValue)
      && !collides(v[otherField], correctVocab[otherField])
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
