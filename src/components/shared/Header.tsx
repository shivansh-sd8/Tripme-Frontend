"use client";
import React, { useState ,useEffect } from 'react';
import { useUI } from "@/core/store/uiContext";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter ,usePathname } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import Dropdown from '../ui/Dropdown';
import AirbnbSearchForm from '../trips/AirbnbSearchForm';
import MobileSearchSheet from "@/components/trips/mobileSearchForm";

import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Heart,
  Calendar,
  MapPin,
  ChevronDown,
  Home,
  Bell,
  BookOpen,
  ArrowLeft,
  Star,
  Sparkles,
  Search,
  Shield,
  Filter
} from 'lucide-react';
import { boolean } from 'zod/v4';



interface HeaderProps {
  searchExpanded?: boolean;
  onSearchToggle?: (expanded: boolean) => void;
  onSearch?: (location: any, guestsCount?: number, checkInDate?: string, checkOutDate?: string) => void;
  hideSearch?: boolean;
  visibleFilter?: boolean;
  onFilterClick?: () => void;
}

const Header =({searchExpanded: externalSearchExpanded, 
  onSearchToggle, 
  onSearch,
  hideSearch = false,
  visibleFilter = false,
  onFilterClick 
} : HeaderProps ={}) => {

    // 
  const { hideHeader } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<'homes' | 'services' | 'stories' | null>(null);
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalSearchExpanded, setInternalSearchExpanded] = useState(false);
  const searchExpanded = externalSearchExpanded !== undefined ? externalSearchExpanded : internalSearchExpanded;
  const setSearchExpanded = onSearchToggle || setInternalSearchExpanded;
  const [scrolled, setScrolled] = useState(false);
  const [hideMobileHeader, setHideMobileHeader] = useState(false);
  

  
 
  // Set active category based on current route
  useEffect(() => {
    if (pathname === '/services') {
      setActiveCategory('services');
    } else if (pathname === '/stories') {
      setActiveCategory('stories');
    } else if (pathname === '/search') {
      setActiveCategory('homes');
    } else {
      setActiveCategory(null); // Default state - nothing selected
    }
  }, [pathname]); 

   useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Only refresh once when component mounts
      const shouldRefresh = !user || user.role === 'guest';
      if (shouldRefresh) {
        refreshUser();
      }
    }
  }, [isAuthenticated, isLoading]); 
  

   useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  

  // handle logout
  const handleLogout = async () => {
    try {
      // Logout is handled by the auth service
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


   useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
    };

    const handleClickOutside = (e: MouseEvent) => {
    };

    if (searchExpanded) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [searchExpanded]);


 

   if (isLoading) {
    return null;
  }

    if (hideMobileHeader && typeof window !== 'undefined' && window.innerWidth < 640) {
    return null;
  }
  
   const shouldShowFullHeader = hideSearch ? true : ((!scrolled || searchExpanded) && (pathname !== '/stories' || searchExpanded) && (pathname !== '/search' || searchExpanded) &&
   (pathname !== '/rooms' || searchExpanded)
  );

  
  return (
    <>
    <header className={`w-full z-50 fixed top-0 left-0 right-0
                       transition-all duration-300"
                       ${hideHeader ? "hidden sm:block" : ""}
                        ${scrolled && !searchExpanded
                        ? 'bg-white border-b border-gray-200 shadow-lg' 
                        : 'bg-white border-b border-gray-100'}
                       `}
                       >
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Main Nav Bar container */}
      <div className={`flex item-center justify-between relative transition-all duration-500 ease-in-out ${
          shouldShowFullHeader ? 'h-20' : 'h-24 my-1' }`}>
          <Link href="/" className={`flex items-center group relative z-10 ${
            !shouldShowFullHeader ? 'pt-1' : ''
          }`}>
                        <div className="relative">
                          <Image
                            src="/logo.png"
                            alt="TripMe"
                            width={120}
                            height={120}
                            className="h-30 w-30 object-contain transition-transform duration-300 group-hover:scale-110"
                            priority
                          />
                        </div>
                      </Link>

                    {shouldShowFullHeader ? <div className="hidden lg:flex items-center gap-12 transition-all duration-500 ease-in-out">
              <button
                onClick={() => {
                  setActiveCategory('homes');
                  router.push('/search');
                }}
                className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-200 group relative ${activeCategory === 'homes'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <Home size={22} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium text-base">Homes</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategory('services');
                  router.push('/services');
                }}
                className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-200 group relative ${activeCategory === 'services'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <Bell size={22} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium text-base">Services</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategory('stories');
                  router.push('/stories');
                }}
                className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-200 group relative ${activeCategory === 'stories'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <BookOpen size={22} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium text-base">Stories</span>
              </button>
                      </div>
                      :(
            <div className="hidden lg:flex items-center transition-all duration-500 ease-in-out">
              <div 
                className="bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-500 ease-in-out p-1 cursor-pointer"
                onClick={() => setSearchExpanded(true)}
              >
                <div className="flex items-center justify-between">
                  {/* Location */}
                  <div className="flex items-center gap-3 px-3 py-1 flex-1 hover:bg-gray-50 rounded-lg transition-colors">
                    <MapPin className="text-gray-600" size={18} />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Where?</div>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px h-6 bg-gray-300"></div>
                  
                  {/* Dates */}
                  <div className="flex items-center gap-3 px-3 py-1 flex-1 hover:bg-gray-50 rounded-lg transition-colors">
                    <Calendar className="text-gray-600" size={18} />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">When</div>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px h-6 bg-gray-300"></div>
                  
                  {/* Guests */}
                  <div className="flex items-center gap-3 px-3 py-1 flex-1 hover:bg-gray-50 rounded-lg transition-colors">
                    <User className="text-gray-600" size={18} />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Who?</div>
                    </div>
                  </div>
                  
                  {/* Search Button */}
                  <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-1.5 rounded-full transition-all duration-200 ml-2">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
           
          )} 

          {visibleFilter && (
            <div className="hidden lg:flex items-center transition-all duration-500 ease-in-out">
             {/* className="bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-500 ease-in-out p-1 cursor-pointer */}
              <button
      onClick={onFilterClick}
      className="bg-white border border-gray-300 rounded-full shadow-sm
                 hover:shadow-md transition-all duration-500 ease-in-out
                 p-1 cursor-pointer"
      type="button"
    >
            <div className="flex items-center gap-3 px-3 py-1 flex-1 hover:bg-gray-50 rounded-lg transition-colors"  onClick={onFilterClick}>
                    <Filter className="text-gray-600" size={18} />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Filter</div>
                    </div>
              </div>
               </button>
          </div>
         
          ) }




                       {/* Desktop actions right side*/}
                       <div className={`hidden lg:flex items-center gap-4 ${!shouldShowFullHeader ? 'pt-1' : ''}`}>
                        {/* Host Button */}
                        {isAuthenticated && user?.role === 'host' ? (
                          <Link href="/host/dashboard">
                            <span className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors duration-200">
                              Host Dashboard
                            </span>
                          </Link>
                        ) : (
                          <Link href="/become-host">
                            <span className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors duration-200">
                              Become a host
                            </span>
                          </Link>
                        )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-200 border border-gray-300 rounded-full"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/user/profile"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={20} />
                      <span className="font-medium">Profile</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Heart size={20} />
                      <span className="font-medium">Wishlist</span>
                    </Link>
                    <Link
                      href="/bookings"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Calendar size={20} />
                      <span className="font-medium">My Bookings</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield size={20} />
                          <span className="font-medium">Admin Portal</span>
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Dropdown
                trigger={
                  <button
                    className="flex items-center justify-center gap-2 p-2 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-200 border border-gray-300"
                    aria-haspopup="true"
                  >
                    <Menu size={20} className="text-gray-700" />
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                      <User size={16} className="text-white flex-shrink-0" />
                    </div>
                  </button>
                }
                align="right"
              >
                <div className="py-2 space-y-2">
                  <Link
                    href="/auth/login"
                    className="block w-full text-center px-4 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full text-center px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              </Dropdown>
            )}
                       </div>

                       {/* mobile menu button */}
                       {/* TODO . */}
                      {/* Need to create three tabs like home , services and stories */}
                          
                         {visibleFilter ? (
                             <div className="flex items-center transition-all duration-500 ease-in-out lg:hidden">
             {/* className="bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-500 ease-in-out p-1 cursor-pointer */}
              <button
      onClick={onFilterClick}
      className="bg-white border border-gray-300 rounded-full shadow-sm
                 hover:shadow-md transition-all duration-500 ease-in-out
                 p-1 cursor-pointer "
      type="button"
    >
            <div className="flex items-center gap-3 px-3 py-1 flex-1 hover:bg-gray-50 rounded-lg transition-colors"  onClick={onFilterClick}>
                    <Filter className="text-gray-600" size={18} />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Filter</div>
                    </div>
              </div>
               </button>
          </div>
                         ) :  <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                          >
                            {mobileMenuOpen ? (
                              <X size={24} className="text-gray-700" />
                            ) : (
                              <Menu size={24} className="text-gray-700" />
                            )}
                          </button>} 
                          
                         
  

      </div>

      {/* Mobile menu */}
      {/* this code replace with tab menu */}
      {mobileMenuOpen && (
       <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  setActiveCategory('homes');
                  router.push('/search');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left transition-all duration-200 ${activeCategory === 'homes'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <Home size={20} />
                <span className="font-medium">Homes</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategory('services');
                  router.push('/services');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left transition-all duration-200 ${activeCategory === 'services'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <Bell size={20} />
                <span className="font-medium">Services</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategory('stories');
                  router.push('/stories');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left transition-all duration-200 ${activeCategory === 'stories'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <BookOpen size={20} />
                <span className="font-medium">Stories</span>
              </button>

              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <Link
                      href="/user/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={20} />
                      <span className="font-medium">Profile</span>
                    </Link>

                     <Link
                      href="/wishlist"
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart size={20} />
                      <span className="font-medium">Wishlist</span>
                    </Link>
                    <Link
                      href="/bookings"
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar size={20} />
                      <span className="font-medium">My Bookings</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield size={20} />
                        <span className="font-medium">Admin Portal</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">Sign out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <Link
                    href="/auth/login"
                    className="block w-full text-center px-4 py-3 rounded-2xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full text-center px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
      </div> )}
   
     {shouldShowFullHeader &&  !hideHeader &&( <div className="hidden lg:flex justify-center w-full pb-3">
          <div className="w-full max-w-4xl">
            <AirbnbSearchForm
              variant="compact"
              activeCategory={activeCategory}
              onSearch={onSearch}
            />
          </div>
        
      </div> )}

{/* mobile search form */}
   <div className="md:hidden px-4 pb-3">
          <button
            onClick={() => setSearchExpanded(true)}
            className="
      w-full
      bg-white
      border border-gray-200
      rounded-full
      shadow-sm
      flex items-center gap-3
      px-4 py-3
      text-left
    "
          >
            <Search className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 font-medium">
              Start your search
            </span>
          </button>
        </div>

    </div>

    </header>

    {hideHeader && (
  <div className="lg:hidden sticky top-0 z-50 bg-white">
    <div className="flex items-center gap-3 px-4 py-3">

      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0"
      >
        <ArrowLeft className="w-4 h-4 text-gray-900" />
      </button>

      {/* Search bar */}
      <button
        onClick={() => setSearchExpanded(true)}
        className="
          flex-1
          bg-white
          border border-gray-200
          rounded-full
          shadow-sm
          flex items-center gap-3
          px-4 py-2.5
          text-left
        "
      >
        <Search className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700 font-medium truncate">
          Start your search
        </span>
      </button>

      {/* Filter button */}
      {visibleFilter && (
        <button
          onClick={onFilterClick}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0"
        >
          <Filter className="w-4 h-4 text-gray-700" />
        </button>
      )}
    </div>
  </div>
)}



 <MobileSearchSheet
    // open={searchExpanded}
    open={searchExpanded && window.innerWidth < 1024}
    onClose={() => setSearchExpanded(false)}
  />



    </> 
  )
}



export default Header;