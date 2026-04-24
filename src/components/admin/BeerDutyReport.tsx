
import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const BeerDutyReport = () => {
  const { games } = useData();
  
  // Sort games by date
  const sortedGames = useMemo(() => [...games].sort((a, b) => 
    parseISO(a.date).getTime() - parseISO(b.date).getTime()
  ), [games]);
  
  // Count beer duties per player
  const beerDutyCounts = useMemo(() => {
    const counts: Record<string, { count: number; name: string }> = {};
    
    games.forEach(game => {
      if (game.beerDutyId && game.beerDutyName) {
        if (!counts[game.beerDutyId]) {
          counts[game.beerDutyId] = { count: 0, name: game.beerDutyName };
        }
        counts[game.beerDutyId].count++;
      }
    });
    
    // Convert to array and sort by count (descending)
    return Object.entries(counts)
      .map(([id, data]) => ({ id, name: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count);
  }, [games]);
  
  // Generate CSV data
  const generateCsvData = () => {
    let csv = 'Date,Opponent,Field,Beer Duty\n';
    
    sortedGames.forEach(game => {
      const date = format(parseISO(game.date), 'yyyy-MM-dd');
      csv += `"${date}","${game.opponent}","${game.fieldName}","${game.beerDutyName || 'Unclaimed'}"\n`;
    });
    
    csv += '\n\nSummary:\n';
    csv += 'Player,Beer Duty Count\n';
    
    beerDutyCounts.forEach(player => {
      csv += `"${player.name}",${player.count}\n`;
    });
    
    return csv;
  };
  
  const downloadCsv = () => {
    const csv = generateCsvData();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'beer-duty-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Beer Duty Report</CardTitle>
        <Button variant="outline" onClick={downloadCsv}>
          <Download size={16} className="mr-1" />
          Export CSV
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Beer Duty Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-y-auto max-h-96">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-left py-2 px-4">Game</th>
                      <th className="text-left py-2 px-4">Beer Duty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedGames.map(game => (
                      <tr key={game.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{format(parseISO(game.date), 'MMM d, yyyy')}</td>
                        <td className="py-2 px-4">vs {game.opponent}</td>
                        <td className="py-2 px-4">
                          {game.beerDutyName ? (
                            <span className="font-medium">{game.beerDutyName}</span>
                          ) : (
                            <span className="text-gray-500">Unclaimed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Beer Duty Counts</CardTitle>
            </CardHeader>
            <CardContent>
              {beerDutyCounts.length === 0 ? (
                <div className="text-center py-4">No beer duties assigned yet.</div>
              ) : (
                <div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Player</th>
                        <th className="text-left py-2 px-4">Count</th>
                        <th className="text-left py-2 px-4">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {beerDutyCounts.map(player => {
                        const totalAssigned = games.filter(g => g.beerDutyId).length;
                        const percentage = totalAssigned ? Math.round((player.count / totalAssigned) * 100) : 0;
                        
                        return (
                          <tr key={player.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">{player.name}</td>
                            <td className="py-2 px-4">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full beer-duty">
                                {player.count}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className="bg-athletic-yellow h-2.5 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p>Total games: {games.length}</p>
                    <p>Games with beer duty assigned: {games.filter(g => g.beerDutyId).length}</p>
                    <p>Games with beer duty unclaimed: {games.filter(g => !g.beerDutyId).length}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeerDutyReport;
