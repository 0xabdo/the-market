import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Moon,
  Globe
} from 'lucide-react';
import { useAuth } from '../../pages/auth/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGamesDropdownOpen, setIsGamesDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  // Search functionality (currently unused but kept for future use)
  // const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation(); // Currently unused but kept for future use
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  // Search functionality (currently unused but kept for future use)
  // const handleSearch = (e) => {
  //   e.preventDefault();
  //   if (searchQuery.trim()) {
  //     navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  //     setSearchQuery('');
  //   }
  // };

  // Active route checking (currently unused but kept for future use)
  // const isActive = (path) => {
  //   return location.pathname === path;
  // };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <nav className="bg-transparent absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <i className="bx bx-crown text-xl text-primary-500"></i>
            <span className="text-lg font-bold text-white">THE MARKET</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Games Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsGamesDropdownOpen(!isGamesDropdownOpen)}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
              >
                <span>Games</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {isGamesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-700">
                  <Link to="/products?category=accounts" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                    <i className="bx bx-user mr-2"></i>Accounts
                  </Link>
                  <Link to="/products?category=items" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                    <i className="bx bx-package mr-2"></i>Items
                  </Link>
                  <Link to="/products?category=currency" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                    <i className="bx bx-credit-card mr-2"></i>Currency
                  </Link>
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
              >
                <span>Services</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {isServicesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-700">
                  <Link to="/products?category=boosting" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                    <i className="bx bx-trending-up mr-2"></i>Boosting
                  </Link>
                  <Link to="/products?category=topups" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                    <i className="bx bx-gift mr-2"></i>Top Ups
                  </Link>
                  <Link to="/products?category=services" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                    <i className="bx bx-cog mr-2"></i>Other Services
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Moon className="h-5 w-5" />
            </button>

            {/* Language Selector */}
            <div className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors cursor-pointer">
              <Globe className="h-4 w-4" />
              <span className="text-sm">English | EN</span>
            </div>

            {/* User Profile */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl py-4 z-50 border border-gray-700/50">
                    {/* User Profile Section */}
                    <div className="px-4 pb-4 border-b border-gray-700/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                            <i className="bx bx-shield text-white text-lg"></i>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white">{user.username}</p>
                          <p className="text-xs text-gray-400">ID: {user.id || '591030'}</p>
                        </div>
                      </div>
                      
                      {/* Dashboard Link */}
                      <Link
                        to="/dashboard"
                        className="flex items-center px-3 py-2 text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <i className="bx bx-grid-alt mr-2 text-lg"></i>
                        Dashboard
                      </Link>
                      
                      {/* Account Balances */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center">
                            <i className="bx bx-leaf text-green-400 mr-2 text-sm"></i>
                            <span className="text-white text-xs">Store Credit</span>
                          </div>
                          <span className="text-white font-semibold text-sm">€0,00</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center">
                            <i className="bx bx-coin text-orange-400 mr-2 text-sm"></i>
                            <span className="text-white text-xs">GB Coins</span>
                          </div>
                          <span className="text-white font-semibold text-sm">0</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="px-4 py-3 space-y-1">
                      <Link
                        to="/messages"
                        className="flex items-center px-3 py-2 text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <i className="bx bx-message-dots mr-2 text-lg"></i>
                        Chat
                      </Link>
                      
                      <Link
                        to="/library"
                        className="flex items-center justify-between px-3 py-2 text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="flex items-center">
                          <i className="bx bx-library mr-2 text-lg"></i>
                          Library
                        </div>
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                      </Link>
                      
                      <Link
                        to="/wallet"
                        className="flex items-center px-3 py-2 text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <i className="bx bx-wallet mr-2 text-lg"></i>
                        Wallet
                      </Link>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-3 py-2 text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <i className="bx bx-cog mr-2 text-lg"></i>
                        Settings
                      </Link>
                    </div>
                    
                    {/* Bottom Actions */}
                    <div className="px-4 pt-3 border-t border-gray-700/50 space-y-1">
                      <button className="flex items-center justify-between w-full px-3 py-2 text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                        <div className="flex items-center">
                          <i className="bx bx-palette mr-2 text-lg"></i>
                          Change Theme
                        </div>
                        <i className="bx bx-chevron-right text-gray-400 text-sm"></i>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <i className="bx bx-log-out mr-2 text-lg"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
              <Link
                to="/products"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="bx bx-game mr-2"></i>Games
              </Link>
              <Link
                to="/products?category=boosting"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="bx bx-trending-up mr-2"></i>Services
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="bx bx-user mr-2"></i>Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <i className="bx bx-log-out mr-2"></i>Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="bx bx-log-in mr-2"></i>Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-500 hover:bg-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="bx bx-user-plus mr-2"></i>Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
