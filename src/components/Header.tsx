
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="bg-athletic-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 
            className="text-xl font-bold cursor-pointer flex items-center" 
            onClick={() => navigate('/')}
          >
            <span className="text-athletic-yellow">Kanata</span>
            <span className="text-athletic-green">Athletics</span>
          </h1>
        </div>
        
        {user && (
          <nav className="hidden md:flex items-center space-x-4">
            <Button 
              variant={isActive('/') ? "secondary" : "ghost"} 
              onClick={() => navigate('/')}
              className="text-white hover:text-athletic-yellow"
            >
              Games
            </Button>
            
            {user.isAdmin && (
              <Button 
                variant={isActive('/admin') ? "secondary" : "ghost"} 
                onClick={() => navigate('/admin')}
                className="text-white hover:text-athletic-yellow"
              >
                Admin
              </Button>
            )}
            
            <Button 
              variant={isActive('/account') ? "secondary" : "ghost"} 
              onClick={() => navigate('/account')}
              className="text-white hover:text-athletic-yellow"
            >
              Account
            </Button>
            
            <Button 
              variant="ghost" 
              className="flex items-center gap-1 text-white hover:text-athletic-yellow"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </nav>
        )}
        
        {/* Mobile menu button - would expand to show mobile menu */}
        {user && (
          <div className="md:hidden">
            <Button variant="ghost" className="text-white p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
