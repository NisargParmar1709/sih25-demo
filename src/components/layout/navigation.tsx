import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Activity, 
  Shield, 
  Building, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { User as UserType } from '../../types';

interface NavigationProps {
  user: UserType | null;
  onLogout: () => void;
}

export function Navigation({ user, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getNavItems = () => {
    if (!user) return [];

    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
    ];

    switch (user.role) {
      case 'student':
        return [
          ...commonItems,
          { name: 'Profile', href: '/student/profile', icon: User },
          { name: 'Add Activity', href: '/student/activities/new', icon: Activity },
          { name: 'Career', href: '/student/career', icon: BarChart3 },
          { name: 'Internships', href: '/student/internships', icon: Building },
        ];
      case 'mentor':
        return [
          ...commonItems,
          { name: 'Review Queue', href: '/mentor/queue', icon: Shield },
          { name: 'Batches', href: '/mentor/batches', icon: User },
          { name: 'Announcements', href: '/mentor/announcements', icon: BarChart3 },
        ];
      case 'institution':
        return [
          ...commonItems,
          { name: 'Students', href: '/institution/students', icon: User },
          { name: 'Activities', href: '/institution/activities', icon: Activity },
          { name: 'Mentors', href: '/institution/mentors', icon: Shield },
          { name: 'Reports', href: '/institution/reports', icon: BarChart3 },
        ];
      case 'admin':
        return [
          ...commonItems,
          { name: 'Institutions', href: '/admin/institutions', icon: Building },
          { name: 'Users', href: '/admin/users', icon: User },
          { name: 'Fraud Alerts', href: '/admin/fraud-alerts', icon: Shield },
          { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
          { name: 'Models', href: '/admin/models', icon: Activity },
          { name: 'Settings', href: '/admin/settings', icon: Settings },
        ];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-slate-900">Yukti-Hub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:block text-sm text-slate-700">
                  {user.name}
                </div>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t border-slate-200 py-2">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium',
                      isActive
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}