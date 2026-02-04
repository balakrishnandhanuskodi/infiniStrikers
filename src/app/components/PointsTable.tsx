import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Trophy } from "lucide-react";
import type { Match } from "./PublicFixtures";

interface TeamStanding {
  rank: number;
  team: string;
  matches: number;
  wins: number;
  losses: number;
  points: number;
  nrr: number; // Net Run Rate
}

interface PointsTableProps {
  matches: Match[];
}

// Calculate team standings from completed matches
function calculateStandings(matches: Match[]): TeamStanding[] {
  const teamStats: Record<string, {
    matches: number;
    wins: number;
    losses: number;
    runsScored: number;
    oversPlayed: number;
    runsConceded: number;
    oversBowled: number;
  }> = {};

  // Process only completed matches
  const completedMatches = matches.filter(m => m.status === "completed");

  completedMatches.forEach(match => {
    const teamA = match.teamA;
    const teamB = match.teamB;

    // Initialize team stats if not exists
    if (!teamStats[teamA]) {
      teamStats[teamA] = { matches: 0, wins: 0, losses: 0, runsScored: 0, oversPlayed: 0, runsConceded: 0, oversBowled: 0 };
    }
    if (!teamStats[teamB]) {
      teamStats[teamB] = { matches: 0, wins: 0, losses: 0, runsScored: 0, oversPlayed: 0, runsConceded: 0, oversBowled: 0 };
    }

    // Get stats
    const teamARuns = match.teamAStats?.totalRuns || 0;
    const teamBRuns = match.teamBStats?.totalRuns || 0;

    // Overs faced by Team A = overs bowled by Team B
    const teamAOversPlayed = match.teamBStats?.bowling?.reduce((sum, b) => sum + (b.overs || 0), 0) || 0;
    // Overs faced by Team B = overs bowled by Team A
    const teamBOversPlayed = match.teamAStats?.bowling?.reduce((sum, b) => sum + (b.overs || 0), 0) || 0;

    // Update match counts
    teamStats[teamA].matches += 1;
    teamStats[teamB].matches += 1;

    // Update runs and overs for NRR calculation
    teamStats[teamA].runsScored += teamARuns;
    teamStats[teamA].runsConceded += teamBRuns;
    teamStats[teamA].oversPlayed += teamAOversPlayed;
    teamStats[teamA].oversBowled += teamBOversPlayed;

    teamStats[teamB].runsScored += teamBRuns;
    teamStats[teamB].runsConceded += teamARuns;
    teamStats[teamB].oversPlayed += teamBOversPlayed;
    teamStats[teamB].oversBowled += teamAOversPlayed;

    // Determine winner (higher runs wins)
    if (teamARuns > teamBRuns) {
      teamStats[teamA].wins += 1;
      teamStats[teamB].losses += 1;
    } else if (teamBRuns > teamARuns) {
      teamStats[teamB].wins += 1;
      teamStats[teamA].losses += 1;
    }
    // If equal runs, no winner (tie) - but we're not tracking ties
  });

  // Convert to standings array
  const standings: TeamStanding[] = Object.entries(teamStats).map(([team, stats]) => {
    // Calculate NRR: (Runs Scored / Overs Played) - (Runs Conceded / Overs Bowled)
    const runRate = stats.oversPlayed > 0 ? stats.runsScored / stats.oversPlayed : 0;
    const concededRate = stats.oversBowled > 0 ? stats.runsConceded / stats.oversBowled : 0;
    const nrr = runRate - concededRate;

    return {
      rank: 0, // Will be set after sorting
      team,
      matches: stats.matches,
      wins: stats.wins,
      losses: stats.losses,
      points: stats.wins * 2, // 2 points per win
      nrr,
    };
  });

  // Sort by points (desc), then by NRR (desc)
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });

  // Assign ranks
  standings.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  return standings;
}

export function PointsTable({ matches }: PointsTableProps) {
  const standings = calculateStandings(matches);

  if (standings.length === 0) {
    return (
      <Card className="border-green-700 bg-slate-900/50 backdrop-blur">
        <CardHeader className="pb-2 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Points Table
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <p className="text-gray-400 text-xs text-center">No completed matches yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-700 bg-slate-900/50 backdrop-blur">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-800 to-slate-900">
        <CardTitle className="text-sm text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Points Table
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-800">
              <tr className="text-gray-400">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">Team</th>
                <th className="text-center py-2 px-1">M</th>
                <th className="text-center py-2 px-1">W</th>
                <th className="text-center py-2 px-1">L</th>
                <th className="text-center py-2 px-1">PTS</th>
                <th className="text-center py-2 px-2">NRR</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {standings.map((team) => (
                <tr key={team.team} className="border-t border-slate-700 hover:bg-slate-800/50">
                  <td className="py-2 px-2 text-gray-400">{team.rank}</td>
                  <td className="py-2 px-2 text-white font-medium truncate max-w-[100px]">{team.team}</td>
                  <td className="text-center py-2 px-1">{team.matches}</td>
                  <td className="text-center py-2 px-1 text-green-400">{team.wins}</td>
                  <td className="text-center py-2 px-1 text-red-400">{team.losses}</td>
                  <td className="text-center py-2 px-1 font-bold text-yellow-400">{team.points}</td>
                  <td className="text-center py-2 px-2">
                    <span className={team.nrr >= 0 ? "text-green-400" : "text-red-400"}>
                      {team.nrr >= 0 ? "+" : ""}{team.nrr.toFixed(3)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
