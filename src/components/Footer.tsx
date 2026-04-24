
import { useAuth } from "@/context/AuthContext";

const Footer = () => {
  const { user } = useAuth();
  
  return (
    <footer className="bg-athletic-black text-white py-4 mt-auto">
      <div className="container mx-auto text-center text-sm">
        <p>© {new Date().getFullYear()} Kanata Athletics. All rights reserved.</p>
        {user?.isAdmin && (
          <p className="mt-1 text-xs text-gray-400">
            Admin user: {user.email}
          </p>
        )}
      </div>
    </footer>
  );
};

export default Footer;
