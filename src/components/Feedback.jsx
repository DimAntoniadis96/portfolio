import { useCallback, useEffect, useRef, useState } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import './Feedback.css';

const STORAGE_KEY = 'portfolio-guestbook-notes-v1';
const AUTHOR_ID_STORAGE_KEY = 'portfolio-guestbook-author-id-v1';
const NOTE_POSITIONS_STORAGE_KEY = 'portfolio-guestbook-note-positions-v1';
const NOTE_WIDTH = 190;
const NOTE_HEIGHT = 150;
const NOTE_MARGIN = 12;
const BOARD_EDGE_PADDING = 16;
const BOARD_HINT_SAFE_AREA = 70;
const AUTHOR_MAX_LENGTH = 24;
const MESSAGE_MAX_LENGTH = 180;
const KEYBOARD_STEP = 12;
const REVIEWS_API_BASE_URL = (import.meta.env.VITE_REVIEWS_API_BASE_URL || '').trim().replace(/\/+$/, '');

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

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getNoteAnimationDelay(id) {
  const hash = String(id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `${(hash % 5) * -1.2}s`;
}

function sanitizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function formatNoteDate(value = new Date()) {
  const date = new Date(value);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const month = safeDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = safeDate.getDate();

  return `${month} ${day}`;
}

function getDefaultNotePosition(index, boardRect) {
  const boardWidth = boardRect?.width || 700;
  const columnWidth = NOTE_WIDTH + NOTE_MARGIN;
  const rowHeight = NOTE_HEIGHT + NOTE_MARGIN;
  const columns = Math.max(1, Math.floor((boardWidth - BOARD_EDGE_PADDING) / columnWidth));

  return {
    x: BOARD_EDGE_PADDING + ((index % columns) * columnWidth),
    y: BOARD_EDGE_PADDING + (Math.floor(index / columns) * rowHeight),
  };
}

function getSpawnPosition(boardRect) {
  if (!boardRect) {
    return { x: 100, y: 100 };
  }

  return clampNoteToBoard({
    x: (boardRect.width / 2) - (NOTE_WIDTH / 2) + (Math.random() * 40 - 20),
    y: (boardRect.height / 2) - (NOTE_HEIGHT / 2) + (Math.random() * 40 - 20),
  }, boardRect);
}

function getStoredAuthorId() {
  if (typeof window === 'undefined') return createId();

  try {
    const existingId = window.localStorage.getItem(AUTHOR_ID_STORAGE_KEY);
    if (existingId) return existingId;

    const nextId = createId();
    window.localStorage.setItem(AUTHOR_ID_STORAGE_KEY, nextId);
    return nextId;
  } catch {
    return createId();
  }
}

function getStoredNotePositions() {
  if (typeof window === 'undefined') return {};

  try {
    const storedPositions = window.localStorage.getItem(NOTE_POSITIONS_STORAGE_KEY);
    if (!storedPositions) return {};

    const parsedPositions = JSON.parse(storedPositions);
    if (!parsedPositions || typeof parsedPositions !== 'object') return {};

    return parsedPositions;
  } catch {
    return {};
  }
}

function storeNotePositions(notes) {
  if (typeof window === 'undefined') return;

  try {
    const positions = notes.reduce((positionMap, note) => {
      if (Number.isFinite(note.x) && Number.isFinite(note.y)) {
        positionMap[String(note.id)] = { x: note.x, y: note.y };
      }

      return positionMap;
    }, {});

    window.localStorage.setItem(NOTE_POSITIONS_STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Dragging still works if storage is unavailable.
  }
}

function createNoteFromReview(review, position) {
  const id = String(review.id || createId());

  return {
    id,
    author: sanitizeText(review.alias, AUTHOR_MAX_LENGTH) || 'Visitor',
    date: formatNoteDate(review.createdAt),
    text: sanitizeText(review.body, MESSAGE_MAX_LENGTH),
    x: position.x,
    y: position.y,
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
      (typeof note.id === 'number' || typeof note.id === 'string') &&
      typeof note.author === 'string' &&
      typeof note.date === 'string' &&
      typeof note.text === 'string' &&
      Number.isFinite(note.x) &&
      Number.isFinite(note.y)
    )).map((note) => ({ ...note, id: String(note.id) }));
  } catch {
    return [];
  }
}

export default function Feedback() {
  const { ref, isVisible } = useFadeIn();
  
  const boardRef = useRef(null);
  const [notes, setNotes] = useState(() => (REVIEWS_API_BASE_URL ? [] : getStoredNotes()));
  
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(Boolean(REVIEWS_API_BASE_URL));
  const [statusMessage, setStatusMessage] = useState('');

  const [isPollingVisible, setIsPollingVisible] = useState(false);
  const hasFetchedInitially = useRef(false);

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

  const buildNotesFromReviews = useCallback((reviews, currentNotes = []) => {
    const boardRect = boardRef.current?.getBoundingClientRect();
    const existingNotes = new Map(currentNotes.map((note) => [String(note.id), note]));
    const storedPositions = getStoredNotePositions();

    const reviewNotes = reviews.map((review, index) => {
      const id = String(review.id || createId());
      const savedPosition = storedPositions[id];
      const existingNote = existingNotes.get(id);
      const defaultPosition = getDefaultNotePosition(index, boardRect);
      const position = {
        x: savedPosition?.x ?? existingNote?.x ?? defaultPosition.x,
        y: savedPosition?.y ?? existingNote?.y ?? defaultPosition.y,
      };

      return createNoteFromReview({ ...review, id }, position);
    });

    return resolveCollisions(reviewNotes);
  }, [resolveCollisions]);

  useEffect(() => {
    if (REVIEWS_API_BASE_URL) {
      storeNotePositions(notes);
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // The board still works if storage is unavailable.
    }
  }, [notes]);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPollingVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!REVIEWS_API_BASE_URL) return undefined;

    let isActive = true;

    async function loadReviews(isInitial) {
      if (isInitial) setIsLoadingReviews(true);

      try {
        const response = await fetch(`${REVIEWS_API_BASE_URL}/reviews`);
        if (!response.ok) {
          throw new Error(`Reviews API responded with ${response.status}`);
        }

        const data = await response.json();
        const reviews = Array.isArray(data.reviews) ? data.reviews : [];

        if (isActive) {
          setNotes((currentNotes) => buildNotesFromReviews(reviews, currentNotes));
          if (isInitial) setStatusMessage('');
        }
      } catch {
        if (isActive && isInitial) {
          setStatusMessage('The live guestbook is not connected yet. Check the API deployment and environment variables.');
        }
      } finally {
        if (isActive && isInitial) {
          setIsLoadingReviews(false);
        }
      }
    }

    if (!hasFetchedInitially.current) {
      loadReviews(true);
      hasFetchedInitially.current = true;
    }

    let intervalId;
    if (isPollingVisible) {
      intervalId = setInterval(() => {
        loadReviews(false);
      }, 10000); // Poll every 10 seconds when visible
    }

    return () => {
      isActive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [buildNotesFromReviews, isPollingVisible]);

  useEffect(() => {
    const handleResize = () => {
      setNotes((currentNotes) => resolveCollisions(currentNotes));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedAuthor = author.trim();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !trimmedAuthor) {
      setStatusMessage('Add your name and a short note before posting.');
      return;
    }
    
    setIsSubmitting(true);
    setStatusMessage('');

    const boardRect = boardRef.current?.getBoundingClientRect();
    const spawnPosition = getSpawnPosition(boardRect);

    if (!REVIEWS_API_BASE_URL) {
      const newNote = {
        id: createId(),
        author: trimmedAuthor,
        date: formatNoteDate(),
        text: trimmedMessage,
        x: spawnPosition.x,
        y: spawnPosition.y,
      };
      
      setNotes((currentNotes) => resolveCollisions([...currentNotes, newNote], newNote.id));
      setMessage('');
      setAuthor('');
      setIsSubmitting(false);
      setStatusMessage(`Thanks, ${trimmedAuthor}. Your note is saved on this device until the live API is connected.`);
      return;
    }

    try {
      const reviewId = createId();
      const response = await fetch(`${REVIEWS_API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reviewId,
          alias: trimmedAuthor,
          authorId: getStoredAuthorId(),
          body: trimmedMessage,
          replyTo: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Reviews API responded with ${response.status}`);
      }

      const data = await response.json();
      const review = data.review || {
        id: reviewId,
        alias: trimmedAuthor,
        body: trimmedMessage,
        createdAt: new Date().toISOString(),
      };
      const newNote = createNoteFromReview(review, spawnPosition);

      setNotes((currentNotes) => resolveCollisions([...currentNotes, newNote], newNote.id));
      setMessage('');
      setAuthor('');
      setStatusMessage(`Thanks, ${trimmedAuthor}. Your note is live on the wall.`);
    } catch {
      setStatusMessage('I could not save this online yet. Check the reviews API deployment and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="feedback section" id="feedback">
      <div className="container">
        <div ref={ref} className={`fade-in ${isVisible ? 'visible' : ''}`}>
          
          <div className="feedback-header">
            <div>
              <span className="section-label">Feedback wall</span>
              <h2 className="section-heading">Guest<span style={{ color: 'var(--accent-primary)' }}>book</span></h2>
            </div>
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
                  {REVIEWS_API_BASE_URL ? 'LIVE' : 'LOCAL'}
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

              {isLoadingReviews && (
                <div className="signal-board-empty">
                  <span>Loading notes</span>
                  <p>Fetching the latest feedback from the live wall.</p>
                </div>
              )}

              {!isLoadingReviews && notes.length === 0 && (
                <div className="signal-board-empty">
                  <span>No notes yet</span>
                  <p>
                    {REVIEWS_API_BASE_URL
                      ? 'Be the first to leave feedback on the live wall.'
                      : 'Be the first to leave feedback on this local wall.'}
                  </p>
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
                  <div className="signal-note-inner" style={{ animationDelay: getNoteAnimationDelay(note.id) }}>
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
