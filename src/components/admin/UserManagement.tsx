
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User } from '@/types';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        // Convert Supabase profile data to User type
        const formattedUsers: User[] = data.map(profile => ({
          id: profile.id,
          email: `${profile.id.substring(0, 8)}...@example.com`, // Show partial ID as email since we can't get it directly
          name: profile.name,
          isAdmin: profile.is_admin || false,
          isPlayer: profile.is_player || false,
          createdAt: profile.created_at
        }));
        
        setUsers(formattedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast({
          title: "Error",
          description: "Failed to load users.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  const toggleUserRole = async (userId: string, role: 'isAdmin' | 'isPlayer') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const supabaseRole = role === 'isAdmin' ? 'is_admin' : 'is_player';
      const newValue = !user[role];
      
      const { error } = await supabase
        .from('profiles')
        .update({ [supabaseRole]: newValue })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, [role]: newValue } 
            : u
        )
      );
      
      toast({
        title: "User Updated",
        description: `User role has been updated successfully.`,
      });
      
    } catch (err) {
      console.error('Error updating user:', err);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setIsUpdating(true);
    
    try {
      // Since we can't directly delete users from the client side,
      // we can only remove them from profiles
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
      
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: "Error",
        description: "Failed to delete user. Note: This only removes the profile, not the auth account.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-4">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <span title={user.id}>{user.id.substring(0, 8)}...</span>
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.isPlayer}
                        onCheckedChange={() => toggleUserRole(user.id, 'isPlayer')}
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.isAdmin}
                        onCheckedChange={() => toggleUserRole(user.id, 'isAdmin')}
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteUser(user.id)}
                        disabled={isUpdating}
                      >
                        <X size={16} className="mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
