
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ATTENDANCE_LABELS } from '@/types';

const AttendanceReport = () => {
  const { games } = useData();
  const [selectedGameId, setSelectedGameId] = useState<string>('all');
  
  const sortedGames = [...games].sort((a, b) => 
    parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  
  // Create a consolidated attendance list
  const allPlayers = new Set<string>();
  const playerNames = new Map<string, string>();
  
  games.forEach(game => {
    game.attendance.forEach(att => {
      allPlayers.add(att.userId);
      playerNames.set(att.userId, att.userName);
    });
  });
  
  // Generate attendance data
  const playerIds = Array.from(allPlayers);
  
  // Function to get attendance for a specific game
  const getGameAttendance = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return {};
    
    return game.attendance.reduce((acc, att) => {
      acc[att.userId] = att.status;
      return acc;
    }, {} as Record<string, string | undefined>);
  };
  
  // For "all" view, compile attendance across all games
  const allGamesAttendance = playerIds.reduce((acc, playerId) => {
    acc[playerId] = {
      yes: 0,
      no: 0,
      maybe: 0,
      undefined: 0,
      total: games.length
    };
    
    games.forEach(game => {
      const status = game.attendance.find(att => att.userId === playerId)?.status;
      acc[playerId][status || 'undefined']++;
    });
    
    return acc;
  }, {} as Record<string, Record<string, number>>);
  
  // Generate CSV data for download
  const generateCsvData = () => {
    if (selectedGameId === 'all') {
      // Download summary for all games
      let csv = 'Player,Total Games,Attending,Not Attending,Maybe,No Response\n';
      
      playerIds.forEach(playerId => {
        const playerName = playerNames.get(playerId) || 'Unknown';
        const record = allGamesAttendance[playerId];
        
        csv += `"${playerName}",${record.total},${record.yes},${record.no},${record.maybe},${record.undefined}\n`;
      });
      
      return csv;
    } else {
      // Download for specific game
      const game = games.find(g => g.id === selectedGameId);
      if (!game) return '';
      
      const attendance = getGameAttendance(selectedGameId);
      let csv = `Game: ${game.opponent} on ${format(parseISO(game.date), 'MMM d, yyyy')}\n`;
      csv += 'Player,Status\n';
      
      playerIds.forEach(playerId => {
        const playerName = playerNames.get(playerId) || 'Unknown';
        const status = attendance[playerId] || 'undefined';
        const statusLabel = ATTENDANCE_LABELS[status as keyof typeof ATTENDANCE_LABELS].text;
        
        csv += `"${playerName}","${statusLabel}"\n`;
      });
      
      return csv;
    }
  };
  
  const downloadCsv = () => {
    const csv = generateCsvData();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = selectedGameId === 'all' 
      ? 'attendance-summary.csv'
      : `attendance-${selectedGameId}.csv`;
      
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Attendance Report</CardTitle>
        <div className="flex gap-2">
          <Select value={selectedGameId} onValueChange={setSelectedGameId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Game" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games Summary</SelectItem>
              {sortedGames.map(game => (
                <SelectItem key={game.id} value={game.id}>
                  {format(parseISO(game.date), 'MMM d')} - {game.opponent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={downloadCsv}>
            <Download size={16} className="mr-1" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {games.length === 0 ? (
          <div className="text-center py-4">No games to display attendance for.</div>
        ) : (
          <div className="overflow-x-auto">
            {selectedGameId === 'all' ? (
              // Summary view for all games
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Player</th>
                    <th className="text-center py-2 px-4">Attending</th>
                    <th className="text-center py-2 px-4">Not Attending</th>
                    <th className="text-center py-2 px-4">Maybe</th>
                    <th className="text-center py-2 px-4">No Response</th>
                    <th className="text-center py-2 px-4">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {playerIds.map(playerId => {
                    const playerName = playerNames.get(playerId) || 'Unknown';
                    const record = allGamesAttendance[playerId];
                    const attendanceRate = Math.round((record.yes / record.total) * 100) || 0;
                    
                    return (
                      <tr key={playerId} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{playerName}</td>
                        <td className="text-center py-2 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-attendance-yes text-white">
                            {record.yes}
                          </span>
                        </td>
                        <td className="text-center py-2 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-attendance-no text-white">
                            {record.no}
                          </span>
                        </td>
                        <td className="text-center py-2 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-attendance-maybe text-black">
                            {record.maybe}
                          </span>
                        </td>
                        <td className="text-center py-2 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
                            {record.undefined}
                          </span>
                        </td>
                        <td className="text-center py-2 px-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-attendance-yes h-2.5 rounded-full" 
                              style={{ width: `${attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{attendanceRate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              // Single game view
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Player</th>
                    <th className="text-left py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const game = games.find(g => g.id === selectedGameId);
                    if (!game) return <tr><td colSpan={2}>Game not found</td></tr>;
                    
                    const attendance = getGameAttendance(selectedGameId);
                    
                    return playerIds.map(playerId => {
                      const playerName = playerNames.get(playerId) || 'Unknown';
                      const status = attendance[playerId] || 'undefined';
                      const statusLabel = ATTENDANCE_LABELS[status as keyof typeof ATTENDANCE_LABELS];
                      
                      return (
                        <tr key={playerId} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{playerName}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded ${statusLabel.className}`}>
                              {statusLabel.emoji} {statusLabel.text}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceReport;
