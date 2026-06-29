import React, { useState, useEffect } from 'react';

const InteractiveSelector = ({ options = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState([]);

  const handleOptionClick = (index) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const timers = [];
    
    options.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 180 * i);
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

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

