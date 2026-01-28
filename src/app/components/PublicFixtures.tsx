import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Calendar, Clock, TrendingUp } from "lucide-react";

export interface BattingStats {
  player: string;
  runs: number;
  balls: number;
  fours: number;
  extras: number; // runs due to no-ball/wide
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

interface PublicFixturesProps {
  matches: Match[];
}

export function PublicFixtures({ matches }: PublicFixturesProps) {
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.date]) {
      acc[match.date] = [];
    }
    acc[match.date].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const getStrikeRate = (runs: number, balls: number) => {
    return balls > 0 ? ((runs / balls) * 100).toFixed(1) : "0.0";
  };

  const getEconomy = (runs: number, overs: number) => {
    return overs > 0 ? (runs / overs).toFixed(2) : "0.00";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Cricket Tournament 2026</h1>
          <p className="text-green-200 text-sm">6:00 PM – 7:00 PM | Reporting: 5:45 PM</p>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedMatches).map(([date, dayMatches]) => (
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
                          {/* Score Summary */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800/50 rounded-lg p-3">
                              <p className="text-sm font-semibold text-gray-300 mb-1">{match.teamA}</p>
                              <p className="text-2xl font-bold text-white">
                                {match.teamAStats?.totalRuns || 0}/{match.teamAStats?.totalWickets || 0}
                              </p>
                              <p className="text-xs text-gray-400">({match.teamAStats?.overs || 0} overs)</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3">
                              <p className="text-sm font-semibold text-gray-300 mb-1">{match.teamB}</p>
                              <p className="text-2xl font-bold text-white">
                                {match.teamBStats?.totalRuns || 0}/{match.teamBStats?.totalWickets || 0}
                              </p>
                              <p className="text-xs text-gray-400">({match.teamBStats?.overs || 0} overs)</p>
                            </div>
                          </div>

                          {/* Detailed Stats */}
                          <Tabs defaultValue="batting" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                              <TabsTrigger value="batting">Batting</TabsTrigger>
                              <TabsTrigger value="bowling">Bowling</TabsTrigger>
                            </TabsList>

                            <TabsContent value="batting" className="space-y-3 mt-3">
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
                                        <th className="text-center py-1 px-1">R</th>
                                        <th className="text-center py-1 px-1">B</th>
                                        <th className="text-center py-1 px-1">4s</th>
                                        <th className="text-center py-1 px-1">Extras</th>
                                        <th className="text-center py-1 px-1">SR</th>
                                      </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                      {match.teamAStats?.batting.map((player, idx) => (
                                        <tr key={idx} className="border-t border-slate-700">
                                          <td className="py-1 px-2 text-white">{player.player}</td>
                                          <td className="text-center py-1 px-1">{player.runs}</td>
                                          <td className="text-center py-1 px-1">{player.balls}</td>
                                          <td className="text-center py-1 px-1">{player.fours}</td>
                                          <td className="text-center py-1 px-1">{player.extras}</td>
                                          <td className="text-center py-1 px-1">{getStrikeRate(player.runs, player.balls)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

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
                                        <th className="text-center py-1 px-1">R</th>
                                        <th className="text-center py-1 px-1">B</th>
                                        <th className="text-center py-1 px-1">4s</th>
                                        <th className="text-center py-1 px-1">Extras</th>
                                        <th className="text-center py-1 px-1">SR</th>
                                      </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                      {match.teamBStats?.batting.map((player, idx) => (
                                        <tr key={idx} className="border-t border-slate-700">
                                          <td className="py-1 px-2 text-white">{player.player}</td>
                                          <td className="text-center py-1 px-1">{player.runs}</td>
                                          <td className="text-center py-1 px-1">{player.balls}</td>
                                          <td className="text-center py-1 px-1">{player.fours}</td>
                                          <td className="text-center py-1 px-1">{player.extras}</td>
                                          <td className="text-center py-1 px-1">{getStrikeRate(player.runs, player.balls)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="bowling" className="space-y-3 mt-3">
                              {/* Team A Bowling */}
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

                              {/* Team B Bowling */}
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
                          </Tabs>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}