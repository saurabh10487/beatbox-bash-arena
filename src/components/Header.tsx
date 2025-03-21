
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, Info, Music } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-apple px-6 py-4 ${
        scrolled ? 'glass-effect shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Volume2 className="h-6 w-6 text-beatbox-primary" />
          <h1 className="text-xl font-medium">BeatBox Studio</h1>
        </div>
        
        <nav className="hidden md:flex space-x-1">
          <NavLink to="/" exact>Studio</NavLink>
          <NavLink to="/tutorial">Learn</NavLink>
          <NavLink to="/challenge">Challenge</NavLink>
        </nav>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-beatbox-muted transition-colors duration-200">
            <Info className="h-5 w-5 text-beatbox-foreground opacity-80" />
          </button>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  exact?: boolean;
}

const NavLink = ({ to, children, exact }: NavLinkProps) => {
  // In a real app, we'd check if the route is active
  const isActive = window.location.pathname === to || (!exact && window.location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-beatbox-highlight text-beatbox-accent' 
          : 'hover:bg-beatbox-muted/50 text-beatbox-foreground/70 hover:text-beatbox-foreground'
      }`}
    >
      {children}
    </Link>
  );
};

export default Header;
