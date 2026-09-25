import type { FC } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { MessageSquare, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean; // Made optional since it's not used
}

const Navbar: FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Don't render navbar on login or register pages
  if (router.pathname === '/login' || router.pathname === '/register' || router.pathname === '/404' || router.pathname === '/_error') {
    return null;
  }
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'nl'>('en');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  let languageTimeout: NodeJS.Timeout;
  let profileTimeout: NodeJS.Timeout;

  // console.log('Navbar user data:', user);

  const languages = {
    en: { flag: '/images/en.png', name: 'English' },
    nl: { flag: '/images/nl.png', name: 'Dutch' }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleLanguage = () => {
    setLanguageOpen(!languageOpen);
  };

  const toggleProfile = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-cream-200 shadow-sm animate-fade-in print:hidden">
      <div className="flex items-center justify-between h-16 px-2 md:px-4">
        <div className="flex items-center space-x-4 md:space-x-6">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-cream-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
            title="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-cream-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
            title="Toggle menu"
          >
            <Menu size={20} />
          </button>
          
          {/* <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/products" 
              className="no-underline px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-cream-100 rounded-lg transition-all duration-300"
            >
              Product
            </Link>
            <Link 
              href="/customers" 
              className="no-underline px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-cream-100 rounded-lg transition-all duration-300"
            >
              Customer
            </Link>
            <Link 
              href="/help" 
              className="no-underline px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-cream-100 rounded-lg transition-all duration-300"
            >
              Help
            </Link>
          </nav> */}
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-cream-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95">
            <MessageSquare size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* <NotificationBell /> */}
{/*           
          <div className="relative hidden sm:block">
            <div 
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-cream-100 rounded-lg transition-all duration-300 cursor-pointer"
              onMouseEnter={() => {
                clearTimeout(languageTimeout);
                setLanguageOpen(true);
              }}
              onMouseLeave={() => {
                languageTimeout = setTimeout(() => {
                  setLanguageOpen(false);
                }, 200);
              }}
              onClick={toggleLanguage}
            >
              <img 
  src={languages[selectedLanguage].flag} 
  alt={`${languages[selectedLanguage].name} flag`}
  className="w-6 h-4 object-cover rounded-sm"
/>
              <span className="font-medium hidden sm:inline">{languages[selectedLanguage].name}</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${languageOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {languageOpen && (
              <div 
                className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-cream-200 py-2 animate-scale-in"
                onMouseEnter={() => {
                  clearTimeout(languageTimeout);
                  setLanguageOpen(true);
                }}
                onMouseLeave={() => {
                  languageTimeout = setTimeout(() => {
                    setLanguageOpen(false);
                  }, 200);
                }}
              >
                {Object.entries(languages).map(([code, lang]) => (
                  <button
                    key={code}
                    onClick={() => {
                      setSelectedLanguage(code as 'en' | 'nl');
                      setLanguageOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-cream-50 transition-colors ${
                      selectedLanguage === code ? 'bg-cream-100 text-gray-900 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <img 
  src={lang.flag} 
  alt={`${lang.name} flag`}
  className="w-6 h-4 object-cover rounded-sm"
/>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div> */}

          <div className="flex items-center ml-2">
            <div className="relative">
              <div 
                className="flex items-center bg-gradient-to-r from-blue-900 to-blue-800 text-white px-3 py-2 md:px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                onMouseEnter={() => {
                  clearTimeout(profileTimeout);
                  setProfileDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  profileTimeout = setTimeout(() => {
                    setProfileDropdownOpen(false);
                  }, 200);
                }}
                onClick={toggleProfile}
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-700 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                  {user?.firstName?.[0]}{user?.lastName?.[0] || 'U'}
                </div>
                <div className="ml-2 md:ml-3 flex items-center">
                  <span className="text-xs text-blue-200 hidden sm:inline">Hello,</span>
                  <span className="text-sm font-semibold ml-0 sm:ml-1 hidden md:inline">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}</span>
                </div>
                <ChevronDown size={16} className="ml-2 text-blue-300" />
              </div>
              
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-cream-200 py-2 animate-scale-in"
                  onMouseEnter={() => {
                    clearTimeout(profileTimeout);
                    setProfileDropdownOpen(true);
                  }}
                  onMouseLeave={() => {
                    profileTimeout = setTimeout(() => {
                      setProfileDropdownOpen(false);
                    }, 200);
                  }}
                >
                  {/* <div className="px-4 py-2 border-b border-cream-200">
                    <p className="text-xs text-gray-500">No packing station selected</p>
                  </div> */}
                  {user?.is_cadmin === '1' && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        router.push('/change-password');
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50 transition-colors"
                    >
                      Change Password
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-cream-200 shadow-lg animate-fade-in">
          <nav className="flex flex-col px-4 py-3 space-y-2">
            <Link 
              href="/dashboard" 
              className="no-underline px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-cream-100 rounded-lg transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
