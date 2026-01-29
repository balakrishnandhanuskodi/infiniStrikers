import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";
import { LogOut, Save, Users, TrendingUp, Database, Plus, Loader2, Calendar } from "lucide-react";
import { Match, BattingStats, BowlingStats, TeamStats } from "./PublicFixtures";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

interface Team {
  name: string;
  players: string[];
}

interface AdminPanelProps {
  matches: Match[];
  teams: Team[];
  onUpdateMatch: (matchId: string, teamAStats: TeamStats, teamBStats: TeamStats, status: Match["status"]) => void;
  onUpdateTeam: (teamName: string, players: string[]) => void;
  onLogout: () => void;
  onSeedData?: () => void;
  onAddMatch?: (matchData: { date: string; matchNumber: number; teamA: string; teamB: string; type: string }) => void;
  isSeeding?: boolean;
  isLoading?: boolean;
}

export function AdminPanel({
  matches,
  teams,
  onUpdateMatch,
  onUpdateTeam,
  onLogout,
  onSeedData,
  onAddMatch,
  isSeeding = false,
  isLoading = false,
}: AdminPanelProps) {
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [editingTeams, setEditingTeams] = useState<Record<string, string[]>>({});
  const [editingTeamNames, setEditingTeamNames] = useState<Record<string, string>>({});

  // New match form state
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [newMatch, setNewMatch] = useState({
    date: "",
    matchNumber: 1,
    teamA: "",
    teamB: "",
    type: "group",
  });

  // Calculate totals from individual player stats
  const calculateTotals = (stats: TeamStats): TeamStats => {
    const totalRuns = stats.batting.reduce((sum, b) => sum + (b.runs || 0) + (b.extras || 0), 0);
    const totalWickets = stats.bowling.reduce((sum, b) => sum + (b.wickets || 0), 0);
    const overs = stats.bowling.reduce((sum, b) => sum + (b.overs || 0), 0);
    return { ...stats, totalRuns, totalWickets, overs };
  };

  const getDefaultStats = (match: Match): { teamA: TeamStats; teamB: TeamStats } => {
    const teamAPlayers = teams.find((t) => t.name === match.teamA)?.players || [];
    const teamBPlayers = teams.find((t) => t.name === match.teamB)?.players || [];

    // Always sync player names from teams while preserving their scores
    const createDefaultTeamStats = (players: string[], existingStats?: TeamStats): TeamStats => {
      // Merge team player names with existing stats data
      const batting = players.map((playerName, idx) => {
        const existingBatting = existingStats?.batting?.[idx];
        return {
          player: playerName, // Always use current team player name
          runs: existingBatting?.runs || 0,
          balls: existingBatting?.balls || 0,
          fours: existingBatting?.fours || 0,
          extras: existingBatting?.extras || 0,
        };
      });

      const bowling = players.map((playerName, idx) => {
        const existingBowling = existingStats?.bowling?.[idx];
        return {
          player: playerName, // Always use current team player name
          overs: existingBowling?.overs || 0,
          maidens: existingBowling?.maidens || 0,
          runs: existingBowling?.runs || 0,
          wickets: existingBowling?.wickets || 0,
        };
      });

      // Calculate totals from player stats
      const totalRuns = batting.reduce((sum, b) => sum + b.runs + b.extras, 0);
      const totalWickets = bowling.reduce((sum, b) => sum + b.wickets, 0);
      const overs = bowling.reduce((sum, b) => sum + b.overs, 0);

      return { batting, bowling, totalRuns, totalWickets, overs };
    };

    return {
      teamA: createDefaultTeamStats(teamAPlayers, match.teamAStats),
      teamB: createDefaultTeamStats(teamBPlayers, match.teamBStats),
    };
  };

  const [matchStats, setMatchStats] = useState<Record<string, { teamA: TeamStats; teamB: TeamStats }>>({});
  const [matchStatus, setMatchStatus] = useState<Record<string, Match["status"]>>({});

  const getMatchStats = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { teamA: { batting: [], bowling: [], totalRuns: 0, totalWickets: 0, overs: 0 }, teamB: { batting: [], bowling: [], totalRuns: 0, totalWickets: 0, overs: 0 } };

    if (!matchStats[matchId]) {
      return getDefaultStats(match);
    }
    return matchStats[matchId];
  };

  const updateBattingStats = (matchId: string, team: "teamA" | "teamB", playerIndex: number, field: keyof BattingStats, value: string) => {
    const stats = getMatchStats(matchId);
    const newStats = { ...stats };
    const batting = [...newStats[team].batting];
    batting[playerIndex] = { ...batting[playerIndex], [field]: field === "player" ? value : parseFloat(value) || 0 };
    newStats[team] = {
      ...newStats[team],
      batting,
      // Auto-calculate total runs from batting stats (runs + extras)
      totalRuns: batting.reduce((sum, b) => sum + (b.runs || 0) + (b.extras || 0), 0),
    };
    setMatchStats((prev) => ({ ...prev, [matchId]: newStats }));
  };

  const updateBowlingStats = (matchId: string, team: "teamA" | "teamB", playerIndex: number, field: keyof BowlingStats, value: string) => {
    const stats = getMatchStats(matchId);
    const newStats = { ...stats };
    const bowling = [...newStats[team].bowling];
    bowling[playerIndex] = { ...bowling[playerIndex], [field]: field === "player" ? value : parseFloat(value) || 0 };
    newStats[team] = {
      ...newStats[team],
      bowling,
      // Auto-calculate wickets and overs from bowling stats
      totalWickets: bowling.reduce((sum, b) => sum + (b.wickets || 0), 0),
      overs: bowling.reduce((sum, b) => sum + (b.overs || 0), 0),
    };
    setMatchStats((prev) => ({ ...prev, [matchId]: newStats }));
  };

  // Keep manual override option but show it's auto-calculated
  const updateTeamTotal = (matchId: string, team: "teamA" | "teamB", field: "totalRuns" | "totalWickets" | "overs", value: string) => {
    const stats = getMatchStats(matchId);
    const newStats = { ...stats };
    newStats[team][field] = parseFloat(value) || 0;
    setMatchStats((prev) => ({ ...prev, [matchId]: newStats }));
  };

  const handleSaveMatch = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const stats = getMatchStats(matchId);
    const status = matchStatus[matchId] || match.status;
    onUpdateMatch(matchId, stats.teamA, stats.teamB, status);
  };

  const handlePlayerChange = (teamName: string, index: number, value: string) => {
    const team = teams.find((t) => t.name === teamName);
    if (!team) return;

    const currentPlayers = editingTeams[teamName] || team.players;
    const newPlayers = [...currentPlayers];
    newPlayers[index] = value;
    setEditingTeams((prev) => ({
      ...prev,
      [teamName]: newPlayers,
    }));
  };

  const handleSaveTeam = (teamName: string) => {
    const players = editingTeams[teamName];
    if (players) {
      onUpdateTeam(teamName, players.filter((p) => p.trim() !== ""));
    }
  };

  const handleAddNewMatch = () => {
    if (!newMatch.date || !newMatch.teamA || !newMatch.teamB) {
      toast.error("Please fill all fields");
      return;
    }
    if (onAddMatch) {
      onAddMatch(newMatch);
      setNewMatch({ date: "", matchNumber: 1, teamA: "", teamB: "", type: "group" });
      setShowAddMatch(false);
    }
  };

  const getEditingPlayers = (team: Team) => {
    return editingTeams[team.name] || team.players;
  };

  const selectedMatchData = matches.find((m) => m.id === selectedMatch);
  const stats = selectedMatch ? getMatchStats(selectedMatch) : null;

  const hasNoData = matches.length === 0 && teams.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-600">Manage matches, scores, and players</p>
          </div>
          <div className="flex gap-2">
            {onSeedData && (
              <Button
                variant="outline"
                onClick={onSeedData}
                size="sm"
                disabled={isSeeding}
              >
                {isSeeding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                {isSeeding ? "Initializing..." : "Initialize Data"}
              </Button>
            )}
            <Button variant="outline" onClick={onLogout} size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : hasNoData ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Found</h3>
              <p className="text-gray-500 mb-4">Click "Initialize Data" to create default teams and matches.</p>
              {onSeedData && (
                <Button onClick={onSeedData} disabled={isSeeding}>
                  {isSeeding ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  {isSeeding ? "Initializing..." : "Initialize Data"}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="matches" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
              <TabsTrigger value="matches">Match Scores</TabsTrigger>
              <TabsTrigger value="players">Player Names</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Match to Update</CardTitle>
                </CardHeader>
                <CardContent>
                  {matches.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No matches found. Go to Schedule tab to add matches.</p>
                  ) : (
                    <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a match..." />
                      </SelectTrigger>
                      <SelectContent>
                        {matches.map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.date} - Match {match.matchNumber}: {match.teamA} vs {match.teamB}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>

              {selectedMatchData && stats && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {selectedMatchData.teamA} vs {selectedMatchData.teamB}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedMatchData.date} - Match {selectedMatchData.matchNumber}
                        </p>
                      </div>
                      {selectedMatchData.type !== "group" && (
                        <Badge variant={selectedMatchData.type === "final" ? "default" : "secondary"}>
                          {selectedMatchData.type === "final" ? "FINAL" : "SEMI-FINAL"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Match Status */}
                    <div>
                      <Label className="text-sm mb-2 block">Match Status</Label>
                      <div className="flex gap-2">
                        {(["scheduled", "live", "completed"] as const).map((status) => (
                          <Button
                            key={status}
                            variant={(matchStatus[selectedMatch] || selectedMatchData.status) === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMatchStatus((prev) => ({ ...prev, [selectedMatch]: status }))}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Tabs defaultValue="teamA">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="teamA">{selectedMatchData.teamA}</TabsTrigger>
                        <TabsTrigger value="teamB">{selectedMatchData.teamB}</TabsTrigger>
                      </TabsList>

                      {(["teamA", "teamB"] as const).map((team) => (
                        <TabsContent key={team} value={team} className="space-y-4">
                          {/* Team Totals - Auto-calculated */}
                          <div className={`grid grid-cols-3 gap-3 p-3 rounded-lg ${team === "teamA" ? "bg-blue-100 border-2 border-blue-300" : "bg-orange-100 border-2 border-orange-300"}`}>
                            <div>
                              <Label className="text-xs">Total Runs (auto)</Label>
                              <div className="h-9 flex items-center px-3 bg-white border rounded-md font-semibold text-lg">
                                {stats[team].totalRuns}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Wickets (auto)</Label>
                              <div className="h-9 flex items-center px-3 bg-white border rounded-md font-semibold text-lg">
                                {stats[team].totalWickets}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Overs (auto)</Label>
                              <div className="h-9 flex items-center px-3 bg-white border rounded-md font-semibold text-lg">
                                {stats[team].overs}
                              </div>
                            </div>
                          </div>

                          {/* Batting Stats */}
                          <div className={`p-3 rounded-lg ${team === "teamA" ? "bg-blue-50" : "bg-orange-50"}`}>
                            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-1 ${team === "teamA" ? "text-blue-700" : "text-orange-700"}`}>
                              <TrendingUp className="w-4 h-4" /> Batting Details
                            </h4>
                            <div className="space-y-2">
                              {stats[team].batting.map((player, idx) => (
                                <div key={idx} className="grid grid-cols-6 gap-2 p-2 bg-white border rounded">
                                  <div className="col-span-2">
                                    <Label className="text-xs text-gray-500">Player</Label>
                                    <Input
                                      value={player.player}
                                      onChange={(e) => updateBattingStats(selectedMatch, team, idx, "player", e.target.value)}
                                      className="h-8 text-sm"
                                      placeholder="Player name"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Runs</Label>
                                    <Input
                                      type="number"
                                      value={player.runs}
                                      onChange={(e) => updateBattingStats(selectedMatch, team, idx, "runs", e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Balls</Label>
                                    <Input
                                      type="number"
                                      value={player.balls}
                                      onChange={(e) => updateBattingStats(selectedMatch, team, idx, "balls", e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">4s</Label>
                                    <Input
                                      type="number"
                                      value={player.fours}
                                      onChange={(e) => updateBattingStats(selectedMatch, team, idx, "fours", e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Extras</Label>
                                    <Input
                                      type="number"
                                      value={player.extras}
                                      onChange={(e) => updateBattingStats(selectedMatch, team, idx, "extras", e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bowling Stats */}
                          <div className={`p-3 rounded-lg ${team === "teamA" ? "bg-blue-50" : "bg-orange-50"}`}>
                            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-1 ${team === "teamA" ? "text-blue-700" : "text-orange-700"}`}>
                              <TrendingUp className="w-4 h-4" /> Bowling Details
                            </h4>
                            <div className="space-y-2">
                              {stats[team].bowling.map((player, idx) => (
                                <div key={idx} className="grid grid-cols-6 gap-2 p-2 bg-white border rounded">
                                  <div className="col-span-2">
                                    <Label className="text-xs text-gray-500">Player</Label>
                                    <Input
                                      value={player.player}
                                      onChange={(e) => updateBowlingStats(selectedMatch, team, idx, "player", e.target.value)}
                                      className="h-8 text-sm"
                                      placeholder="Player name"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Overs</Label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={player.overs}
                                      onChange={(e) => updateBowlingStats(selectedMatch, team, idx, "overs", e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Maidens</Label>
                                    <Input
                                      type="number"
                                      value={player.maidens}
                                      onChange={(e) => updateBowlingStats(selectedMatch, team, idx, "maidens", e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Runs</Label>
                                    <Input
                                      type="number"
                                      value={player.runs}
                                      onChange={(e) => updateBowlingStats(selectedMatch, team, idx, "runs", e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Wickets</Label>
                                    <Input
                                      type="number"
                                      value={player.wickets}
                                      onChange={(e) => updateBowlingStats(selectedMatch, team, idx, "wickets", e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>

                    <Button onClick={() => handleSaveMatch(selectedMatch)} className="w-full" size="lg">
                      <Save className="w-4 h-4 mr-2" />
                      Save Match Data
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="players" className="space-y-4">
              {teams.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No teams found. Click "Initialize Data" to create default teams.</p>
                  </CardContent>
                </Card>
              ) : (
                teams.map((team) => {
                  const players = getEditingPlayers(team);
                  const teamName = editingTeamNames[team.name] || team.name;
                  return (
                    <Card key={team.name}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Users className="w-5 h-5" />
                          <Input
                            value={teamName}
                            onChange={(e) => setEditingTeamNames((prev) => ({ ...prev, [team.name]: e.target.value }))}
                            className="font-semibold text-lg h-8"
                            placeholder="Team Name"
                          />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {players.map((player, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <span className="text-sm font-medium text-gray-500 w-8">{index + 1}.</span>
                            <Input
                              placeholder={`Player ${index + 1} name`}
                              value={player}
                              onChange={(e) => handlePlayerChange(team.name, index, e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        ))}
                        <Button onClick={() => handleSaveTeam(team.name)} className="w-full">
                          <Save className="w-4 h-4 mr-2" />
                          Save {teamName}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Match Schedule
                    </CardTitle>
                    {onAddMatch && (
                      <Button size="sm" onClick={() => setShowAddMatch(!showAddMatch)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Match
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {showAddMatch && onAddMatch && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-4">
                      <h4 className="font-semibold">Add New Match</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date</Label>
                          <Input
                            placeholder="e.g., 9th February"
                            value={newMatch.date}
                            onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Match Number</Label>
                          <Input
                            type="number"
                            value={newMatch.matchNumber}
                            onChange={(e) => setNewMatch({ ...newMatch, matchNumber: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div>
                          <Label>Team A</Label>
                          <Select value={newMatch.teamA} onValueChange={(v) => setNewMatch({ ...newMatch, teamA: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map((t) => (
                                <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Team B</Label>
                          <Select value={newMatch.teamB} onValueChange={(v) => setNewMatch({ ...newMatch, teamB: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map((t) => (
                                <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Match Type</Label>
                          <Select value={newMatch.type} onValueChange={(v) => setNewMatch({ ...newMatch, type: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="group">Group</SelectItem>
                              <SelectItem value="semi-final">Semi-Final</SelectItem>
                              <SelectItem value="final">Final</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={handleAddNewMatch} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Match
                      </Button>
                    </div>
                  )}

                  {matches.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No matches scheduled yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {matches.map((match) => (
                        <div key={match.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{match.teamA} vs {match.teamB}</p>
                            <p className="text-sm text-gray-500">{match.date} - Match {match.matchNumber}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={match.type === "final" ? "default" : match.type === "semi-final" ? "secondary" : "outline"}>
                              {match.type}
                            </Badge>
                            <Badge variant={match.status === "completed" ? "default" : match.status === "live" ? "destructive" : "outline"}>
                              {match.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
