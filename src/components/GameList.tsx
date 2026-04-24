
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import GameCard from './GameCard';
import BulkCalendarActions from './BulkCalendarActions';
import { parseISO, compareAsc, isBefore, isAfter, isSameDay, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GameList = () => {
  const { games, loading, error } = useData();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  if (loading) {
    return <div className="py-8 text-center">Loading games...</div>;
  }
  
  if (error) {
    return <div className="py-8 text-center text-red-500">Error: {error}</div>;
  }
  
  if (games.length === 0) {
    return <div className="py-8 text-center">No games scheduled yet.</div>;
  }
  
  const today = startOfDay(new Date());
  
  const upcomingGames = games
    .filter(game => !isBefore(parseISO(game.date), today) || isSameDay(parseISO(game.date), today))
    .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
  
  const pastGames = games
    .filter(game => isBefore(parseISO(game.date), today) && !isSameDay(parseISO(game.date), today))
    .sort((a, b) => compareAsc(parseISO(b.date), parseISO(a.date)));
  
  return (
    <div className="w-full">
      <Tabs 
        defaultValue="upcoming" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="upcoming">
            Upcoming Games ({upcomingGames.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Games ({pastGames.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4 mt-0">
          {upcomingGames.length > 0 ? (
            <>
              <BulkCalendarActions games={upcomingGames} />
              {upcomingGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </>
          ) : (
            <div className="text-center py-4">No upcoming games scheduled.</div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4 mt-0">
          {pastGames.length > 0 ? (
            pastGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))
          ) : (
            <div className="text-center py-4">No past games available.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameList;
