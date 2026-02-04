import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Users, User, ScrollText, ChevronDown, ChevronUp } from "lucide-react";
import { PointsTable } from "./PointsTable";
import type { Match } from "./PublicFixtures";

const TOURNAMENT_GUIDELINES = [
  "Matches to be played between 6.00 PM – 7.00 PM.",
  "5.45 PM all team players should be there and all players should be there till the last ball is bowled for the day irrespective of their match schedule.",
  "Matches will be 5 Overs per side.",
  "For Tied match, the result will be decided through Super Over.",
  "Every player will be allowed to bowl only 1 Over per match.",
  "1 Run will be added to the Team Score for every Wide and No Ball. Double Bounce before the Batsman will be called Dead Ball and No Run will be given (even it goes wide).",
  "1 Run will be added to the Team every time the ball goes to the Adjacent House irrespective of where it gets pitched inside our office (within the Boundary Line). If it goes directly, it will be treated as Batsman Out.",
  "All decisions will be from the Umpire and his decision is final. No arguments allowed. Discussion with Umpire will be done only by the Captains. No Team player will discuss the issue with neither the Umpire nor Opponent. The Team that argues will be penalized.",
];

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
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false);

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

      {/* Tournament Guidelines - Collapsible */}
      <Card className="border-green-700/50 bg-slate-900/30 backdrop-blur">
        <CardHeader
          className="pb-2 pt-3 px-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
          onClick={() => setGuidelinesExpanded(!guidelinesExpanded)}
        >
          <CardTitle className="text-xs text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ScrollText className="w-3 h-3" />
              Tournament Guidelines
            </span>
            {guidelinesExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </CardTitle>
        </CardHeader>
        {guidelinesExpanded && (
          <CardContent className="px-3 pb-3 pt-0">
            <ol className="space-y-2 text-[10px] text-gray-400 list-decimal list-outside ml-3">
              {TOURNAMENT_GUIDELINES.map((guideline, index) => (
                <li key={index} className="leading-relaxed">
                  {guideline}
                </li>
              ))}
            </ol>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
