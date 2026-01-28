import { useState } from "react";
import { PublicFixtures, Match, TeamStats } from "@/app/components/PublicFixtures";
import { AdminLogin } from "@/app/components/AdminLogin";
import { AdminPanel } from "@/app/components/AdminPanel";
import { Button } from "@/app/components/ui/button";
import { Toaster } from "@/app/components/ui/sonner";
import { Shield } from "lucide-react";

interface Team {
  name: string;
  players: string[];
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [matches, setMatches] = useState<Match[]>([
    // 9th February
    {
      id: "1",
      date: "9th February",
      matchNumber: 1,
      teamA: "Team A",
      teamB: "Team C",
      status: "scheduled",
      type: "group",
    },
    {
      id: "2",
      date: "9th February",
      matchNumber: 2,
      teamA: "Team B",
      teamB: "Team C",
      status: "scheduled",
      type: "group",
    },
    {
      id: "3",
      date: "9th February",
      matchNumber: 3,
      teamA: "Team A",
      teamB: "Team B",
      status: "scheduled",
      type: "group",
    },
    // 10th February
    {
      id: "4",
      date: "10th February",
      matchNumber: 1,
      teamA: "Team A",
      teamB: "Team B",
      status: "scheduled",
      type: "group",
    },
    {
      id: "5",
      date: "10th February",
      matchNumber: 2,
      teamA: "Team A",
      teamB: "Team C",
      status: "scheduled",
      type: "group",
    },
    {
      id: "6",
      date: "10th February",
      matchNumber: 3,
      teamA: "Team B",
      teamB: "Team C",
      status: "scheduled",
      type: "group",
    },
    // 11th February
    {
      id: "7",
      date: "11th February",
      matchNumber: 1,
      teamA: "Place 2",
      teamB: "Place 3",
      status: "scheduled",
      type: "semi-final",
    },
    {
      id: "8",
      date: "11th February",
      matchNumber: 2,
      teamA: "Place 1",
      teamB: "Winner of SF",
      status: "scheduled",
      type: "final",
    },
  ]);

  const [teams, setTeams] = useState<Team[]>([
    {
      name: "Team A",
      players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"],
    },
    {
      name: "Team B",
      players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"],
    },
    {
      name: "Team C",
      players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"],
    },
  ]);

  const handleLogin = (username: string, password: string) => {
    // Simple demo authentication
    if (username === "admin" && password === "admin123") {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleUpdateMatch = (
    matchId: string,
    teamAStats: TeamStats,
    teamBStats: TeamStats,
    status: Match["status"]
  ) => {
    setMatches((prev) =>
      prev.map((match) =>
        match.id === matchId
          ? { ...match, teamAStats, teamBStats, status }
          : match
      )
    );
  };

  const handleUpdateTeam = (teamName: string, players: string[]) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.name === teamName ? { ...team, players } : team
      )
    );
  };

  if (showLogin) {
    return <AdminLogin onLogin={handleLogin} error={loginError} />;
  }

  if (isAdmin) {
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