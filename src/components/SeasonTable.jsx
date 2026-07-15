import { getStandings, getRankZone, MATCHDAYS } from '../utils/season'
import { getZoneStyle } from './zoneStyles'

/**
 * League table modal for the current season.
 */
function SeasonTable({ season, onClose }) {
  const standings = getStandings(season)
  const playedMatchdays = Math.min(season.currentMatchday - 1, MATCHDAYS)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl card p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
          aria-label="Schließen"
        >
          ✕
        </button>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">📊 Tabelle</h2>
          <p className="text-white/70 text-sm">
            Saison {season.seasonNumber} · Spieltag {playedMatchdays}/{MATCHDAYS}
          </p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/60 text-xs uppercase tracking-wide">
              <th className="text-left py-2 pr-2">#</th>
              <th className="text-left py-2">Team</th>
              <th className="text-center py-2 px-1">Sp</th>
              <th className="text-center py-2 px-1 hidden sm:table-cell">S</th>
              <th className="text-center py-2 px-1 hidden sm:table-cell">U</th>
              <th className="text-center py-2 px-1 hidden sm:table-cell">N</th>
              <th className="text-center py-2 px-1">Diff</th>
              <th className="text-right py-2 pl-1">Pkt</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(row => {
              const zone = getRankZone(row.rank)
              return (
                <tr
                  key={row.name}
                  className={`border-t border-white/10 ${
                    row.isMSV ? 'bg-msv-blue/40 font-bold' : ''
                  }`}
                >
                  <td className={`py-2 pr-2 ${getZoneStyle(zone.zone).text}`}>{row.rank}</td>
                  <td className="py-2">
                    <span className="mr-1">{row.logo}</span>
                    <span className={row.isMSV ? 'text-goal' : 'text-white'}>{row.name}</span>
                  </td>
                  <td className="text-center py-2 px-1 text-white/70">{row.played}</td>
                  <td className="text-center py-2 px-1 text-white/70 hidden sm:table-cell">{row.wins}</td>
                  <td className="text-center py-2 px-1 text-white/70 hidden sm:table-cell">{row.draws}</td>
                  <td className="text-center py-2 px-1 text-white/70 hidden sm:table-cell">{row.losses}</td>
                  <td className="text-center py-2 px-1 text-white/70">
                    {row.diff > 0 ? `+${row.diff}` : row.diff}
                  </td>
                  <td className="text-right py-2 pl-1 font-bold">{row.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-4 text-xs text-white/50 space-y-1">
          <div>🏆 Platz 1: Meister · ⭐ 2-4: Champions League · 🌍 5-7: Europa League</div>
          <div>⚠️ Platz 16-18: Abstiegszone</div>
        </div>
      </div>
    </div>
  )
}

export default SeasonTable
