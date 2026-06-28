import { useCallback, useEffect, useRef, useState } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import './Feedback.css';

const STORAGE_KEY = 'portfolio-guestbook-notes-v1';
const NOTE_WIDTH = 190;
const NOTE_HEIGHT = 150;
const NOTE_MARGIN = 12;
const BOARD_EDGE_PADDING = 16;
const BOARD_HINT_SAFE_AREA = 70;
const AUTHOR_MAX_LENGTH = 24;
const MESSAGE_MAX_LENGTH = 180;
const KEYBOARD_STEP = 12;

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function clampNoteToBoard(note, boardRect) {
  const maxX = Math.max(0, boardRect.width - NOTE_WIDTH - BOARD_EDGE_PADDING);
  const maxY = Math.max(0, boardRect.height - NOTE_HEIGHT - BOARD_HINT_SAFE_AREA);
  const minX = maxX > BOARD_EDGE_PADDING ? BOARD_EDGE_PADDING : 0;
  const minY = maxY > BOARD_EDGE_PADDING ? BOARD_EDGE_PADDING : 0;

  return {
    ...note,
    x: clamp(note.x, minX, maxX),
    y: clamp(note.y, minY, maxY),
  };
}

function getStoredNotes() {
  if (typeof window === 'undefined') return [];

  try {
    const storedNotes = window.localStorage.getItem(STORAGE_KEY);
    if (!storedNotes) return [];

    const parsedNotes = JSON.parse(storedNotes);
    if (!Array.isArray(parsedNotes)) return [];

    return parsedNotes.filter((note) => (
      note &&
      typeof note.id === 'number' &&
      typeof note.author === 'string' &&
      typeof note.date === 'string' &&
      typeof note.text === 'string' &&
      Number.isFinite(note.x) &&
      Number.isFinite(note.y)
    ));
  } catch {
    return [];
  }
}

export default function Feedback() {
  const { ref, isVisible } = useFadeIn();
  
  const boardRef = useRef(null);
  const submitTimeoutRef = useRef(null);
  const [notes, setNotes] = useState(getStoredNotes);
  
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const resolveCollisions = useCallback((currentNotes, fixedId = null) => {
    if (!boardRef.current) return currentNotes;
    const boardRect = boardRef.current.getBoundingClientRect();
    
    const resolved = currentNotes.map((note) => clampNoteToBoard(note, boardRect));
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
          
          const overlapX = (NOTE_WIDTH + NOTE_MARGIN) - Math.abs(dx);
          const overlapY = (NOTE_HEIGHT + NOTE_MARGIN) - Math.abs(dy);
          
          if (overlapX > 0 && overlapY > 0) {
            hasOverlap = true;
            let pushX = 0;
            let pushY = 0;
            
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
            
            if (a.id !== fixedId) {
              Object.assign(a, clampNoteToBoard(a, boardRect));
            }
            if (b.id !== fixedId) {
              Object.assign(b, clampNoteToBoard(b, boardRect));
            }
          }
        }
      }
      
      iterations++;
    }
    return resolved;
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // The board still works if storage is unavailable.
    }
  }, [notes]);

  useEffect(() => {
    const handleResize = () => {
      setNotes((currentNotes) => resolveCollisions(currentNotes));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (submitTimeoutRef.current) {
        window.clearTimeout(submitTimeoutRef.current);
      }
    };
  }, [resolveCollisions]);

  const handlePointerDown = (e, id, note) => {
    if (!boardRef.current) return;

    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

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
    const nextPosition = clampNoteToBoard({
      x: (e.clientX - boardRect.left) - dragOffset.x,
      y: (e.clientY - boardRect.top) - dragOffset.y,
    }, boardRect);
    
    setNotes((currentNotes) => currentNotes.map((note) => (
      note.id === draggingId ? { ...note, x: nextPosition.x, y: nextPosition.y } : note
    )));
  };

  const handlePointerUp = (e) => {
    if (draggingId !== null) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      setNotes((currentNotes) => resolveCollisions(currentNotes, draggingId));
      setDraggingId(null);
    }
  };

  const handleNoteKeyDown = (e, noteId) => {
    const directions = {
      ArrowUp: [0, -1],
      ArrowRight: [1, 0],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
    };
    const direction = directions[e.key];

    if (!direction || !boardRef.current) return;
    e.preventDefault();

    const [moveX, moveY] = direction;
    const step = e.shiftKey ? KEYBOARD_STEP * 3 : KEYBOARD_STEP;

    setNotes((currentNotes) => {
      const boardRect = boardRef.current.getBoundingClientRect();
      const movedNotes = currentNotes.map((note) => {
        if (note.id !== noteId) return note;

        return clampNoteToBoard({
          ...note,
          x: note.x + (moveX * step),
          y: note.y + (moveY * step),
        }, boardRect);
      });

      return resolveCollisions(movedNotes, noteId);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedAuthor = author.trim();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !trimmedAuthor) {
      setStatusMessage('Add your name and a short note before posting.');
      return;
    }
    
    setIsSubmitting(true);
    setStatusMessage('');
    
    submitTimeoutRef.current = window.setTimeout(() => {
      const today = new Date();
      const month = today.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = today.getDate();
      
      let spawnX = 100;
      let spawnY = 100;
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        spawnX = clamp((rect.width / 2) - (NOTE_WIDTH / 2) + (Math.random() * 40 - 20), 0, Math.max(0, rect.width - NOTE_WIDTH));
        spawnY = clamp((rect.height / 2) - (NOTE_HEIGHT / 2) + (Math.random() * 40 - 20), 0, Math.max(0, rect.height - NOTE_HEIGHT));
      }
      
      const newNote = {
        id: Date.now(),
        author: trimmedAuthor,
        date: `${month} ${day}`,
        text: trimmedMessage,
        x: spawnX,
        y: spawnY,
      };
      
      setNotes((currentNotes) => resolveCollisions([...currentNotes, newNote], newNote.id));
      setMessage('');
      setAuthor('');
      setIsSubmitting(false);
      setStatusMessage(`Thanks, ${trimmedAuthor}. Your note is on the wall.`);
    }, 350);
  };

  return (
    <section className="feedback section" id="feedback">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          
          <div className="feedback-header">
            <span className="section-label">Feedback wall</span>
            <h2 className="section-heading">Guest<span style={{ color: 'var(--accent-primary)' }}>book</span></h2>
            <p className="feedback-text">
              Share a quick note about my work, a collaboration idea, or something I could improve.
              Your note lands on the wall, then you can drag it into place.
            </p>
          </div>

          <div className="signal-board-container">
            
            {/* Left: Signal Input */}
            <div className="signal-input">
              <div className="signal-input-header">
                <span className="signal-input-title">Sign the wall</span>
                <h3>Add your feedback</h3>
                <div className="signal-live">
                  <div className="signal-live-dot" aria-hidden="true"></div>
                  OPEN
                </div>
              </div>

              <form onSubmit={handleSubmit} className="signal-form-group">
                <div className="form-group">
                  <label className="form-label" htmlFor="guestbook-name">Name *</label>
                  <input 
                    id="guestbook-name"
                    type="text" 
                    className="form-input name-input"
                    value={author}
                    onChange={(e) => {
                      setAuthor(e.target.value.slice(0, AUTHOR_MAX_LENGTH));
                      setStatusMessage('');
                    }}
                    placeholder="Your name"
                    disabled={isSubmitting}
                    maxLength={AUTHOR_MAX_LENGTH}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="signal-textarea-wrapper">
                  <label className="form-label" htmlFor="guestbook-message">Message *</label>
                  <textarea 
                    id="guestbook-message"
                    className="signal-textarea form-textarea"
                    placeholder="What stood out, or what could be better?"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH));
                      setStatusMessage('');
                    }}
                    disabled={isSubmitting}
                    maxLength={MESSAGE_MAX_LENGTH}
                    aria-describedby="guestbook-message-count"
                    required
                  ></textarea>
                  <span className="signal-char-count" id="guestbook-message-count">
                    {message.length}/{MESSAGE_MAX_LENGTH}
                  </span>
                </div>

                <button 
                  type="submit" 
                  className="signal-btn"
                  disabled={isSubmitting || message.trim().length === 0 || author.trim().length === 0}
                >
                  {isSubmitting ? 'Posting...' : 'Post Note'}
                </button>
                <p className="signal-status" id="guestbook-status" role="status" aria-live="polite">
                  {statusMessage}
                </p>
              </form>
            </div>

            {/* Right: Board */}
            <div 
              className="signal-board-area"
              ref={boardRef}
              role="region"
              aria-label="Guestbook note wall"
              aria-describedby="guestbook-board-hint"
            >
              <div className="signal-board-hint" id="guestbook-board-hint">
                // Drag notes, or use arrow keys when focused
              </div>

              {notes.length === 0 && (
                <div className="signal-board-empty">
                  <span>No notes yet</span>
                  <p>Be the first to leave feedback on the wall.</p>
                </div>
              )}
              
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
                  onKeyDown={(e) => handleNoteKeyDown(e, note.id)}
                  tabIndex={0}
                  role="article"
                  aria-label={`${note.author} wrote on ${note.date}: ${note.text}`}
                  title="Drag to move. Use arrow keys while focused for small adjustments."
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
