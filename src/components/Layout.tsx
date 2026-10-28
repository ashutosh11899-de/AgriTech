import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Leaf, LayoutDashboard, Sprout, CloudSun, ShoppingBag,
  Users, Settings, LogOut, Bell, ChevronDown, Menu, X,
  Bug, Tractor, CreditCard
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'farms', label: 'My Farms', icon: <Tractor className="w-5 h-5" /> },
  { id: 'crops', label: 'Crop Monitoring', icon: <Sprout className="w-5 h-5" /> },
  { id: 'weather', label: 'Weather & Pests', icon: <CloudSun className="w-5 h-5" /> },
  { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-5 h-5" /> },
  { id: 'orders', label: 'My Orders', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'experts', label: 'Expert Consultation', icon: <Users className="w-5 h-5" /> },
  { id: 'admin', label: 'Admin Panel', icon: <Settings className="w-5 h-5" />, adminOnly: true },
];

type Props = {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: ReactNode;
};

export default function Layout({ currentPage, onNavigate, children }: Props) {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const visibleNav = navItems.filter(item => !item.adminOnly || isAdmin);

  function handleNav(id: string) {
    onNavigate(id);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 bg-gradient-to-b from-green-900 to-green-800 shadow-2xl transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-green-700">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">AgriTech</div>
            <div className="text-green-400 text-xs mt-0.5">Smart Farm Manager</div>
          </div>
          <button className="ml-auto lg:hidden text-green-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile chip */}
        <div className="mx-4 my-4 bg-green-800/60 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() || 'F'}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{profile?.full_name || 'Farmer'}</div>
            <div className="text-green-400 text-xs capitalize">{profile?.role || 'farmer'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-0.5 flex-1 overflow-y-auto">
          {visibleNav.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${currentPage === item.id
                  ? 'bg-green-500 text-white shadow-lg shadow-green-900/30'
                  : 'text-green-200 hover:bg-green-700/50 hover:text-white'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 mt-4 border-t border-green-700">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-green-300 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center gap-4 px-4 md:px-6 py-3.5">
            <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-800 capitalize">
                {navItems.find(n => n.id === currentPage)?.label || 'Dashboard'}
              </h2>
            </div>
            <button className="relative w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(v => !v)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 transition-colors"
              >
                <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {profile?.full_name?.[0]?.toUpperCase() || 'F'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">
                  {profile?.full_name || 'Farmer'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                  <button onClick={() => { handleNav('profile'); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    My Profile
                  </button>
                  <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
