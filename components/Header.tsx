
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { Logo } from './icons/Logo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-brand-blue/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 z-50">
          <Logo className="h-10 w-10 text-brand-cyan" />
          <span className="text-2xl font-bold text-white">PromptTools</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-lg hover:text-brand-cyan transition-colors duration-300 ${
                  isActive ? 'text-brand-cyan font-bold' : 'text-brand-extralight'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/tools"
          className="hidden md:inline-block bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-transform transform hover:scale-105"
        >
          مركز الأدوات
        </Link>
        <button className="md:hidden text-white z-50" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-brand-dark bg-opacity-90 z-40 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed top-0 right-0 h-full w-64 bg-brand-blue shadow-lg p-8 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <nav className="flex flex-col items-start space-y-6 mt-16">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-xl hover:text-brand-cyan transition-colors duration-300 ${
                      isActive ? 'text-brand-cyan font-bold' : 'text-brand-extralight'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <Link
                to="/tools"
                className="w-full text-center bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-transform transform hover:scale-105 mt-4"
              >
                مركز الأدوات
              </Link>
            </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;