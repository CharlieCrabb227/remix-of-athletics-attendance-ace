
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Game, GameWithAttendance, Attendance, AttendanceStatus } from '@/types';
import { useAuth } from './AuthContext';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DataContextType {
  games: GameWithAttendance[];
  loading: boolean;
  error: string | null;
  addGame: (game: Omit<Game, 'id' | 'createdAt'>) => Promise<void>;
  updateGame: (game: Game) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  updateAttendance: (gameId: string, status: AttendanceStatus) => Promise<void>;
  assignBeerDuty: (gameId: string) => Promise<void>;
  unassignBeerDuty: (gameId: string) => Promise<void>;
  batchAddGames: (games: Omit<Game, 'id' | 'createdAt'>[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [games, setGames] = useState<GameWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load games with attendance data
  useEffect(() => {
    const loadGames = async () => {
      if (!user) {
        setGames([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Fetch all games
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('*');
          
        if (gamesError) {
          throw gamesError;
        }

        // Fetch all attendance records
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('game_attendance')
          .select('*');
          
        if (attendanceError) {
          throw attendanceError;
        }

        // Fetch profiles to get user names for attendance records
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name');
          
        if (profilesError) {
          throw profilesError;
        }

        // Create a map of user IDs to names for quick lookup
        const profilesMap = profiles.reduce((acc: Record<string, string>, profile: any) => {
          acc[profile.id] = profile.name;
          return acc;
        }, {});

        // Format attendance data with user names
        const formattedAttendance: Attendance[] = attendanceData.map((att: any) => ({
          gameId: att.game_id,
          userId: att.user_id,
          status: att.status as AttendanceStatus,
          userName: profilesMap[att.user_id] || 'Unknown User'
        }));

        // Format games with beer duty names
        const gamesWithAttendance: GameWithAttendance[] = gamesData.map((game: any) => {
          const gameAttendance = formattedAttendance.filter(a => a.gameId === game.id);
          const userAttendance = gameAttendance.find(a => a.userId === user.id)?.status;
          
          return {
            id: game.id,
            date: game.date,
            time: game.time,
            fieldName: game.field_name,
            opponent: game.opponent,
            notes: game.notes,
            beerDutyId: game.beer_duty_id,
            beerDutyName: game.beer_duty_id ? profilesMap[game.beer_duty_id] : undefined,
            createdAt: game.created_at,
            attendance: gameAttendance,
            userAttendance
          };
        });
        
        setGames(gamesWithAttendance);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load games data');
        toast({
          title: "Error",
          description: "Failed to load games data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadGames();
  }, [user, toast]);

  const addGame = async (gameData: Omit<Game, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('games')
        .insert({
          date: gameData.date,
          time: gameData.time,
          field_name: gameData.fieldName,
          opponent: gameData.opponent,
          notes: gameData.notes
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update state with new game
      const newGame: GameWithAttendance = {
        id: data.id,
        date: data.date,
        time: data.time,
        fieldName: data.field_name,
        opponent: data.opponent,
        notes: data.notes,
        createdAt: data.created_at,
        attendance: [],
        userAttendance: undefined
      };
      
      setGames(prevGames => [...prevGames, newGame]);
      
    } catch (err) {
      console.error('Error adding game:', err);
      setError('Failed to add game');
      throw err;
    }
  };

  const updateGame = async (gameData: Game) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('games')
        .update({
          date: gameData.date,
          time: gameData.time,
          field_name: gameData.fieldName,
          opponent: gameData.opponent,
          notes: gameData.notes
        })
        .eq('id', gameData.id);
        
      if (error) throw error;
      
      // Update state
      setGames(prevGames => 
        prevGames.map(g => 
          g.id === gameData.id 
            ? { ...g, ...gameData } 
            : g
        )
      );
      
    } catch (err) {
      console.error('Error updating game:', err);
      setError('Failed to update game');
      throw err;
    }
  };

  const deleteGame = async (gameId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);
        
      if (error) throw error;
      
      // Update state
      setGames(prevGames => prevGames.filter(g => g.id !== gameId));
      
    } catch (err) {
      console.error('Error deleting game:', err);
      setError('Failed to delete game');
      throw err;
    }
  };

  const updateAttendance = async (gameId: string, status: AttendanceStatus) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Check if attendance record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('game_attendance')
        .select()
        .eq('game_id', gameId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('game_attendance')
          .update({ status })
          .eq('id', existingRecord.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('game_attendance')
          .insert({
            game_id: gameId,
            user_id: user.id,
            status
          });
          
        if (insertError) throw insertError;
      }
      
      // Update state
      setGames(prevGames => 
        prevGames.map(game => {
          if (game.id !== gameId) return game;
          
          let attendance = [...game.attendance];
          const userAttIndex = attendance.findIndex(a => a.userId === user.id);
          
          if (userAttIndex !== -1) {
            // Update existing attendance
            attendance[userAttIndex] = {
              ...attendance[userAttIndex],
              status
            };
          } else {
            // Add new attendance
            attendance.push({
              gameId,
              userId: user.id,
              status,
              userName: user.name
            });
          }
          
          return {
            ...game,
            attendance,
            userAttendance: status
          };
        })
      );
      
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance');
      throw err;
    }
  };

  const assignBeerDuty = async (gameId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('games')
        .update({ beer_duty_id: user.id })
        .eq('id', gameId);
        
      if (error) throw error;
      
      // Update state
      setGames(prevGames => 
        prevGames.map(game => 
          game.id === gameId 
            ? { ...game, beerDutyId: user.id, beerDutyName: user.name } 
            : game
        )
      );
      
    } catch (err) {
      console.error('Error assigning beer duty:', err);
      setError('Failed to assign beer duty');
      throw err;
    }
  };

  const unassignBeerDuty = async (gameId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('games')
        .update({ beer_duty_id: null })
        .eq('id', gameId);
        
      if (error) throw error;
      
      // Update state
      setGames(prevGames => 
        prevGames.map(game => 
          game.id === gameId 
            ? { ...game, beerDutyId: undefined, beerDutyName: undefined } 
            : game
        )
      );
      
    } catch (err) {
      console.error('Error unassigning beer duty:', err);
      setError('Failed to unassign beer duty');
      throw err;
    }
  };

  const batchAddGames = async (gamesData: Omit<Game, 'id' | 'createdAt'>[]) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const formattedGames = gamesData.map(game => ({
        date: game.date,
        time: game.time,
        field_name: game.fieldName,
        opponent: game.opponent,
        notes: game.notes || null
      }));
      
      const { data, error } = await supabase
        .from('games')
        .insert(formattedGames)
        .select();
        
      if (error) throw error;
      
      // Update state with new games
      const newGamesWithAttendance: GameWithAttendance[] = data.map((game: any) => ({
        id: game.id,
        date: game.date,
        time: game.time,
        fieldName: game.field_name,
        opponent: game.opponent,
        notes: game.notes,
        createdAt: game.created_at,
        attendance: [],
        userAttendance: undefined
      }));
      
      setGames(prevGames => [...prevGames, ...newGamesWithAttendance]);
      
    } catch (err) {
      console.error('Error batch adding games:', err);
      setError('Failed to batch add games');
      throw err;
    }
  };

  return (
    <DataContext.Provider value={{ 
      games, 
      loading, 
      error, 
      addGame, 
      updateGame, 
      deleteGame, 
      updateAttendance, 
      assignBeerDuty, 
      unassignBeerDuty, 
      batchAddGames 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
