
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GameManagement from '@/components/admin/GameManagement';
import UserManagement from '@/components/admin/UserManagement';
import AttendanceReport from '@/components/admin/AttendanceReport';
import BeerDutyReport from '@/components/admin/BeerDutyReport';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('games');
  
  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="beer">Beer Duty</TabsTrigger>
        </TabsList>
        
        <TabsContent value="games">
          <GameManagement />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="attendance">
          <AttendanceReport />
        </TabsContent>
        
        <TabsContent value="beer">
          <BeerDutyReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
