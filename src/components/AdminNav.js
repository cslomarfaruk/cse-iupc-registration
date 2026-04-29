'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun,
  BarChart3,
  MessageSquare,
  HelpCircle,
  User
} from 'lucide-react';

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example notification count

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, you would update a global theme state here
  };

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: <Home size={18} /> },
    { name: 'Events', href: '/admin/events', icon: <Calendar size={18} /> },
    { name: 'Registrations', href: '/admin/registrations', icon: <Users size={18} /> },
    { name: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { name: 'Messages', href: '/admin/messages', icon: <MessageSquare size={18} /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
    { name: 'Help', href: '/admin/help', icon: <HelpCircle size={18} /> },
  ];

  const isActive = (path) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white transition-all duration-300 ${
        isScrolled ? 'shadow-lg shadow-purple-900/10' : ''
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/admin" 
            className="flex items-center space-x-2 text-xl font-bold text-white hover:text-purple-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-sm font-bold">A</span>
            </div>
            <span className="hidden sm:block">Admin Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all hover:bg-gray-800 ${
                  isActive(link.href)
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 relative transition-all">
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-red-500 rounded-full transform translate-x-1 -translate-y-1">
                  {notifications}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 transition-all">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-gray-700">
                  <User size={16} />
                </div>
              </button>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded flex items-center gap-1.5 transition-all hover:shadow-lg hover:shadow-red-800/20"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-gray-900 transition-all duration-300 ${isMenuOpen ? 'max-h-screen py-2' : 'max-h-0 overflow-hidden'}`}>
        <div className="px-2 space-y-1 pb-3 pt-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={` px-3 py-2.5 rounded-md text-base font-medium flex items-center gap-2 transition-all ${
                isActive(link.href)
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          
          <div className="border-t border-gray-700 my-2 pt-2">
            {/* Mobile User and Notifications */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-gray-700">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-gray-400">admin@example.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 relative transition-all">
                  <Bell size={18} />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-red-500 rounded-full transform translate-x-1 -translate-y-1">
                      {notifications}
                    </span>
                  )}
                </button>
                
                <button 
                  onClick={toggleDarkMode} 
                  className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
            
            {/* Mobile Logout Button */}
            <div className="px-3 pt-2">
              <button 
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded flex items-center justify-center gap-2 transition-all"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}