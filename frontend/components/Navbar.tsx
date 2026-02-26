'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  theme?: 'dark' | 'light';
}

const Navbar = ({ theme = 'dark' }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > 20);
      }, 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const navLinks = [
    { name: 'Find a Home', href: '/properties' },
    { name: 'For Landlords', href: '/landlords' },
    { name: 'For Agents', href: '/agent' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isLightMode = theme === 'light' || isScrolled;
  const navClasses = `top-0 left-0 right-0 z-50 transition-all duration-300 sticky ${
    isScrolled
      ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-3 shadow-xs'
      : theme === 'light'
        ? 'bg-white py-6 border-b border-gray-100'
        : 'bg-transparent py-6'
  }`;

  const textColorClass = isLightMode ? 'text-gray-900' : 'text-white';
  const logoColorClass = isLightMode ? 'text-brand-blue' : 'text-white';
  const linkColorClass = isLightMode
    ? 'text-gray-600 hover:text-brand-blue'
    : 'text-white/80 hover:text-white';
  const activeLinkColorClass = isLightMode
    ? 'text-brand-blue border-b-2 border-brand-blue'
    : 'text-white border-b-2 border-white';
  const mobileBgClass = isLightMode
    ? 'bg-white border-gray-100 shadow-xl'
    : 'glass-dark border-white/10';

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span
            className={`text-2xl font-black tracking-tight transition-colors ${logoColorClass}`}
          >
            Chioma
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-sm font-bold transition-all
                  ${active ? activeLinkColorClass : linkColorClass}
                  pb-1
                `}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/login"
            className={`text-sm font-bold transition-colors ${isLightMode ? 'text-brand-blue hover:text-blue-800' : 'text-white hover:text-white/80'}`}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-brand-blue hover:bg-blue-800 text-white px-7 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-brand-blue/20 hover:shadow-lg hover:shadow-brand-blue/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${textColorClass} hover:bg-black/5`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 border-t transition-all duration-300 origin-top overflow-hidden ${mobileBgClass} ${isMobileMenuOpen ? 'max-h-[500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
      >
        <div className="flex flex-col p-6 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-bold py-3 px-4 rounded-xl transition-colors
                  ${
                    active
                      ? isLightMode
                        ? 'bg-blue-50 text-brand-blue'
                        : 'bg-white/10 text-white'
                      : isLightMode
                        ? 'text-gray-700 hover:bg-gray-50'
                        : 'text-white/90 hover:bg-white/5'
                  }
                `}
              >
                {link.name}
              </Link>
            );
          })}

          <div
            className={`pt-6 mt-4 flex flex-col space-y-4 border-t ${isLightMode ? 'border-gray-100' : 'border-white/10'}`}
          >
            <Link
              href="/login"
              className={`text-lg font-bold py-3 px-4 text-center rounded-xl transition-colors ${isLightMode ? 'bg-gray-50 text-gray-900 hover:bg-gray-100' : 'bg-white/5 text-white hover:bg-white/10'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="bg-brand-blue hover:bg-blue-800 text-white py-3 px-4 rounded-xl text-center font-bold shadow-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
