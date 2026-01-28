import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";
import { LogOut, Save, Users, TrendingUp } from "lucide-react";
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
}

export function AdminPanel({ matches, teams, onUpdateMatch, onUpdateTeam, onLogout }: AdminPanelProps) {
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [editingTeams, setEditingTeams] = useState<Record<string, string[]>>({});
  const [editingTeamNames, setEditingTeamNames] = useState<Record<string, string>>({});

  const getDefaultStats = (match: Match): { teamA: TeamStats; teamB: TeamStats } => {
    const teamAPlayers = teams.find((t) => t.name === match.teamA)?.players || [];
    const teamBPlayers = teams.find((t) => t.name === match.teamB)?.players || [];

    const createDefaultTeamStats = (players: string[], existingStats?: TeamStats): TeamStats => ({
      batting: existingStats?.batting || players.map((p) => ({ player: p, runs: 0, balls: 0, fours: 0, extras: 0 })),
      bowling: existingStats?.bowling || players.map((p) => ({ player: p, overs: 0, maidens: 0, runs: 0, wickets: 0 })),
      totalRuns: existingStats?.totalRuns || 0,
      totalWickets: existingStats?.totalWickets || 0,
      overs: existingStats?.overs || 0,
    });

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
    newStats[team].batting = batting;
    setMatchStats((prev) => ({ ...prev, [matchId]: newStats }));
  };

  const updateBowlingStats = (matchId: string, team: "teamA" | "teamB", playerIndex: number, field: keyof BowlingStats, value: string) => {
    const stats = getMatchStats(matchId);
    const newStats = { ...stats };
    const bowling = [...newStats[team].bowling];
    bowling[playerIndex] = { ...bowling[playerIndex], [field]: field === "player" ? value : parseFloat(value) || 0 };
    newStats[team].bowling = bowling;
    setMatchStats((prev) => ({ ...prev, [matchId]: newStats }));
  };

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
    toast.success("Match updated successfully!");
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
      toast.success(`${teamName} updated successfully!`);
    }
  };

  const getEditingPlayers = (team: Team) => {
    return editingTeams[team.name] || team.players;
  };

  const selectedMatchData = matches.find((m) => m.id === selectedMatch);
  const stats = selectedMatch ? getMatchStats(selectedMatch) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-600">Manage matches, scores, and players</p>
          </div>
          <Button variant="outline" onClick={onLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="matches" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="matches">Match Scores</TabsTrigger>
            <TabsTrigger value="players">Player Names</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Match to Update</CardTitle>
              </CardHeader>
              <CardContent>
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
                        {/* Team Totals */}
                        <div className={`grid grid-cols-3 gap-3 p-3 rounded-lg ${team === "teamA" ? "bg-blue-100 border-2 border-blue-300" : "bg-orange-100 border-2 border-orange-300"}`}>
                          <div>
                            <Label htmlFor={`${team}-totalRuns`} className="text-xs">Total Runs</Label>
                            <Input
                              id={`${team}-totalRuns`}
                              type="number"
                              value={stats[team].totalRuns}
                              onChange={(e) => updateTeamTotal(selectedMatch, team, "totalRuns", e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${team}-totalWickets`} className="text-xs">Wickets</Label>
                            <Input
                              id={`${team}-totalWickets`}
                              type="number"
                              value={stats[team].totalWickets}
                              onChange={(e) => updateTeamTotal(selectedMatch, team, "totalWickets", e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${team}-overs`} className="text-xs">Overs</Label>
                            <Input
                              id={`${team}-overs`}
                              type="number"
                              step="0.1"
                              value={stats[team].overs}
                              onChange={(e) => updateTeamTotal(selectedMatch, team, "overs", e.target.value)}
                              className="h-9"
                            />
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
            {teams.map((team) => {
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
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}