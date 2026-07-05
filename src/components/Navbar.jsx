import { useState, useEffect, useRef, useCallback } from 'react';
import './Navbar.css';
import { HomeIcon, MoonIcon, SunIcon } from './SiteIcons';

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
  { label: 'Feedback', href: '#feedback' },
];



export default function Navbar({ theme, toggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#about');
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const ticking = useRef(false);
  const indicatorRef = useRef(null);
  const navLinksRef = useRef(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef(null);

  // ── Active section detection ──
  useEffect(() => {
    let frameId = null;

    const getActiveSection = () => {
      const navHeight = 56;
      const marker = window.scrollY + navHeight + 80;
      const isPageEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

      if (isPageEnd) return NAV_ITEMS[NAV_ITEMS.length - 1].href;

      return NAV_ITEMS.reduce((current, item) => {
        const section = document.querySelector(item.href);
        if (!section) return current;
        return section.offsetTop <= marker ? item.href : current;
      }, NAV_ITEMS[0].href);
    };

    const updateActiveSection = () => {
      frameId = null;
      if (isProgrammaticScroll.current) return;
      const next = getActiveSection();
      setActiveSection((cur) => (cur === next ? cur : next));
    };

    const schedule = () => {
      if (frameId === null) frameId = requestAnimationFrame(updateActiveSection);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);

  // ── Sliding indicator ──
  useEffect(() => {
    if (!navLinksRef.current || !indicatorRef.current) return;

    const positionIndicator = () => {
      const active = navLinksRef.current.querySelector('.nav-link.active');
      const activeLabel = active?.querySelector('.nav-link-label') || active;

      if (!activeLabel) {
        indicatorRef.current.style.opacity = '0';
        return;
      }

      const listRect = navLinksRef.current.getBoundingClientRect();
      const labelRect = activeLabel.getBoundingClientRect();
      indicatorRef.current.style.width = `${labelRect.width}px`;
      indicatorRef.current.style.transform = `translateX(${labelRect.left - listRect.left}px)`;
      indicatorRef.current.style.top = `${labelRect.bottom - listRect.top + 2}px`;
      indicatorRef.current.style.opacity = '1';
    };

    positionIndicator();
    window.addEventListener('resize', positionIndicator);

    return () => window.removeEventListener('resize', positionIndicator);
  }, [activeSection]);

  // ── Scroll: hide/show + progress bar ──
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(y / docHeight, 1) : 0;

    setScrollProgress(progress);
    setScrolled(y > 10);
    ticking.current = false;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(handleScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  // ── Close mobile on outside click ──
  useEffect(() => {
    if (!mobileOpen) return;
    const close = (e) => {
      if (!e.target.closest('.navbar-bar') && !e.target.closest('.mobile-panel')) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [mobileOpen]);

  // ── Lock body scroll when mobile menu is open ──
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      const navHeight = 56;
      const top = el.getBoundingClientRect().top + window.scrollY;
      
      isProgrammaticScroll.current = true;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      
      setActiveSection(href);
      window.scrollTo({ top: Math.max(top - navHeight - 16, 0), behavior: 'smooth' });
      
      scrollTimeout.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 1000);

      if (e.detail > 0) e.currentTarget.blur();
      setMobileOpen(false);
    }
  };

  return (
    <>
      <header
        className={[
          'navbar-bar',
          scrolled ? 'navbar-bar--scrolled' : '',
        ].filter(Boolean).join(' ')}
      >
        {/* Inner container */}
        <div className="navbar-inner">
          {/* Logo / Brand */}
          <a
            href="#hero"
            className="navbar-brand"
            onClick={(e) => handleNavClick(e, '#hero')}
            aria-label="Home"
            title="Home"
          >
            <HomeIcon size={18} />
          </a>

          {/* Desktop nav links */}
          <nav className="navbar-nav" aria-label="Main navigation">
            <ul ref={navLinksRef} className="navbar-links">
              <div ref={indicatorRef} className="navbar-indicator" aria-hidden="true" />
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    className={`nav-link${activeSection === item.href ? ' active' : ''}`}
                    href={item.href}
                    aria-current={activeSection === item.href ? 'page' : undefined}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    <span className="nav-link-label">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right side actions */}
          <div className="navbar-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>

            {/* Hamburger — visible on tablet & mobile */}
            <button
              className={`hamburger${mobileOpen ? ' open' : ''}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Scroll progress bar */}
        <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />
      </header>

      {/* Mobile / Tablet full-screen overlay panel */}
      <div className={`mobile-overlay${mobileOpen ? ' open' : ''}`} aria-hidden={!mobileOpen}>
        <nav className="mobile-panel" aria-label="Mobile navigation">
          <ul className="mobile-links">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.href} style={{ animationDelay: `${0.04 * i}s` }}>
                <a
                  className={`mobile-link${activeSection === item.href ? ' active' : ''}`}
                  href={item.href}
                  aria-current={activeSection === item.href ? 'page' : undefined}
                  tabIndex={mobileOpen ? 0 : -1}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
