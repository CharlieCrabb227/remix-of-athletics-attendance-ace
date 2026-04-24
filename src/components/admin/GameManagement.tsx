
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';
import { Check, Trash2, Edit, Plus, Calendar } from 'lucide-react';
import { Game } from '@/types';
import { useToast } from '@/hooks/use-toast';

const GameManagement = () => {
  const { games, addGame, updateGame, deleteGame, batchAddGames, loading } = useData();
  const [newGame, setNewGame] = useState({
    date: '',
    time: '',
    fieldName: '',
    opponent: '',
    notes: ''
  });
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [batchGamesText, setBatchGamesText] = useState('');
  const { toast } = useToast();
  
  const resetNewGame = () => {
    setNewGame({
      date: '',
      time: '',
      fieldName: '',
      opponent: '',
      notes: ''
    });
  };
  
  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addGame(newGame);
      resetNewGame();
      setIsAddDialogOpen(false);
      toast({
        title: "Game Added",
        description: "The game has been added successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add game. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to add game', err);
    }
  };
  
  const handleUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingGame) return;
    
    try {
      await updateGame(editingGame);
      setEditingGame(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Game Updated",
        description: "The game has been updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update game. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to update game', err);
    }
  };
  
  const handleDeleteGame = async (gameId: string) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    
    try {
      await deleteGame(gameId);
      toast({
        title: "Game Deleted",
        description: "The game has been deleted successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete game. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to delete game', err);
    }
  };
  
  const handleBatchAddGames = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simple parser - expects format like:
      // 2023-05-01,18:30,Kinsmen Field,Ottawa Brewers,Optional Notes
      const lines = batchGamesText.trim().split('\n');
      const gamesToAdd = lines.map(line => {
        const [date, time, fieldName, opponent, notes = ''] = line.split(',').map(s => s.trim());
        return { date, time, fieldName, opponent, notes };
      });
      
      await batchAddGames(gamesToAdd);
      setBatchGamesText('');
      setIsBatchDialogOpen(false);
      toast({
        title: "Games Added",
        description: `${gamesToAdd.length} games have been added successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add games. Please check the format and try again.",
        variant: "destructive",
      });
      console.error('Failed to batch add games', err);
    }
  };
  
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Game Management</CardTitle>
          <div className="flex gap-2">
            <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Calendar size={16} />
                  Batch Add Games
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Batch Add Games</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBatchAddGames} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchGames">
                      Enter games in CSV format (one per line):
                    </Label>
                    <div className="text-xs text-muted-foreground mb-1">
                      Format: YYYY-MM-DD,HH:MM,Field Name,Opponent,Notes
                    </div>
                    <Textarea
                      id="batchGames"
                      value={batchGamesText}
                      onChange={(e) => setBatchGamesText(e.target.value)}
                      placeholder="2023-05-01,18:30,Kinsmen Field,Ottawa Brewers,Bring white jersey"
                      rows={8}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Check size={16} className="mr-1" />
                      Add Games
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-1" />
                  Add Game
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Game</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddGame} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newGame.date}
                        onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newGame.time}
                        onChange={(e) => setNewGame({...newGame, time: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fieldName">Field Name</Label>
                    <Input
                      id="fieldName"
                      value={newGame.fieldName}
                      onChange={(e) => setNewGame({...newGame, fieldName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opponent">Opponent</Label>
                    <Input
                      id="opponent"
                      value={newGame.opponent}
                      onChange={(e) => setNewGame({...newGame, opponent: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={newGame.notes}
                      onChange={(e) => setNewGame({...newGame, notes: e.target.value})}
                      placeholder="Any special instructions or notes"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Check size={16} className="mr-1" />
                      Add Game
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading games...</div>
          ) : games.length === 0 ? (
            <div className="text-center py-4">No games scheduled yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Time</th>
                    <th className="text-left py-2 px-4">Field</th>
                    <th className="text-left py-2 px-4">Opponent</th>
                    <th className="text-left py-2 px-4">Beer Duty</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...games]
                    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
                    .map((game) => (
                    <tr key={game.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{format(parseISO(game.date), 'MMM d, yyyy')}</td>
                      <td className="py-2 px-4">{game.time}</td>
                      <td className="py-2 px-4">{game.fieldName}</td>
                      <td className="py-2 px-4">{game.opponent}</td>
                      <td className="py-2 px-4">{game.beerDutyName || 'Unclaimed'}</td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <Dialog open={isEditDialogOpen && editingGame?.id === game.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (!open) setEditingGame(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingGame(game)}>
                                <Edit size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Game</DialogTitle>
                              </DialogHeader>
                              {editingGame && (
                                <form onSubmit={handleUpdateGame} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-date">Date</Label>
                                      <Input
                                        id="edit-date"
                                        type="date"
                                        value={editingGame.date}
                                        onChange={(e) => setEditingGame({...editingGame, date: e.target.value})}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-time">Time</Label>
                                      <Input
                                        id="edit-time"
                                        type="time"
                                        value={editingGame.time}
                                        onChange={(e) => setEditingGame({...editingGame, time: e.target.value})}
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-fieldName">Field Name</Label>
                                    <Input
                                      id="edit-fieldName"
                                      value={editingGame.fieldName}
                                      onChange={(e) => setEditingGame({...editingGame, fieldName: e.target.value})}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-opponent">Opponent</Label>
                                    <Input
                                      id="edit-opponent"
                                      value={editingGame.opponent}
                                      onChange={(e) => setEditingGame({...editingGame, opponent: e.target.value})}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-notes">Notes (Optional)</Label>
                                    <Textarea
                                      id="edit-notes"
                                      value={editingGame.notes || ''}
                                      onChange={(e) => setEditingGame({...editingGame, notes: e.target.value})}
                                      placeholder="Any special instructions or notes"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => {
                                      setEditingGame(null);
                                      setIsEditDialogOpen(false);
                                    }}>
                                      Cancel
                                    </Button>
                                    <Button type="submit">
                                      <Check size={16} className="mr-1" />
                                      Update Game
                                    </Button>
                                  </div>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteGame(game.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameManagement;
