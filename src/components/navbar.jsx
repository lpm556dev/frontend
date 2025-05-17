"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';   

const Navbar = () => {
  // Router for programmatic navigation
  const router = useRouter();
  
  // Navigation items with links and scroll properties
  const navItems = [
    { name: 'HOME', path: '/', isScroll: true, scrollTo: 'home' },
    { name: 'ABOUT US', path: '/', isScroll: true, scrollTo: 'about' },
    { name: 'ACTIVITY', path: '/activity' },
    { name: 'CONTACT', path: '/', isScroll: true, scrollTo: 'contact' } // Changed to use scroll behavior
  ];
  
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // States for controlling navbar appearance
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // State for active menu item
  const [activeItem, setActiveItem] = useState('HOME');
  
  // Get current path to highlight active link
  const pathname = usePathname();
  
  // Set initial active item based on pathname
  useEffect(() => {
    // Find the matching nav item for the current path
    const matchingItem = navItems.find(item => item.path === pathname && !item.isScroll);
    if (matchingItem) {
      setActiveItem(matchingItem.name);
    } else if (pathname === '/') {
      setActiveItem('HOME');
    }
  }, [pathname]); // Only run when pathname changes
  
  // Effect to handle scrolling when redirected with a section parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const section = url.searchParams.get('section');
      
      if (section) {
        setTimeout(() => {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            
            // If section matches a nav item's scrollTo, set it as active
            const matchingItem = navItems.find(item => item.isScroll && item.scrollTo === section);
            if (matchingItem) {
              setActiveItem(matchingItem.name);
            }
          }
        }, 500); // Short delay to ensure DOM is ready
      }
    }
  }, [pathname]); // Only run when pathname changes
  
  // Effect to handle scroll events
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        // Determine if user is scrolling up or down
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          // Scrolling down & past the threshold
          setVisible(false);
        } else {
          // Scrolling up or at the top
          setVisible(true);
        }
        
        // Update last scroll position
        setLastScrollY(currentScrollY);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', controlNavbar);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]); // Only run when lastScrollY changes
  
  // Handle navigation with scrolling
  const handleNavigation = (e, item) => {
    // Set this item as the active item when clicked
    setActiveItem(item.name);
    
    if (item.isScroll) {
      e.preventDefault();
      
      if (pathname === '/') {
        // If we're already on the home page, just scroll to the element
        const element = document.getElementById(item.scrollTo);
        if (element) {
          // Get the height of the navbar for offset calculation
          const navbarHeight = 64; // Approximated height of navbar in pixels
          
          // Get the element's position relative to the viewport
          const rect = element.getBoundingClientRect();
          
          // Calculate the absolute position of the element on the page
          const elemPosition = rect.top + window.pageYOffset;
          
          // Scroll to the element with offset for the navbar
          window.scrollTo({
            top: elemPosition - navbarHeight,
            behavior: 'smooth'
          });
        }
      } else {
        // If we're on another page, navigate to home with section parameter
        router.push(`/?section=${item.scrollTo}`);
      }
    }
    // For other navigation items, let the Link component handle it normally
  };
  
  // Common gradient background style for consistent appearance - with darker grays
  const navGradient = "bg-gradient-to-r from-gray-400/95 via-gray-300/90 to-gray-200/85";
  
  return (
    <motion.header 
      className="w-full fixed top-0 left-0 right-0 z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ 
        y: visible ? 0 : -100, 
        opacity: visible ? 1 : 0 
      }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${navGradient} rounded-[30px]`}>
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-20">
          {/* Logo with link to home */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/img/logolpmdanssg.png"
                alt="LPM - Lembaga Pengabdian Masyarakat"
                width={160}
                height={40}
                className="py-2"
                priority
              />
            </Link>
          </motion.div>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
            <nav>
              <ul className="flex space-x-10">
                {navItems.map((item, index) => {
                  const isActive = activeItem === item.name;
                  
                  return (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.1 * index,
                        ease: "easeOut" 
                      }}
                    >
                      <Link 
                        href={item.path} 
                        className={`font-semibold text-sm uppercase transition-colors ${
                          isActive ? 'text-black' : 'text-gray-700'
                        }`}
                        onClick={(e) => handleNavigation(e, item)}
                      >
                        <motion.span
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {item.name}
                        </motion.span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
            
            {/* Login Button for Desktop */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Link href="/login">
                <motion.button
                  className="bg-blue-900 text-white rounded-full px-8 py-2.5 font-medium text-sm cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                >
                  LOGIN
                </motion.button>
              </Link>
            </motion.div>
          </div>
          
          {/* Mobile view controls */}
          <div className="flex items-center md:hidden">
            {/* Login Button for Mobile */}
            <Link href="/login">
              <motion.button
                className="bg-blue-900 text-white rounded-full px-6 py-2 mr-3 font-medium text-xs cursor-pointer"
                whileTap={{ scale: 0.95 }}
              >
                LOGIN
              </motion.button>
            </Link>
            
            {/* Mobile menu button */}
            <motion.button
              className="text-gray-800 focus:outline-none cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu - Using the same gradient as the main navigation */}
        {mobileMenuOpen && (
          <motion.nav 
            className={`md:hidden ${navGradient} overflow-hidden rounded-b-[30px]`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="flex flex-col space-y-2 py-3 px-4">
              {navItems.map((item, index) => {
                const isActive = activeItem === item.name;
                
                return (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.05 * index }}
                  >
                    <Link 
                      href={item.path} 
                      className={`block py-2 font-medium ${
                        isActive ? 'text-black' : 'text-gray-700'
                      }`}
                      onClick={(e) => {
                        handleNavigation(e, item);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;