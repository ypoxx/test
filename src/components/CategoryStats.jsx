import vocabsData from '../data/vocabs.json'

/**
 * Category Stats - Shows progress per vocabulary category
 */
function CategoryStats({ progress }) {
  // Calculate stats per category
  const categories = ['sport', 'school', 'family', 'everyday', 'nature']
  const categoryData = categories.map(category => {
    const categoryVocabs = vocabsData.filter(v => v.category === category)
    const totalCount = categoryVocabs.length

    let masteredCount = 0
    let totalAttempts = 0
    let correctAttempts = 0
    let attemptedCount = 0

    categoryVocabs.forEach(vocab => {
      const vocabProgress = progress.vocabProgress[vocab.id]
      if (vocabProgress) {
        const correct = vocabProgress.correct || 0
        const incorrect = vocabProgress.incorrect || 0
        totalAttempts += correct + incorrect
        correctAttempts += correct
        if (correct + incorrect > 0) {
          attemptedCount++
        }
        if (vocabProgress.mastered) {
          masteredCount++
        }
      }
    })

    const masteredPercent = Math.round((masteredCount / totalCount) * 100)
    const attemptedPercent = Math.round((attemptedCount / totalCount) * 100)
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

    return {
      category,
      name: getCategoryName(category),
      emoji: getCategoryEmoji(category),
      totalCount,
      masteredCount,
      attemptedCount,
      attemptedPercent,
      masteredPercent,
      accuracy
    }
  })

  return (
    <div className="card p-6">
      <h3 className="text-2xl font-bold text-white mb-2 text-center">
        📊 Deine Kategorien
      </h3>
      <p className="text-sm text-white/70 text-center mb-6">
        Schraffiert = geübt, Vollfarbe = gemeistert (5× richtig, &gt;80%).
      </p>

      <div className="space-y-4">
        {categoryData.map((cat) => (
          <div key={cat.category} className="space-y-2">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-white font-semibold">{cat.name}</span>
              </div>
              <div className="text-sm text-white/60">
                {cat.masteredCount}/{cat.totalCount} gemeistert · {cat.attemptedCount}/{cat.totalCount} geübt
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-6 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full progress-hatched"
                style={{ width: `${cat.attemptedPercent}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-700"
                style={{ width: `${cat.masteredPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                {cat.masteredPercent}% gemeistert · {cat.attemptedPercent}% geübt · {cat.accuracy}% Genauigkeit
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getCategoryName(category) {
  const names = {
    sport: 'Sport',
    school: 'Schule',
    family: 'Familie',
    everyday: 'Alltag',
    nature: 'Natur'
  }
  return names[category] || category
}

function getCategoryEmoji(category) {
  const emojis = {
    sport: '⚽',
    school: '🏫',
    family: '👨‍👩‍👧',
    everyday: '🌍',
    nature: '🌳'
  }
  return emojis[category] || '📚'
}

export default CategoryStats
