import { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ theme, toggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#about');

  useEffect(() => {
    let frameId = null;

    const getActiveSection = () => {
      const navHeight =
        document.querySelector('.navbar-wrapper')?.getBoundingClientRect().height ?? 80;
      const marker = window.scrollY + navHeight + 80;
      const isPageEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

      if (isPageEnd) {
        return NAV_ITEMS[NAV_ITEMS.length - 1].href;
      }

      return NAV_ITEMS.reduce((current, item) => {
        const section = document.querySelector(item.href);
        if (!section) {
          return current;
        }

        return section.offsetTop <= marker ? item.href : current;
      }, NAV_ITEMS[0].href);
    };

    const updateActiveSection = () => {
      frameId = null;
      const nextSection = getActiveSection();
      setActiveSection((current) =>
        current === nextSection ? current : nextSection
      );
    };

    const scheduleUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateActiveSection);
      }
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileOpen && !e.target.closest('.navbar')) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileOpen]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      const navHeight =
        document.querySelector('.navbar-wrapper')?.getBoundingClientRect().height ?? 80;
      const targetTop = el.getBoundingClientRect().top + window.scrollY;

      setActiveSection(href);
      window.scrollTo({
        top: Math.max(targetTop - navHeight - 24, 0),
        behavior: 'smooth',
      });
      if (e.detail > 0) {
        e.currentTarget.blur();
      }
      setMobileOpen(false);
    }
  };

  return (
    <div className="navbar-wrapper">
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                className={`nav-link ${activeSection === item.href ? 'active' : ''}`}
                href={item.href}
                aria-current={activeSection === item.href ? 'page' : undefined}
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-divider" />

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>
      </nav>
    </div>
  );
}
