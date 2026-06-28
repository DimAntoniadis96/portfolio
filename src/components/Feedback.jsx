import { useState, useRef, useEffect } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import './Feedback.css';

export default function Feedback() {
  const { ref, isVisible } = useFadeIn();
  
  // Board State
  const [notes, setNotes] = useState([]);
  const boardRef = useRef(null);
  
  // Drag State
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Form State
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolveCollisions = (currentNotes, fixedId = null) => {
    if (!boardRef.current) return currentNotes;
    const boardRect = boardRef.current.getBoundingClientRect();
    const NOTE_WIDTH = 180; 
    const NOTE_HEIGHT = 90; // Reduced to reflect true note height better
    const MARGIN = 8; 
    
    let resolved = currentNotes.map(n => ({ ...n }));
    let hasOverlap = true;
    let iterations = 0;
    
    while (hasOverlap && iterations < 150) {
      hasOverlap = false;
      for (let i = 0; i < resolved.length; i++) {
        for (let j = i + 1; j < resolved.length; j++) {
          const a = resolved[i];
          const b = resolved[j];
          
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          
          const overlapX = (NOTE_WIDTH + MARGIN) - Math.abs(dx);
          const overlapY = (NOTE_HEIGHT + MARGIN) - Math.abs(dy);
          
          if (overlapX > 0 && overlapY > 0) {
            hasOverlap = true;
            let pushX = 0, pushY = 0;
            
            // Fix perfect overlapping in corners
            if (dx === 0 && dy === 0) {
              dx = (Math.random() - 0.5);
              dy = (Math.random() - 0.5);
            }
            
            if (overlapX < overlapY) {
              pushX = (overlapX / 2) + 2;
              pushX *= Math.sign(dx);
              // Jitter to break grid locks
              if (Math.abs(dy) < 5) pushY = (Math.random() - 0.5) * 10;
            } else {
              pushY = (overlapY / 2) + 2;
              pushY *= Math.sign(dy);
              // Jitter to break grid locks
              if (Math.abs(dx) < 5) pushX = (Math.random() - 0.5) * 10;
            }
            
            if (a.id === fixedId) {
              b.x -= pushX * 2;
              b.y -= pushY * 2;
            } else if (b.id === fixedId) {
              a.x += pushX * 2;
              a.y += pushY * 2;
            } else {
              a.x += pushX;
              a.y += pushY;
              b.x -= pushX;
              b.y -= pushY;
            }
            
            // Clamp immediately so they bounce off walls
            if (a.id !== fixedId) {
              a.x = Math.max(0, Math.min(a.x, boardRect.width - NOTE_WIDTH));
              a.y = Math.max(0, Math.min(a.y, boardRect.height - NOTE_HEIGHT));
            }
            if (b.id !== fixedId) {
              b.x = Math.max(0, Math.min(b.x, boardRect.width - NOTE_WIDTH));
              b.y = Math.max(0, Math.min(b.y, boardRect.height - NOTE_HEIGHT));
            }
          }
        }
      }
      
      iterations++;
    }
    return resolved;
  };

  const handlePointerDown = (e, id, note) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    
    if (!boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    
    setDraggingId(id);
    setDragOffset({
      x: (e.clientX - boardRect.left) - note.x,
      y: (e.clientY - boardRect.top) - note.y
    });
  };

  const handlePointerMove = (e) => {
    if (draggingId === null || !boardRef.current) return;
    
    const boardRect = boardRef.current.getBoundingClientRect();
    let newX = (e.clientX - boardRect.left) - dragOffset.x;
    let newY = (e.clientY - boardRect.top) - dragOffset.y;
    
    // Clamping to keep notes inside the board area
    const NOTE_WIDTH = 180; // approximate width of .signal-note
    const NOTE_HEIGHT = 90; // approximate height of .signal-note
    
    newX = Math.max(0, Math.min(newX, boardRect.width - NOTE_WIDTH));
    newY = Math.max(0, Math.min(newY, boardRect.height - NOTE_HEIGHT));
    
    setNotes(notes.map(n => 
      n.id === draggingId ? { ...n, x: newX, y: newY } : n
    ));
  };

  const handlePointerUp = (e) => {
    if (draggingId !== null) {
      e.target.releasePointerCapture(e.pointerId);
      // Resolve collisions upon dropping, keeping the dragged note fixed
      setNotes(prev => resolveCollisions(prev, draggingId));
      setDraggingId(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || !author.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      const today = new Date();
      const month = today.toLocaleString('default', { month: 'short' }).toUpperCase();
      const day = today.getDate();
      
      // Calculate a central spawn point
      let spawnX = 100;
      let spawnY = 100;
      if (boardRef.current) {
         const rect = boardRef.current.getBoundingClientRect();
         spawnX = (rect.width / 2) - 90 + (Math.random() * 40 - 20);
         spawnY = (rect.height / 2) - 60 + (Math.random() * 40 - 20);
      }
      
      const newNote = {
        id: Date.now(),
        author: author.trim(),
        date: `${month} ${day}`,
        text: message.trim(),
        x: spawnX,
        y: spawnY,
      };
      
      // Resolve collisions, pushing old notes away from the new one
      setNotes(prev => resolveCollisions([...prev, newNote], newNote.id));
      setMessage('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <section className="feedback section" id="feedback">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          
          <div className="feedback-header">
            <span className="section-label">Community</span>
            <h2 className="section-heading">Guest<span style={{ color: 'var(--accent-primary)' }}>Book</span></h2>
            <p className="feedback-text">
              Leave a message on the wall. Feel free to drag notes around to organize them!
            </p>
          </div>

          <div className="signal-board-container">
            
            {/* Left: Signal Input */}
            <div className="signal-input">
              <div className="signal-input-header">
                <span className="signal-input-title">New Entry</span>
                <h3>Leave a message</h3>
                <div className="signal-live">
                  <div className="signal-live-dot"></div>
                  ONLINE
                </div>
              </div>

              <form onSubmit={handleSubmit} className="signal-form-group">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input 
                    type="text" 
                    className="form-input name-input"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value.substring(0, 15))}
                    placeholder="Your Name"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="signal-textarea-wrapper">
                  <textarea 
                    className="signal-textarea form-textarea"
                    placeholder="What's on your mind?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.substring(0, 180))}
                    disabled={isSubmitting}
                    required
                  ></textarea>
                  <span className="signal-char-count">{message.length}/180</span>
                </div>

                <button 
                  type="submit" 
                  className="signal-btn"
                  disabled={isSubmitting || message.trim().length === 0 || author.trim().length === 0}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Right: Board */}
            <div 
              className="signal-board-area"
              ref={boardRef}
            >
              <div className="signal-board-hint">// Drag any note to move it</div>
              
              {notes.map(note => (
                <div 
                  key={note.id}
                  className={`signal-note ${draggingId === note.id ? 'dragging' : ''}`}
                  style={{ 
                    transform: `translate(${note.x}px, ${note.y}px)`,
                    zIndex: draggingId === note.id ? 100 : 1
                  }}
                  onPointerDown={(e) => handlePointerDown(e, note.id, note)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <div className="signal-note-inner" style={{ animationDelay: `${(note.id % 5) * -1.2}s` }}>
                    <div className="signal-note-header">
                      <span className="signal-note-author">{note.author}</span>
                      <span className="signal-note-date">{note.date}</span>
                    </div>
                    <div className="signal-note-text">
                      {note.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
