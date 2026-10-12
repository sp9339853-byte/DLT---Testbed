import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FlaskConical, 
  Activity, 
  GitCompare, 
  Cpu, 
  FileText, 
  Settings, 
  Search, 
  User, 
  CheckCircle2,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Shield
} from 'lucide-react';
import { SearchDialog } from '../components/SearchDialog';
import { NotificationPanel } from '../components/NotificationPanel';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Benchmark Lab', path: '/app/benchmark', icon: FlaskConical },
    { name: 'Stress Lab', path: '/app/stress-lab', icon: Activity },
    { name: 'Comparisons', path: '/app/compare', icon: GitCompare },
    { name: 'AI Advisor', path: '/app/ai', icon: Cpu },
    { name: 'Reports', path: '/app/reports', icon: FileText },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  // Global Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 border-r border-border bg-surface-warm flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 font-semibold text-lg border-b border-border">
            <Link to="/app" className="flex items-center gap-2 tracking-tight">
              DLT TESTBED
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 text-text-muted hover:text-text-primary rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/app'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary-interaction font-medium' 
                      : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="p-3 border-t border-border space-y-2">
          {/* User profile card & quick logout */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-secondary/70 border border-border">
            <Link to="/app/settings?tab=account" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-full bg-primary-interaction/10 border border-primary-interaction/20 text-primary-interaction flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate text-text-primary">
                  {user?.name || 'Demo User'}
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  {user?.role || 'Lead Architect'}
                </div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-md transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-1 text-[11px] text-text-muted flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-status-success shrink-0" />
            <span>Benchmark Engine Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-8 bg-background shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-md hover:bg-surface-secondary"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-medium text-text-secondary truncate">
              Current Experiment: <span className="text-text-primary">PoS Heavy Load</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon Trigger */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-md border border-border transition-colors"
              title="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline font-normal">Search...</span>
              <kbd className="hidden md:inline font-mono text-[10px] bg-surface-warm px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
            </button>

            {/* Quick Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-text-muted hover:text-text-primary rounded-md hover:bg-surface-secondary transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell Component */}
            <NotificationPanel />

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center border border-border hover:border-primary-interaction hover:bg-border transition-colors text-xs font-semibold text-text-primary"
                title="Account Menu"
                aria-expanded={profileDropdownOpen}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-text-secondary" />}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-xl shadow-xl shadow-black/10 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-border">
                    <div className="font-semibold text-sm text-text-primary truncate">
                      {user?.name || 'Demo User'}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      {user?.email || 'demo@dlttestbed.com'}
                    </div>
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-interaction/10 text-primary-interaction">
                      {user?.role || 'Lead Architect'}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/app/settings?tab=account"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Account Profile</span>
                    </Link>
                    <Link
                      to="/app/settings?tab=security"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Security & Sessions</span>
                    </Link>
                    <Link
                      to="/app/settings?tab=preferences"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Preferences</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-border">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-status-error hover:bg-status-error/10 transition-colors font-medium text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>

      {/* Global Search Dialog */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
