import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Calendar, Clock, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export interface BattingStats {
  player: string;
  ones: number;   // singles
  twos: number;   // doubles
  fours: number;  // boundaries
  extras: number; // runs due to no-ball/wide
  balls: number;
  runs: number;   // auto-calculated: (ones × 1) + (twos × 2) + (fours × 4) + extras
}

export interface BowlingStats {
  player: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
}

export interface TeamStats {
  batting: BattingStats[];
  bowling: BowlingStats[];
  totalRuns: number;
  totalWickets: number;
  overs: number;
}

export interface Match {
  id: string;
  date: string;
  matchNumber: number;
  teamA: string;
  teamB: string;
  teamAStats?: TeamStats;
  teamBStats?: TeamStats;
  status: "scheduled" | "completed" | "live";
  type: "group" | "semi-final" | "final";
}

interface Team {
  id: string;
  name: string;
  players: string[];
  player_photos?: string[];
}

interface PublicFixturesProps {
  matches: Match[];
  teams: Team[];
}

// Parse date string like "9th February" to a sortable number
const parseDateString = (dateStr: string): number => {
  const months: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };

  // Extract day number (remove st, nd, rd, th)
  const dayMatch = dateStr.match(/(\d+)/);
  const day = dayMatch ? parseInt(dayMatch[1]) : 0;

  // Extract month
  const monthMatch = dateStr.toLowerCase().match(/(january|february|march|april|may|june|july|august|september|october|november|december)/);
  const month = monthMatch ? months[monthMatch[1]] : 0;

  // Return sortable number: month * 100 + day (e.g., February 9 = 209)
  return month * 100 + day;
};

export function PublicFixtures({ matches, teams }: PublicFixturesProps) {
  const navigate = useNavigate();

  // Sort matches by date first
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = parseDateString(a.date);
    const dateB = parseDateString(b.date);
    if (dateA !== dateB) return dateA - dateB;
    return a.matchNumber - b.matchNumber;
  });

  const groupedMatches = sortedMatches.reduce((acc, match) => {
    if (!acc[match.date]) {
      acc[match.date] = [];
    }
    acc[match.date].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // Sort the date keys to ensure proper order
  const sortedDates = Object.keys(groupedMatches).sort((a, b) => parseDateString(a) - parseDateString(b));

  const getStrikeRate = (runs: number, balls: number) => {
    return balls > 0 ? ((runs / balls) * 100).toFixed(1) : "0.0";
  };

  const getEconomy = (runs: number, overs: number) => {
    return overs > 0 ? (runs / overs).toFixed(2) : "0.00";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Cricket Tournament 2026</h1>
          <p className="text-green-200 text-sm mb-3">6:00 PM – 7:00 PM | Reporting: 5:45 PM</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/teams")}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Users className="w-4 h-4 mr-2" />
            View All Teams
          </Button>
        </div>

        {/* 70-30 Layout: Matches (left) | Sidebar (right) */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Content - 70% */}
          <div className="w-full lg:w-[70%] space-y-4">
          {sortedDates.map((date) => {
            const dayMatches = groupedMatches[date];
            return (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-green-300" />
                <h2 className="text-lg font-semibold text-white">{date}</h2>
              </div>
              
              <div className="space-y-3">
                {dayMatches.map((match) => (
                  <Card key={match.id} className="overflow-hidden border-green-700 bg-slate-900/50 backdrop-blur">
                    <CardHeader className="pb-3 pt-3 px-4 bg-gradient-to-r from-slate-800 to-slate-900">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-400">Match {match.matchNumber}</span>
                          {match.type !== "group" && (
                            <Badge variant={match.type === "final" ? "default" : "secondary"} className="text-xs">
                              {match.type === "final" ? "FINAL" : "SEMI-FINAL"}
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant={match.status === "completed" ? "default" : match.status === "live" ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {match.status === "completed" ? "Completed" : match.status === "live" ? "● LIVE" : "Scheduled"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      {match.status === "scheduled" ? (
                        <div className="text-center py-6">
                          <p className="text-lg font-semibold text-white mb-2">
                            {match.teamA} <span className="text-gray-500">vs</span> {match.teamB}
                          </p>
                          <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" /> 6:00 PM
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Score Summary - wickets lost come from opposing team's bowling */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800/50 rounded-lg p-3">
                              <p className="text-sm font-semibold text-gray-300 mb-1">{match.teamA}</p>
                              <p className="text-2xl font-bold text-white">
                                {match.teamAStats?.totalRuns || 0}/{match.teamBStats?.bowling?.reduce((sum, b) => sum + (b.wickets || 0), 0) || 0}
                              </p>
                              <p className="text-xs text-gray-400">({match.teamBStats?.bowling?.reduce((sum, b) => sum + (b.overs || 0), 0) || 0} overs)</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3">
                              <p className="text-sm font-semibold text-gray-300 mb-1">{match.teamB}</p>
                              <p className="text-2xl font-bold text-white">
                                {match.teamBStats?.totalRuns || 0}/{match.teamAStats?.bowling?.reduce((sum, b) => sum + (b.wickets || 0), 0) || 0}
                              </p>
                              <p className="text-xs text-gray-400">({match.teamAStats?.bowling?.reduce((sum, b) => sum + (b.overs || 0), 0) || 0} overs)</p>
                            </div>
                          </div>

                          {/* Detailed Stats - Team-based tabs */}
                          <Tabs defaultValue="teamA" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                              <TabsTrigger value="teamA">{match.teamA}</TabsTrigger>
                              <TabsTrigger value="teamB">{match.teamB}</TabsTrigger>
                            </TabsList>

                            {/* Team A Batting View - Team A bats, Team B bowls */}
                            <TabsContent value="teamA" className="space-y-3 mt-3">
                              {/* Team A Batting */}
                              <div>
                                <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> {match.teamA} Batting
                                </h4>
                                <div className="bg-slate-800/30 rounded overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead className="bg-slate-800">
                                      <tr className="text-gray-400">
                                        <th className="text-left py-1 px-2">Player</th>
                                        <th className="text-center py-1 px-1">1s</th>
                                        <th className="text-center py-1 px-1">2s</th>
                                        <th className="text-center py-1 px-1">4s</th>
                                        <th className="text-center py-1 px-1">Ext</th>
                                        <th className="text-center py-1 px-1">B</th>
                                        <th className="text-center py-1 px-1">R</th>
                                        <th className="text-center py-1 px-1">SR</th>
                                      </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                      {match.teamAStats?.batting.map((player, idx) => (
                                        <tr key={idx} className="border-t border-slate-700">
                                          <td className="py-1 px-2 text-white">{player.player}</td>
                                          <td className="text-center py-1 px-1">{player.ones || 0}</td>
                                          <td className="text-center py-1 px-1">{player.twos || 0}</td>
                                          <td className="text-center py-1 px-1">{player.fours || 0}</td>
                                          <td className="text-center py-1 px-1">{player.extras || 0}</td>
                                          <td className="text-center py-1 px-1">{player.balls || 0}</td>
                                          <td className="text-center py-1 px-1 font-semibold">{player.runs || 0}</td>
                                          <td className="text-center py-1 px-1">{getStrikeRate(player.runs, player.balls)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Team B Bowling (against Team A) */}
                              <div>
                                <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> {match.teamB} Bowling
                                </h4>
                                <div className="bg-slate-800/30 rounded overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead className="bg-slate-800">
                                      <tr className="text-gray-400">
                                        <th className="text-left py-1 px-2">Player</th>
                                        <th className="text-center py-1 px-1">O</th>
                                        <th className="text-center py-1 px-1">M</th>
                                        <th className="text-center py-1 px-1">R</th>
                                        <th className="text-center py-1 px-1">W</th>
                                        <th className="text-center py-1 px-1">Eco</th>
                                      </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                      {match.teamBStats?.bowling.map((player, idx) => (
                                        <tr key={idx} className="border-t border-slate-700">
                                          <td className="py-1 px-2 text-white">{player.player}</td>
                                          <td className="text-center py-1 px-1">{player.overs}</td>
                                          <td className="text-center py-1 px-1">{player.maidens}</td>
                                          <td className="text-center py-1 px-1">{player.runs}</td>
                                          <td className="text-center py-1 px-1">{player.wickets}</td>
                                          <td className="text-center py-1 px-1">{getEconomy(player.runs, player.overs)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </TabsContent>

                            {/* Team B Batting View - Team B bats, Team A bowls */}
                            <TabsContent value="teamB" className="space-y-3 mt-3">
                              {/* Team B Batting */}
                              <div>
                                <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> {match.teamB} Batting
                                </h4>
                                <div className="bg-slate-800/30 rounded overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead className="bg-slate-800">
                                      <tr className="text-gray-400">
                                        <th className="text-left py-1 px-2">Player</th>
                                        <th className="text-center py-1 px-1">1s</th>
                                        <th className="text-center py-1 px-1">2s</th>
                                        <th className="text-center py-1 px-1">4s</th>
                                        <th className="text-center py-1 px-1">Ext</th>
                                        <th className="text-center py-1 px-1">B</th>
                                        <th className="text-center py-1 px-1">R</th>
                                        <th className="text-center py-1 px-1">SR</th>
                                      </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                      {match.teamBStats?.batting.map((player, idx) => (
                                        <tr key={idx} className="border-t border-slate-700">
                                          <td className="py-1 px-2 text-white">{player.player}</td>
                                          <td className="text-center py-1 px-1">{player.ones || 0}</td>
                                          <td className="text-center py-1 px-1">{player.twos || 0}</td>
                                          <td className="text-center py-1 px-1">{player.fours || 0}</td>
                                          <td className="text-center py-1 px-1">{player.extras || 0}</td>
                                          <td className="text-center py-1 px-1">{player.balls || 0}</td>
                                          <td className="text-center py-1 px-1 font-semibold">{player.runs || 0}</td>
                                          <td className="text-center py-1 px-1">{getStrikeRate(player.runs, player.balls)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Team A Bowling (against Team B) */}
                              <div>
                                <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> {match.teamA} Bowling
                                </h4>
                                <div className="bg-slate-800/30 rounded overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead className="bg-slate-800">
                                      <tr className="text-gray-400">
                                        <th className="text-left py-1 px-2">Player</th>
                                        <th className="text-center py-1 px-1">O</th>
                                        <th className="text-center py-1 px-1">M</th>
                                        <th className="text-center py-1 px-1">R</th>
                                        <th className="text-center py-1 px-1">W</th>
                                        <th className="text-center py-1 px-1">Eco</th>
                                      </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                      {match.teamAStats?.bowling.map((player, idx) => (
                                        <tr key={idx} className="border-t border-slate-700">
                                          <td className="py-1 px-2 text-white">{player.player}</td>
                                          <td className="text-center py-1 px-1">{player.overs}</td>
                                          <td className="text-center py-1 px-1">{player.maidens}</td>
                                          <td className="text-center py-1 px-1">{player.runs}</td>
                                          <td className="text-center py-1 px-1">{player.wickets}</td>
                                          <td className="text-center py-1 px-1">{getEconomy(player.runs, player.overs)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            );
          })}
          </div>

          {/* Sidebar - 30% */}
          <div className="w-full lg:w-[30%]">
            <div className="lg:sticky lg:top-6">
              <Sidebar matches={matches} teams={teams} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}