import { useState } from "react";
import { PublicFixtures, Match as UIMatch, TeamStats } from "@/app/components/PublicFixtures";
import { AdminLogin } from "@/app/components/AdminLogin";
import { AdminPanel } from "@/app/components/AdminPanel";
import { Button } from "@/app/components/ui/button";
import { Toaster } from "@/app/components/ui/sonner";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useMatches, useTeams } from "@/lib/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  players: string[];
}

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const { matches: dbMatches, loading: matchesLoading, refetch: refetchMatches } = useMatches();
  const { teams: dbTeams, loading: teamsLoading, refetch: refetchTeams } = useTeams();

  // Default matches if none in database
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
      setShowLogin(false);
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
      await refetchMatches();
    }
  };

  const handleUpdateTeam = async (teamName: string, players: string[]) => {
    const team = dbTeams.find(t => t.name === teamName);
    if (!team) {
      toast.error("Team not found");
      return;
    }

    const { error } = await supabase
      .from("teams")
      .update({ players })
      .eq("id", team.id);

    if (error) {
      toast.error("Failed to update team: " + error.message);
    } else {
      await refetchTeams();
    }
  };

  // Show loading state
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

  if (showLogin) {
    return <AdminLogin onLogin={handleLogin} error={loginError} />;
  }

  if (user) {
    return (
      <>
        <AdminPanel
          matches={matches}
          teams={teams}
          onUpdateMatch={handleUpdateMatch}
          onUpdateTeam={handleUpdateTeam}
          onLogout={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <Button
          className="fixed top-4 right-4 z-50 shadow-lg"
          onClick={() => setShowLogin(true)}
          size="sm"
        >
          <Shield className="w-4 h-4 mr-2" />
          Admin
        </Button>
        <PublicFixtures matches={matches} />
      </div>
      <Toaster />
    </>
  );
}

export default App;
