import { useState, useEffect } from 'react'
import VocabCard from './VocabCard'
import ScoreDisplay from './ScoreDisplay'
import vocabsData from '../data/vocabs.json'
import { selectVocabsForMatch } from '../utils/spacedRepetition'
import { selectRandomOpponent, checkAnswer, calculateMatchResult, getMatchSummaryMessage } from '../utils/matchLogic'
import { updateVocabProgress, updateGoalsAndLeague, addMatchToHistory } from '../utils/localStorage'

function Match({ progress, onMatchEnd }) {
  const [opponent] = useState(selectRandomOpponent())
  const [vocabs, setVocabs] = useState([])
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0)
  const [msvGoals, setMsvGoals] = useState(0)
  const [opponentGoals, setOpponentGoals] = useState(0)
  const [matchFinished, setMatchFinished] = useState(false)
  const [matchResult, setMatchResult] = useState(null)

  useEffect(() => {
    // Select vocabs for this match using spaced repetition
    const selectedVocabs = selectVocabsForMatch(vocabsData, progress, 10)
    setVocabs(selectedVocabs)
  }, [progress])

  const handleAnswer = (userAnswer) => {
    const currentVocab = vocabs[currentVocabIndex]
    const isCorrect = checkAnswer(userAnswer, currentVocab.german)

    // Update vocab progress
    updateVocabProgress(currentVocab.id, isCorrect)

    // Update score
    if (isCorrect) {
      setMsvGoals(prev => prev + 1)
    } else {
      setOpponentGoals(prev => prev + 1)
    }

    // Move to next vocab after a delay
    setTimeout(() => {
      if (currentVocabIndex < vocabs.length - 1) {
        setCurrentVocabIndex(prev => prev + 1)
      } else {
        // Match finished
        finishMatch(isCorrect)
      }
    }, 1500)

    return isCorrect
  }

  const finishMatch = (lastAnswerCorrect) => {
    const finalMsvGoals = lastAnswerCorrect ? msvGoals + 1 : msvGoals
    const finalOpponentGoals = lastAnswerCorrect ? opponentGoals : opponentGoals + 1

    const result = calculateMatchResult(finalMsvGoals, vocabs.length)

    // Update progress
    updateGoalsAndLeague(finalMsvGoals)
    addMatchToHistory({
      opponent: opponent.name,
      score: result.score,
      vocabsReviewed: vocabs.length,
      goalsScored: finalMsvGoals
    })

    setMatchResult(result)
    setMatchFinished(true)
  }

  const handleContinue = () => {
    onMatchEnd(matchResult)
  }

  if (vocabs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-white">Vokabeln werden geladen...</div>
      </div>
    )
  }

  if (matchFinished && matchResult) {
    const summary = getMatchSummaryMessage(matchResult, opponent)

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Result Card */}
          <div className="card p-8 text-center mb-6">
            <div className="text-6xl mb-4">{summary.emoji}</div>
            <h2 className="text-3xl font-bold mb-2">{summary.title}</h2>
            <p className="text-xl mb-6">{summary.message}</p>

            {/* Final Score */}
            <div className="bg-white/10 rounded-lg p-6 mb-6">
              <ScoreDisplay
                msvGoals={matchResult.msvGoals}
                opponentGoals={matchResult.opponentGoals}
                opponent={opponent}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl font-bold text-goal">{matchResult.msvGoals}</div>
                <div className="text-sm text-white/70">Tore geschossen</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{matchResult.accuracy}%</div>
                <div className="text-sm text-white/70">Genauigkeit</div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="btn-primary w-full"
            >
              Zurück zum Stadion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4 pt-20">
      {/* Header with Score */}
      <div className="fixed top-0 left-0 right-0 bg-field-green/95 backdrop-blur-sm p-4 z-10 border-b border-white/10">
        <ScoreDisplay
          msvGoals={msvGoals}
          opponentGoals={opponentGoals}
          opponent={opponent}
        />
      </div>

      {/* Vocab Card */}
      <div className="flex-1 flex items-center justify-center">
        <VocabCard
          vocab={vocabs[currentVocabIndex]}
          onAnswer={handleAnswer}
          currentIndex={currentVocabIndex}
          total={vocabs.length}
        />
      </div>
    </div>
  )
}

export default Match
