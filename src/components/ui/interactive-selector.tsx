import React, { useState, useEffect, useRef } from 'react';

const COMPACT_LAYOUT_QUERY = '(max-width: 700px)';

function useCompactProjectLayout() {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(COMPACT_LAYOUT_QUERY).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_LAYOUT_QUERY);
    const handleChange = () => setIsCompact(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isCompact;
}

const InteractiveSelector = ({ options = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState([]);
  const [compactDetailsHidden, setCompactDetailsHidden] = useState(false);
  const isCompactLayout = useCompactProjectLayout();
  const optionCount = options.length;
  const compactScrollerRef = useRef(null);
  const compactScrollFrame = useRef(0);

  const handleOptionClick = (index) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleOptionKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOptionClick(index);
    }
  };

  const scrollToCompactProject = (index) => {
    setActiveIndex(index);

    const scroller = compactScrollerRef.current;
    const target = scroller?.children[index];
    if (!target) return;

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  const handleCompactScroll = () => {
    if (compactScrollFrame.current) return;

    compactScrollFrame.current = window.requestAnimationFrame(() => {
      const scroller = compactScrollerRef.current;
      if (!scroller) {
        compactScrollFrame.current = 0;
        return;
      }

      const scrollerCenter = scroller.scrollLeft + (scroller.clientWidth / 2);
      const nextIndex = Array.from(scroller.children).reduce((closestIndex, child, index) => {
        const currentClosest = scroller.children[closestIndex];
        const childCenter = child.offsetLeft + (child.clientWidth / 2);
        const closestCenter = currentClosest.offsetLeft + (currentClosest.clientWidth / 2);

        return Math.abs(childCenter - scrollerCenter) < Math.abs(closestCenter - scrollerCenter)
          ? index
          : closestIndex;
      }, 0);

      setActiveIndex(nextIndex);
      compactScrollFrame.current = 0;
    });
  };

  useEffect(() => {
    const timers = [];
    setAnimatedOptions([]);

    Array.from({ length: optionCount }).forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 180 * i);
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [optionCount]);

  useEffect(() => () => {
    if (compactScrollFrame.current) {
      window.cancelAnimationFrame(compactScrollFrame.current);
    }
  }, []);

  if (isCompactLayout) {
    return (
      <div style={{ width: '100%', margin: '1rem 0 0' }}>
        <div
          role="tablist"
          aria-label="Choose project"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '0 2px 12px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {options.map((option, index) => (
            <button
              key={option.title}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              onClick={() => scrollToCompactProject(index)}
              style={{
                flex: '0 0 auto',
                minHeight: '38px',
                padding: '8px 13px',
                borderRadius: '999px',
                border: activeIndex === index
                  ? '1px solid rgba(137, 207, 240, 0.72)'
                  : '1px solid rgba(255,255,255,0.12)',
                background: activeIndex === index
                  ? 'rgba(137, 207, 240, 0.16)'
                  : 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {option.title}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          gap: '14px',
          overflowX: 'auto',
          overscrollBehaviorX: 'contain',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          width: '100%',
          padding: '0 0 10px',
        }}
          ref={compactScrollerRef}
          onScroll={handleCompactScroll}
        >
          {options.map((option, index) => (
            <article
              key={index}
              style={{
                position: 'relative',
                flex: '0 0 100%',
                minHeight: 'min(620px, 76vh)',
                scrollSnapAlign: 'center',
                overflow: 'hidden',
                borderRadius: '20px',
                border: activeIndex === index
                  ? '1px solid rgba(137, 207, 240, 0.66)'
                  : '1px solid rgba(137, 207, 240, 0.25)',
                backgroundColor: '#18181b',
                backgroundImage: `url('${option.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                boxShadow: activeIndex === index
                  ? '0 22px 60px rgba(0,0,0,0.54), 0 0 0 1px rgba(137, 207, 240, 0.12)'
                  : '0 14px 36px rgba(0,0,0,0.42)',
                opacity: animatedOptions.includes(index) ? 1 : 0,
                transform: animatedOptions.includes(index) ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.45s ease, transform 0.45s ease',
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.66) 34%, rgba(0,0,0,0.16) 70%, rgba(0,0,0,0.24) 100%)',
              }} />

              <div style={{
                position: 'relative',
                zIndex: 1,
                minHeight: 'min(620px, 76vh)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    color: 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(137, 207, 240, 0.35)',
                  }}>
                    {React.cloneElement(option.icon, { size: 22 })}
                  </div>

                  {option.stats && (
                    <div style={{
                      padding: '7px 11px',
                      borderRadius: '999px',
                      background: 'rgba(0, 0, 0, 0.62)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                    }}>
                      {option.stats}
                    </div>
                  )}
                </div>

                  <div
                  id={`compact-project-details-${index}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: compactDetailsHidden ? '8px' : '14px',
                    padding: compactDetailsHidden ? '0' : '18px',
                    borderRadius: '18px',
                    background: compactDetailsHidden
                      ? 'transparent'
                      : 'linear-gradient(180deg, rgba(0,0,0,0.34), rgba(0,0,0,0.68))',
                    border: compactDetailsHidden ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: compactDetailsHidden ? 'none' : 'blur(8px)',
                    WebkitBackdropFilter: compactDetailsHidden ? 'none' : 'blur(8px)',
                    boxShadow: compactDetailsHidden ? 'none' : '0 16px 48px rgba(0,0,0,0.35)',
                    transition: 'all 0.24s ease',
                  }}
                >
                  {!compactDetailsHidden && (
                    <>
                      <div>
                        <h3 style={{
                          margin: 0,
                          color: '#fff',
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'clamp(1.7rem, 9vw, 2.35rem)',
                          lineHeight: 1,
                          textShadow: '0 3px 18px rgba(0,0,0,0.85)',
                        }}>
                          {option.title}
                        </h3>
                        <p style={{
                          margin: '10px 0 0',
                          color: 'rgba(255,255,255,0.88)',
                          fontSize: '0.95rem',
                          lineHeight: 1.55,
                          textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                        }}>
                          {option.description}
                        </p>
                      </div>

                      {option.tags && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '7px',
                        }}>
                          {option.tags.slice(0, 6).map((tag, i) => (
                            <span key={i} style={{
                              padding: '4px 9px',
                              borderRadius: '999px',
                              background: 'rgba(255,255,255,0.14)',
                              border: '1px solid rgba(255,255,255,0.22)',
                              color: '#fff',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {option.url && (
                    <>
                      <a
                        href={option.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          width: '100%',
                          minHeight: compactDetailsHidden ? '50px' : '46px',
                          borderRadius: '12px',
                          background: compactDetailsHidden
                            ? 'rgba(137, 207, 240, 0.22)'
                            : 'rgba(137, 207, 240, 0.16)',
                          border: '1px solid rgba(137, 207, 240, 0.48)',
                          color: '#fff',
                          fontWeight: 800,
                          textDecoration: 'none',
                          touchAction: 'manipulation',
                        }}
                      >
                        View Website
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                      </a>

                      <button
                        type="button"
                        aria-controls={`compact-project-details-${index}`}
                        aria-expanded={!compactDetailsHidden}
                        onClick={() => setCompactDetailsHidden(prev => !prev)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: '100%',
                          minHeight: '40px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.14)',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.88)',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          touchAction: 'manipulation',
                        }}
                      >
                        {compactDetailsHidden ? 'Show details' : 'Hide details'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginTop: '8px',
        }}>
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => scrollToCompactProject((activeIndex - 1 + optionCount) % optionCount)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.16)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            ‹
          </button>

          <div
            aria-label={`Project ${activeIndex + 1} of ${optionCount}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flex: 1,
            }}
          >
            {options.map((option, index) => (
              <button
                key={`${option.title}-dot`}
                type="button"
                aria-label={`Show ${option.title}`}
                onClick={() => scrollToCompactProject(index)}
                style={{
                  width: activeIndex === index ? '22px' : '8px',
                  height: '8px',
                  borderRadius: '999px',
                  border: 0,
                  background: activeIndex === index
                    ? 'var(--accent-primary)'
                    : 'rgba(255,255,255,0.3)',
                  transition: 'width 0.2s ease, background 0.2s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next project"
            onClick={() => scrollToCompactProject((activeIndex + 1) % optionCount)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.16)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            ›
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
      {/* Options Container */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1200px',
        height: '600px',
        margin: '0 auto',
        alignItems: 'stretch',
        position: 'relative',
        borderRadius: '24px',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        gap: '16px',
        padding: '16px',
        boxSizing: 'border-box'
      }}>
        {options.map((option, index) => (
          <div
            key={index}
            style={{
              backgroundImage: `url('${option.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backfaceVisibility: 'hidden',
              opacity: animatedOptions.includes(index) ? 1 : 0,
              transform: animatedOptions.includes(index) ? 'translateX(0)' : 'translateX(-60px)',
              minWidth: '80px',
              minHeight: '100px',
              margin: 0,
              borderRadius: '16px', // separate rounded corners for each project
              borderWidth: activeIndex === index ? '2px' : '1px',
              borderStyle: 'solid',
              borderColor: activeIndex === index ? '#38bdf8' : 'rgba(255,255,255,0.1)',
              cursor: 'pointer',
              backgroundColor: '#18181b',
              boxShadow: activeIndex === index 
                ? '0 0 15px rgba(56, 189, 248, 0.15), 0 10px 40px rgba(0,0,0,0.8)' 
                : '0 4px 12px rgba(0,0,0,0.4)',
              flex: activeIndex === index ? '9 1 0%' : '1 1 0%',
              zIndex: activeIndex === index ? 10 : 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.7s cubic-bezier(0.25, 1, 0.5, 1)', // smoother easing
              willChange: 'flex-grow, box-shadow, background-size, background-position'
            }}
            onClick={() => handleOptionClick(index)}
            onKeyDown={(event) => handleOptionKeyDown(event, index)}
            role="button"
            tabIndex={0}
            aria-label={`Show ${option.title} project`}
            aria-expanded={activeIndex === index}
          >
            {/* TOP LEFT CORNER: Active Icon + Stats Badge */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 5,
              opacity: activeIndex === index ? 1 : 0,
              transform: activeIndex === index ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.5s ease-in-out',
              pointerEvents: 'none'
            }}>
              {/* ACTIVE ICON */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--bg-primary)',
                flexShrink: 0,
                boxShadow: '0 4px 20px rgba(137, 207, 240, 0.4)'
              }}>
                {React.cloneElement(option.icon, { size: 24 })}
              </div>

              {/* STATS BADGE */}
              {option.stats && (
                <div style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: 'white',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'sans-serif'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 8px rgba(56, 189, 248, 0.4)' }}></span>
                  {option.stats}
                </div>
              )}
            </div>

            {/* Shadow effect */}
            <div 
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '100%',
                pointerEvents: 'none',
                transition: 'all 0.7s ease-in-out',
                background: activeIndex === index 
                  ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 30%, transparent 60%)'
                  : 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 40%)'
              }}
            ></div>
            
            {/* Label with icon and info */}
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: '0',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
              minHeight: '100px',
              zIndex: 2,
              pointerEvents: 'none',
              padding: '24px 20px',
              gap: '16px',
              width: '100%',
              overflow: 'hidden'
            }}>
              {/* INACTIVE ICON (Fades out when active) */}
              <div style={{
                minWidth: '48px',
                maxWidth: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                backgroundColor: 'rgba(32,32,32,0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                border: '2px solid #444',
                flexShrink: 0,
                transition: 'all 0.4s',
                marginBottom: '4px',
                opacity: activeIndex === index ? 0 : 1,
                transform: activeIndex === index ? 'scale(0.5)' : 'scale(1)',
                position: activeIndex === index ? 'absolute' : 'relative',
                pointerEvents: 'none'
              }}>
                {option.icon}
              </div>
              
              {/* ACTIVE CONTENT CONTAINER */}
              <div style={{
                color: 'white',
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                width: '680px', // Fixed width stops spreading during transition
                minWidth: '680px',
                flexShrink: 0,
                pointerEvents: activeIndex === index ? 'auto' : 'none',
                alignItems: 'flex-end',
                gap: '16px'
              }}>

                {/* LEFT COLUMN: Description */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  width: '180px',
                  flexShrink: 0,
                  transition: 'opacity 0.2s ease-out, transform 0.4s ease-out',
                  opacity: activeIndex === index ? 1 : 0,
                  transform: activeIndex === index ? 'translateX(0)' : 'translateX(-10px)',
                }}>
                  {/* DESCRIPTION CONTAINER */}
                  <div style={{ position: 'relative' }}>
                    {/* Soft Blurry Cloud Background */}
                    <div style={{
                      position: 'absolute',
                      top: '-30px',
                      bottom: '-30px',
                      left: '-40px',
                      right: '-40px',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)', // Darker to ensure legibility
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 70%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 70%)',
                      zIndex: 0,
                      pointerEvents: 'none'
                    }} />

                    {/* TEXT */}
                    <div style={{
                      position: 'relative',
                      zIndex: 1,
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      color: '#FFFFFF',
                      fontWeight: '500', 
                      textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,1)', 
                      fontFamily: 'sans-serif',
                      whiteSpace: 'normal',
                    }}>
                      {option.description}
                    </div>
                  </div>
                </div>

                {/* CENTER COLUMN: Title, Button */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end', // Bottom align the stack
                  gap: '16px',
                  flex: 1, // Fill middle space
                  flexShrink: 0,
                  transition: 'opacity 0.2s ease-out, transform 0.4s ease-out',
                  opacity: activeIndex === index ? 1 : 0,
                  transform: activeIndex === index ? 'translateY(0)' : 'translateY(10px)',
                }}>
                  {/* TITLE */}
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    fontFamily: 'sans-serif',
                    whiteSpace: 'nowrap',
                    textAlign: 'center'
                  }}>
                    {option.title}
                  </div>

                  {/* BUTTON */}
                  {option.url && (
                    <a 
                      href={option.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.2s ease',
                        pointerEvents: activeIndex === index ? 'auto' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
                        e.currentTarget.style.color = '#38bdf8'; // Baby blue
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.color = 'white';
                      }}
                    >
                      View Website
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* RIGHT COLUMN: Tags/Skills */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end', // Stack tags from the bottom up
                  width: '120px', // Exact 1/6th fixed width approx
                  flexShrink: 0,
                  gap: '6px',
                  transition: 'opacity 0.2s ease-out, transform 0.4s ease-out',
                  opacity: activeIndex === index ? 1 : 0,
                  transform: activeIndex === index ? 'translateX(0)' : 'translateX(10px)',
                }}>
                  {option.tags && option.tags.map((tag, i) => (
                    <span key={i} style={{
                      padding: '4px 10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)', // Increased visibility
                      border: '1px solid rgba(255, 255, 255, 0.3)', // Increased visibility
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600', // Bolder
                      color: '#ffffff', // Pure white
                      whiteSpace: 'nowrap',
                      fontFamily: 'sans-serif',
                      textAlign: 'center'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveSelector;
