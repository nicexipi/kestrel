import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Dice6Icon, 
  LogOutIcon, 
  Settings2Icon, 
  TrophyIcon, 
  UserIcon,
  LayoutDashboardIcon,
  RulerIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-hooks';

interface NavLinkProps {
  to: string;
  icon: JSX.Element;
  children: React.ReactNode;
  isActive: boolean;
}

const NavLink = ({ to, icon, children, isActive }: NavLinkProps): JSX.Element => (
  <Button
    variant={isActive ? 'default' : 'ghost'}
    size="sm"
    asChild
  >
    <Link to={to} className="flex items-center space-x-1">
      {icon}
      <span>{children}</span>
    </Link>
  </Button>
);

export const Navbar = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string): boolean => location.pathname === path;

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/compare" className="flex items-center space-x-2">
          <Dice6Icon className="h-6 w-6" />
          <span className="font-bold">Kestrel</span>
        </Link>

        <div className="flex items-center space-x-1 ml-6">
          <NavLink 
            to="/compare" 
            icon={<LayoutDashboardIcon className="h-4 w-4" />}
            isActive={isActive('/compare')}
          >
            Comparar
          </NavLink>

          <NavLink 
            to="/ranking" 
            icon={<TrophyIcon className="h-4 w-4" />}
            isActive={isActive('/ranking')}
          >
            Ranking
          </NavLink>

          <NavLink 
            to="/dimensions" 
            icon={<RulerIcon className="h-4 w-4" />}
            isActive={isActive('/dimensions')}
          >
            Dimensões
          </NavLink>
        </div>

        <div className="flex items-center ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Menu do utilizador</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings2Icon className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}; 