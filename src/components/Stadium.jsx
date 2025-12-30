import { useState } from 'react'
import LeagueProgress from './LeagueProgress'
import TrophyCase from './TrophyCase'
import XPBar from './XPBar'
import CategoryStats from './CategoryStats'
import CardAlbum from './CardAlbum'
import { getVocabStats } from '../utils/spacedRepetition'
import vocabsData from '../data/vocabs.json'
import { getLeagueProgress } from '../utils/localStorage'

function Stadium({ progress, onStartMatch }) {
  const stats = getVocabStats(vocabsData, progress)
  const [showTrophyCase, setShowTrophyCase] = useState(false)
  const leagueInfo = getLeagueProgress(progress.totalGoalsScored || 0)
  const { currentLeagueInfo, nextLeagueInfo, goalsNeeded } = leagueInfo
  const [showAlbum, setShowAlbum] = useState(false)

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
            ⚽ Wort-Liga
          </h1>
          <p className="text-xl text-white/80">
            MSV Duisburg Edition
          </p>
          <p className="text-sm text-white/60 mt-2">
            Scoute neue Wörter • Transfer-Wörter freischalten
          </p>
        </div>

        {/* XP and Level */}
        <div className="mb-6">
          <XPBar xp={progress.xp || 0} level={progress.level || 1} />
        </div>

        {/* League Progress */}
        <div className="mb-6">
          <div className="card p-5 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-msv-blue/40 to-goal/20 border border-goal/40">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{currentLeagueInfo.emoji}</div>
              <div>
                <div className="text-sm uppercase tracking-wide text-white/70">Aktuelle Liga</div>
                <div className="text-2xl font-bold text-white">{currentLeagueInfo.name}</div>
              </div>
            </div>
            <div className="text-center sm:text-right">
              {nextLeagueInfo ? (
                <>
                  <div className="text-sm text-white/70">Ziel</div>
                  <div className="text-xl font-semibold text-goal">
                    Noch {goalsNeeded} Tore bis {nextLeagueInfo.name}
                  </div>
                </>
              ) : (
                <div className="text-xl font-semibold text-goal">Bundesliga erreicht!</div>
              )}
            </div>
          </div>
          <LeagueProgress totalGoals={progress.totalGoalsScored} />
        </div>

        {/* Start Match Button */}
        <button
          onClick={onStartMatch}
          className="btn-primary btn-primary--hero w-full mb-4"
        >
          ⚽ Match starten
        </button>

        {/* Trophy Case Button */}
        <button
          onClick={() => setShowTrophyCase(true)}
          className="btn-secondary btn-secondary--soft w-full mb-3 text-lg py-3"
        >
          🏆 Meine Trophäen ({progress.achievements?.length || 0})
        </button>

        {/* Card Album Button */}
        <button
          onClick={() => setShowAlbum(true)}
          className="btn-secondary btn-secondary--soft w-full mb-3 text-lg py-3 bg-emerald-600 hover:bg-emerald-700"
        >
          📘 Kartenalbum ({progress.unlockedCards?.length || 0})
        </button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.mastered}
            </div>
            <div className="text-sm text-white/70">Top-Form</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.learning}
            </div>
            <div className="text-sm text-white/70">Im Training</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.neverSeen}
            </div>
            <div className="text-sm text-white/70">Noch nicht im Kader</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.overallAccuracy}%
            </div>
            <div className="text-sm text-white/70">Team-Stärke</div>
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

      {showAlbum && (
        <CardAlbum
          progress={progress}
          onClose={() => setShowAlbum(false)}
        />
      )}
    </div>
  )
}

export default Stadium
