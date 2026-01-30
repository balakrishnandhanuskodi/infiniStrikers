import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PublicFixtures, Match as UIMatch, TeamStats } from "@/app/components/PublicFixtures";
import { AdminLogin } from "@/app/components/AdminLogin";
import { AdminPanel } from "@/app/components/AdminPanel";
import { Toaster } from "@/app/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useMatches, useTeams } from "@/lib/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  players: string[];
}

// Default data for seeding
const defaultMatchesData = [
  { date: "9th February", matchNumber: 1, teamA: "Team A", teamB: "Team C", type: "group" },
  { date: "9th February", matchNumber: 2, teamA: "Team B", teamB: "Team C", type: "group" },
  { date: "9th February", matchNumber: 3, teamA: "Team A", teamB: "Team B", type: "group" },
  { date: "10th February", matchNumber: 1, teamA: "Team A", teamB: "Team B", type: "group" },
  { date: "10th February", matchNumber: 2, teamA: "Team A", teamB: "Team C", type: "group" },
  { date: "10th February", matchNumber: 3, teamA: "Team B", teamB: "Team C", type: "group" },
  { date: "11th February", matchNumber: 1, teamA: "Place 2", teamB: "Place 3", type: "semi-final" },
  { date: "11th February", matchNumber: 2, teamA: "Place 1", teamB: "Winner of SF", type: "final" },
];

const defaultTeamsData = [
  { name: "Team A", players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"] },
  { name: "Team B", players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"] },
  { name: "Team C", players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"] },
];

// Public page component
function PublicPage() {
  const { matches: dbMatches, loading } = useMatches();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading matches...</p>
        </div>
      </div>
    );
  }

  const matches: UIMatch[] = dbMatches.map(m => ({
    id: m.id,
    date: m.date,
    matchNumber: m.match_number,
    teamA: m.team_a,
    teamB: m.team_b,
    status: m.status,
    type: m.match_type,
    teamAStats: m.team_a_stats || undefined,
    teamBStats: m.team_b_stats || undefined,
  }));

  return <PublicFixtures matches={matches} />;
}

// Admin page component
function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [loginError, setLoginError] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  const { matches: dbMatches, loading: matchesLoading, refetch: refetchMatches } = useMatches();
  const { teams: dbTeams, loading: teamsLoading, refetch: refetchTeams } = useTeams();

  // Convert database data to UI format
  const matches: UIMatch[] = dbMatches.map(m => ({
    id: m.id,
    date: m.date,
    matchNumber: m.match_number,
    teamA: m.team_a,
    teamB: m.team_b,
    status: m.status,
    type: m.match_type,
    teamAStats: m.team_a_stats || undefined,
    teamBStats: m.team_b_stats || undefined,
  }));

  const teams: Team[] = dbTeams.map(t => ({
    id: t.id,
    name: t.name,
    players: t.players || [],
  }));

  // Seed all default data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      // Seed teams first
      for (const team of defaultTeamsData) {
        const exists = dbTeams.find(t => t.name === team.name);
        if (!exists) {
          const { error } = await supabase
            .from("teams")
            .insert({ name: team.name, players: team.players });
          if (error) console.error("Error seeding team:", team.name, error);
        }
      }

      // Seed matches
      for (const match of defaultMatchesData) {
        const exists = dbMatches.find(
          m => m.date === match.date && m.match_number === match.matchNumber
        );
        if (!exists) {
          const { error } = await supabase
            .from("matches")
            .insert({
              date: match.date,
              match_number: match.matchNumber,
              team_a: match.teamA,
              team_b: match.teamB,
              match_type: match.type,
              status: "scheduled",
            });
          if (error) console.error("Error seeding match:", match, error);
        }
      }

      await refetchTeams();
      await refetchMatches();
      toast.success("Data initialized successfully!");
    } catch (error) {
      console.error("Seed error:", error);
      toast.error("Failed to initialize data");
    } finally {
      setIsSeeding(false);
    }
  };

  // Add new match
  const handleAddMatch = async (matchData: {
    date: string;
    matchNumber: number;
    teamA: string;
    teamB: string;
    type: string;
  }) => {
    const { error } = await supabase
      .from("matches")
      .insert({
        date: matchData.date,
        match_number: matchData.matchNumber,
        team_a: matchData.teamA,
        team_b: matchData.teamB,
        match_type: matchData.type,
        status: "scheduled",
      });

    if (error) {
      console.error("Add match error:", error);
      toast.error("Failed to add match: " + error.message);
    } else {
      toast.success("Match added successfully!");
      await refetchMatches();
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
    } else {
      setLoginError("");
      toast.success("Logged in successfully!");
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully!");
  };

  // Helper to sanitize stats objects
  const sanitizeStats = (stats: TeamStats | null | undefined): TeamStats | null => {
    if (!stats) return null;
    return {
      batting: stats.batting?.map(b => ({
        player: b.player || "",
        ones: b.ones ?? 0,
        twos: b.twos ?? 0,
        fours: b.fours ?? 0,
        extras: b.extras ?? 0,
        balls: b.balls ?? 0,
        runs: b.runs ?? 0,
      })) || [],
      bowling: stats.bowling?.map(b => ({
        player: b.player || "",
        overs: b.overs ?? 0,
        maidens: b.maidens ?? 0,
        runs: b.runs ?? 0,
        wickets: b.wickets ?? 0,
      })) || [],
      totalRuns: stats.totalRuns ?? 0,
      totalWickets: stats.totalWickets ?? 0,
      overs: stats.overs ?? 0,
    };
  };

  const handleUpdateMatch = async (
    matchId: string,
    teamAStats: TeamStats,
    teamBStats: TeamStats,
    status: UIMatch["status"]
  ) => {
    const sanitizedTeamAStats = sanitizeStats(teamAStats);
    const sanitizedTeamBStats = sanitizeStats(teamBStats);

    const { error } = await supabase
      .from("matches")
      .update({
        team_a_stats: sanitizedTeamAStats,
        team_b_stats: sanitizedTeamBStats,
        status,
      })
      .eq("id", matchId);

    if (error) {
      console.error("Update match error:", error);
      toast.error("Failed to update match: " + error.message);
    } else {
      toast.success("Match updated successfully!");
      await refetchMatches();
    }
  };

  const handleUpdateTeam = async (teamName: string, players: string[]) => {
    const sanitizedPlayers = players
      .filter((p): p is string => p !== undefined && p !== null && p.trim() !== "")
      .map(p => p.trim());

    const team = dbTeams.find(t => t.name === teamName);

    if (team) {
      const { error } = await supabase
        .from("teams")
        .update({ players: sanitizedPlayers })
        .eq("id", team.id);

      if (error) {
        console.error("Update error:", error);
        toast.error("Failed to update team: " + error.message);
      } else {
        toast.success(`${teamName} updated successfully!`);
        await refetchTeams();
      }
    } else {
      const { error } = await supabase
        .from("teams")
        .insert({ name: teamName, players: sanitizedPlayers });

      if (error) {
        console.error("Insert error:", error);
        toast.error("Failed to create team: " + error.message);
      } else {
        toast.success(`${teamName} created successfully!`);
        await refetchTeams();
      }
    }
  };

  // Handle team name rename (also updates all matches referencing this team)
  const handleRenameTeam = async (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;

    const team = dbTeams.find(t => t.name === oldName);
    if (!team) {
      toast.error("Team not found");
      return;
    }

    // Update team name
    const { error: teamError } = await supabase
      .from("teams")
      .update({ name: newName.trim() })
      .eq("id", team.id);

    if (teamError) {
      console.error("Rename team error:", teamError);
      toast.error("Failed to rename team: " + teamError.message);
      return;
    }

    // Update all matches that reference this team (team_a or team_b)
    const matchesToUpdateA = dbMatches.filter(m => m.team_a === oldName);
    const matchesToUpdateB = dbMatches.filter(m => m.team_b === oldName);

    for (const match of matchesToUpdateA) {
      await supabase.from("matches").update({ team_a: newName.trim() }).eq("id", match.id);
    }
    for (const match of matchesToUpdateB) {
      await supabase.from("matches").update({ team_b: newName.trim() }).eq("id", match.id);
    }

    toast.success(`Team renamed from "${oldName}" to "${newName}"!`);
    await refetchTeams();
    await refetchMatches();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={handleLogin} error={loginError} />;
  }

  const isLoading = matchesLoading || teamsLoading;

  return (
    <AdminPanel
      matches={matches}
      teams={teams}
      onUpdateMatch={handleUpdateMatch}
      onUpdateTeam={handleUpdateTeam}
      onRenameTeam={handleRenameTeam}
      onLogout={handleLogout}
      onSeedData={handleSeedData}
      onAddMatch={handleAddMatch}
      isSeeding={isSeeding}
      isLoading={isLoading}
    />
  );
}

// Main App with routing
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
