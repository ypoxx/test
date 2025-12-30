import { useState } from 'react'
import LeagueProgress from './LeagueProgress'
import TrophyCase from './TrophyCase'
import FactAlbum from './FactAlbum'
import XPBar from './XPBar'
import CategoryStats from './CategoryStats'
import soundManager from '../utils/sounds'
import { getVocabStats } from '../utils/spacedRepetition'
import vocabsData from '../data/vocabs.json'

function Stadium({ progress, onStartMatch }) {
  const stats = getVocabStats(vocabsData, progress)
  const [showTrophyCase, setShowTrophyCase] = useState(false)
  const [showFactAlbum, setShowFactAlbum] = useState(false)

  const testSound = () => {
    // Initialize if not already
    if (!soundManager.initialized) {
      soundManager.init()
    }
    // Play test sound
    soundManager.playGoal()
    console.log('🔊 Sound test clicked!')
    console.log('   - Initialized:', soundManager.initialized)
    console.log('   - Enabled:', soundManager.enabled)
    console.log('   - AudioContext:', soundManager.audioContext)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 stadium-scene field-pattern relative overflow-hidden">
      {/* Floodlights */}
      <div className="floodlight top-10 left-10" />
      <div className="floodlight top-10 right-10" />

      {/* Crowd silhouette at top */}
      <div className="crowd-silhouette absolute top-0 left-0 right-0 flex justify-around items-end px-4">
        <div className="crowd-wave text-6xl opacity-40">👤👤👤</div>
        <div className="crowd-wave text-6xl opacity-40">👤👤👤</div>
        <div className="crowd-wave text-6xl opacity-40">👤👤👤</div>
        <div className="crowd-wave text-6xl opacity-40">👤👤👤</div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            ⚽ Vokabel-Trainer
          </h1>
          <p className="text-xl text-white/80">
            MSV Duisburg Edition
          </p>
        </div>

        {/* XP and Level */}
        <div className="mb-6">
          <XPBar xp={progress.xp || 0} level={progress.level || 1} />
        </div>

        {/* League Progress */}
        <div className="mb-6">
          <LeagueProgress totalGoals={progress.totalGoalsScored} />
        </div>

        {/* Start Match Button */}
        <button
          onClick={onStartMatch}
          className="btn-primary w-full mb-3 text-xl py-4"
        >
          ⚽ Neues Spiel starten
        </button>

        {/* Trophy Case Button */}
        <button
          onClick={() => setShowTrophyCase(true)}
          className="btn-secondary w-full mb-3 text-lg py-3"
        >
          🏆 Meine Trophäen ({progress.achievements?.length || 0})
        </button>

        <button
          onClick={() => setShowFactAlbum(true)}
          className="btn-secondary w-full mb-3 text-lg py-3"
        >
          📚 Sammelalbum ({progress.unlockedFacts?.length || 0})
        </button>

        {/* Sound Test Button */}
        <button
          onClick={testSound}
          className="btn-secondary w-full mb-6 text-base py-3 bg-purple-600 hover:bg-purple-700"
        >
          🔊 Sound testen
        </button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.mastered}
            </div>
            <div className="text-sm text-white/70">Gemeistert</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.learning}
            </div>
            <div className="text-sm text-white/70">Am Lernen</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.neverSeen}
            </div>
            <div className="text-sm text-white/70">Noch nicht gelernt</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.overallAccuracy}%
            </div>
            <div className="text-sm text-white/70">Genauigkeit</div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="mb-6">
          <CategoryStats progress={progress} />
        </div>

        {/* Recent Matches */}
        {progress.matchHistory && progress.matchHistory.length > 0 && (
          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              📋 Letzte Spiele
            </h3>
            <div className="space-y-2">
              {progress.matchHistory.slice(0, 5).map((match, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-3 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {match.score.split(':')[0] > match.score.split(':')[1]
                        ? '✅'
                        : match.score.split(':')[0] < match.score.split(':')[1]
                        ? '❌'
                        : '🤝'}
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        vs {match.opponent}
                      </div>
                      <div className="text-white/60 text-sm">
                        {new Date(match.date).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </div>
                  <div className="text-white font-bold text-lg">
                    {match.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/50 text-sm">
          Made with ⚽ for Maurice
        </div>
      </div>

      {/* Trophy Case Modal */}
      {showTrophyCase && (
        <TrophyCase
          unlockedAchievementIds={progress.achievements || []}
          onClose={() => setShowTrophyCase(false)}
        />
      )}

      {showFactAlbum && (
        <FactAlbum
          unlockedFactIds={progress.unlockedFacts || []}
          onClose={() => setShowFactAlbum(false)}
        />
      )}
    </div>
  )
}

export default Stadium
