
import { useAuth } from "@/context/AuthContext";
import GameList from "@/components/GameList";

const GamesPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Game Schedule</h1>
        <p className="text-muted-foreground">
          View upcoming games, mark your attendance, and sign up for beer duty
        </p>
      </div>
      
      <GameList />
    </div>
  );
};

export default GamesPage;
