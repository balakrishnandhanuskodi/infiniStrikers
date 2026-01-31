import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Team {
  id: string;
  name: string;
  players: string[];
}

interface TeamsPageProps {
  teams: Team[];
}

export function TeamsPage({ teams }: TeamsPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Teams & Players</h1>
            <p className="text-green-200 text-sm">All participating teams</p>
          </div>
        </div>

        {teams.length === 0 ? (
          <Card className="border-green-700 bg-slate-900/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400">No teams found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id} className="border-green-700 bg-slate-900/50 backdrop-blur">
                <CardHeader className="pb-2 bg-gradient-to-r from-slate-800 to-slate-900">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {team.players.map((player, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded bg-slate-800/50"
                      >
                        <span className="w-6 h-6 flex items-center justify-center bg-green-600 text-white text-xs font-semibold rounded-full">
                          {index + 1}
                        </span>
                        <span className="text-gray-200">{player}</span>
                      </div>
                    ))}
                    {team.players.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-2">No players added</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
