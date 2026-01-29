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

// Default data
const defaultMatches: UIMatch[] = [
  { id: "1", date: "9th February", matchNumber: 1, teamA: "Team A", teamB: "Team C", status: "scheduled", type: "group" },
  { id: "2", date: "9th February", matchNumber: 2, teamA: "Team B", teamB: "Team C", status: "scheduled", type: "group" },
  { id: "3", date: "9th February", matchNumber: 3, teamA: "Team A", teamB: "Team B", status: "scheduled", type: "group" },
  { id: "4", date: "10th February", matchNumber: 1, teamA: "Team A", teamB: "Team B", status: "scheduled", type: "group" },
  { id: "5", date: "10th February", matchNumber: 2, teamA: "Team A", teamB: "Team C", status: "scheduled", type: "group" },
  { id: "6", date: "10th February", matchNumber: 3, teamA: "Team B", teamB: "Team C", status: "scheduled", type: "group" },
  { id: "7", date: "11th February", matchNumber: 1, teamA: "Place 2", teamB: "Place 3", status: "scheduled", type: "semi-final" },
  { id: "8", date: "11th February", matchNumber: 2, teamA: "Place 1", teamB: "Winner of SF", status: "scheduled", type: "final" },
];

const defaultTeams: Team[] = [
  { id: "1", name: "Team A", players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"] },
  { id: "2", name: "Team B", players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"] },
  { id: "3", name: "Team C", players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"] },
];

// Public page component
function PublicPage() {
  const { matches: dbMatches } = useMatches();

  const matches: UIMatch[] = dbMatches.length > 0
    ? dbMatches.map(m => ({
        id: m.id,
        date: m.date,
        matchNumber: m.match_number,
        teamA: m.team_a,
        teamB: m.team_b,
        status: m.status,
        type: m.match_type,
        teamAStats: m.team_a_stats || undefined,
        teamBStats: m.team_b_stats || undefined,
      }))
    : defaultMatches;

  return <PublicFixtures matches={matches} />;
}

// Admin page component
function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [loginError, setLoginError] = useState("");

  const { matches: dbMatches, refetch: refetchMatches } = useMatches();
  const { teams: dbTeams, refetch: refetchTeams } = useTeams();

  // Convert database matches to UI format
  const matches: UIMatch[] = dbMatches.length > 0
    ? dbMatches.map(m => ({
        id: m.id,
        date: m.date,
        matchNumber: m.match_number,
        teamA: m.team_a,
        teamB: m.team_b,
        status: m.status,
        type: m.match_type,
        teamAStats: m.team_a_stats || undefined,
        teamBStats: m.team_b_stats || undefined,
      }))
    : defaultMatches;

  // Convert database teams to UI format
  const teams: Team[] = dbTeams.length > 0
    ? dbTeams.map(t => ({
        id: t.id,
        name: t.name,
        players: t.players || [],
      }))
    : defaultTeams;

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

  const handleUpdateMatch = async (
    matchId: string,
    teamAStats: TeamStats,
    teamBStats: TeamStats,
    status: UIMatch["status"]
  ) => {
    const dbMatch = dbMatches.find(m => m.id === matchId);

    if (dbMatch) {
      const { error } = await supabase
        .from("matches")
        .update({
          team_a_stats: teamAStats,
          team_b_stats: teamBStats,
          status,
        })
        .eq("id", matchId);

      if (error) {
        toast.error("Failed to update match: " + error.message);
      } else {
        toast.success("Match updated successfully!");
        await refetchMatches();
      }
    } else {
      const defaultMatch = defaultMatches.find(m => m.id === matchId);
      if (defaultMatch) {
        const { error } = await supabase
          .from("matches")
          .insert({
            match_number: defaultMatch.matchNumber,
            date: defaultMatch.date,
            team_a: defaultMatch.teamA,
            team_b: defaultMatch.teamB,
            status,
            match_type: defaultMatch.type,
            team_a_stats: teamAStats,
            team_b_stats: teamBStats,
          });

        if (error) {
          toast.error("Failed to create match: " + error.message);
        } else {
          toast.success("Match created successfully!");
          await refetchMatches();
        }
      } else {
        toast.error("Match not found");
      }
    }
  };

  const handleUpdateTeam = async (teamName: string, players: string[]) => {
    const team = dbTeams.find(t => t.name === teamName);

    if (team) {
      const { error } = await supabase
        .from("teams")
        .update({ players })
        .eq("id", team.id);

      if (error) {
        toast.error("Failed to update team: " + error.message);
      } else {
        toast.success(`${teamName} updated successfully!`);
        await refetchTeams();
      }
    } else {
      const { error } = await supabase
        .from("teams")
        .insert({ name: teamName, players });

      if (error) {
        toast.error("Failed to create team: " + error.message);
      } else {
        toast.success(`${teamName} created successfully!`);
        await refetchTeams();
      }
    }
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

  return (
    <AdminPanel
      matches={matches}
      teams={teams}
      onUpdateMatch={handleUpdateMatch}
      onUpdateTeam={handleUpdateTeam}
      onLogout={handleLogout}
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
