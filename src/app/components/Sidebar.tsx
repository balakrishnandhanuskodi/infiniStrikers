import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Users, User } from "lucide-react";
import { PointsTable } from "./PointsTable";
import type { Match } from "./PublicFixtures";

interface Team {
  id: string;
  name: string;
  players: string[];
  player_photos?: string[];
}

interface SidebarProps {
  matches: Match[];
  teams: Team[];
}

// Get initials from player name
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function Sidebar({ matches, teams }: SidebarProps) {
  return (
    <div className="space-y-4">
      {/* Points Table */}
      <PointsTable matches={matches} />

      {/* Team List */}
      <Card className="border-green-700 bg-slate-900/50 backdrop-blur">
        <CardHeader className="pb-2 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            Teams
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {teams.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-2">No teams found</p>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="bg-slate-800/50 rounded-lg p-2">
                  <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3 text-green-400" />
                    {team.name}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {team.players.map((player, index) => {
                      const photoUrl = team.player_photos?.[index];
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-slate-700/50 rounded px-1.5 py-0.5"
                          title={player}
                        >
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={player}
                              className="w-5 h-5 rounded-full object-cover border border-green-500"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border border-green-400">
                              {player.trim() ? (
                                <span className="text-white text-[8px] font-semibold">
                                  {getInitials(player)}
                                </span>
                              ) : (
                                <User className="w-3 h-3 text-white" />
                              )}
                            </div>
                          )}
                          <span className="text-[10px] text-gray-300 truncate max-w-[60px]">
                            {player.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                    {team.players.length === 0 && (
                      <p className="text-gray-500 text-[10px]">No players</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
