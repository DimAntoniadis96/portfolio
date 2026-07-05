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
const AUTHOR_ID_MAX_LENGTH = 80;
const MESSAGE_MAX_LENGTH = 180;
const NOTE_DATE_MAX_LENGTH = 16;
const MAX_NOTES = 36;
const KEYBOARD_STEP = 12;
const POLL_INTERVAL_MS = 20000;
const IDLE_TIMEOUT_MS = 2 * 60 * 1000;
const REVIEWS_REQUEST_TIMEOUT_MS = 10000;
const MAX_CONSECUTIVE_ERRORS = 3;
const ERROR_PAUSE_MS = 60 * 1000;
const REVIEWS_API_BASE_URL = (import.meta.env.VITE_REVIEWS_API_BASE_URL || '').trim().replace(/\/+$/, '');

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function clampNoteToBoard(note, boardRect) {
  const maxX = Math.max(0, boardRect.width - NOTE_WIDTH - BOARD_EDGE_PADDING);
  const maxY = Math.max(0, boardRect.height - NOTE_HEIGHT - BOARD_HINT_SAFE_AREA);
  const minX = maxX > BOARD_EDGE_PADDING ? BOARD_EDGE_PADDING : 0;
  const minY = maxY > BOARD_EDGE_PADDING ? BOARD_EDGE_PADDING : 0;
  const x = Number.isFinite(note.x) ? note.x : minX;
  const y = Number.isFinite(note.y) ? note.y : minY;

  return {
    ...note,
    x: clamp(x, minX, maxX),
    y: clamp(y, minY, maxY),
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

function isFinitePosition(value) {
  return value && typeof value === 'object' && Number.isFinite(value.x) && Number.isFinite(value.y);
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
    const existingId = sanitizeText(window.localStorage.getItem(AUTHOR_ID_STORAGE_KEY), AUTHOR_ID_MAX_LENGTH);
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

    return Object.entries(parsedPositions).reduce((positions, [id, position]) => {
      if (isFinitePosition(position)) {
        positions[String(id)] = { x: position.x, y: position.y };
      }

      return positions;
    }, {});
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

function getRenderableReviews(reviews) {
  if (!Array.isArray(reviews)) return [];

  const seenIds = new Set();

  return reviews.reduce((safeReviews, review) => {
    if (!review || typeof review !== 'object' || safeReviews.length >= MAX_NOTES) {
      return safeReviews;
    }

    const id = String(review.id || createId());
    const body = sanitizeText(review.body, MESSAGE_MAX_LENGTH);

    if (!body || seenIds.has(id)) {
      return safeReviews;
    }

    seenIds.add(id);
    safeReviews.push({
      id,
      alias: sanitizeText(review.alias, AUTHOR_MAX_LENGTH) || 'Visitor',
      body,
      createdAt: review.createdAt,
    });

    return safeReviews;
  }, []);
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
    )).map((note) => ({
      ...note,
      id: String(note.id),
      author: sanitizeText(note.author, AUTHOR_MAX_LENGTH) || 'Visitor',
      date: sanitizeText(note.date, NOTE_DATE_MAX_LENGTH) || formatNoteDate(),
      text: sanitizeText(note.text, MESSAGE_MAX_LENGTH),
    })).filter((note) => note.text).slice(0, MAX_NOTES);
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
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [isIdle, setIsIdle] = useState(false);
  const hasFetchedInitially = useRef(false);
  const lastFetchAt = useRef(0);
  const consecutiveErrors = useRef(0);
  const errorPauseUntil = useRef(0);
  const optimisticNotes = useRef(new Map());

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

    const renderableReviews = getRenderableReviews(reviews);
    const reviewIds = new Set(renderableReviews.map((review) => String(review.id)));

    reviewIds.forEach((id) => optimisticNotes.current.delete(id));

    const reviewNotes = renderableReviews.map((review, index) => {
      const id = review.id;
      const savedPosition = storedPositions[id];
      const existingNote = existingNotes.get(id);
      const defaultPosition = getDefaultNotePosition(index, boardRect);
      const position = {
        x: savedPosition?.x ?? existingNote?.x ?? defaultPosition.x,
        y: savedPosition?.y ?? existingNote?.y ?? defaultPosition.y,
      };

      return createNoteFromReview({ ...review, id }, position);
    });
    const pendingNotes = Array.from(optimisticNotes.current.values())
      .filter((note) => !reviewIds.has(String(note.id)));

    return resolveCollisions([...reviewNotes, ...pendingNotes].slice(0, MAX_NOTES));
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
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    handleVisibilityChange();
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      consecutiveErrors.current = 0;
      errorPauseUntil.current = 0;
      setIsOnline(true);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(typeof navigator === 'undefined' ? true : navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let idleTimer;
    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }));
    
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(e => window.removeEventListener(e, resetIdleTimer));
    };
  }, []);

  useEffect(() => {
    if (!REVIEWS_API_BASE_URL) return undefined;

    let isActive = true;
    let abortController = null;
    const shouldPoll = isPollingVisible && isTabVisible && isOnline && !isIdle;

    async function loadReviews(isInitial, force = false) {
      if (!isOnline) {
        if (isActive && isInitial) {
          setIsLoadingReviews(false);
          setStatusMessage('You appear to be offline. The live guestbook will reconnect when your network is back.');
        }
        return;
      }

      const now = Date.now();
      if (!force && now - lastFetchAt.current < 1000) return;

      if (errorPauseUntil.current > now) {
        if (isActive) {
          setStatusMessage('Live guestbook connection is cooling down after repeated errors. It will retry shortly.');
        }
        return;
      }
      if (errorPauseUntil.current && errorPauseUntil.current <= now) {
        errorPauseUntil.current = 0;
        consecutiveErrors.current = 0;
      }

      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();
      const requestController = abortController;
      let didRequestTimeout = false;
      const requestTimeout = window.setTimeout(() => {
        didRequestTimeout = true;
        requestController.abort();
      }, REVIEWS_REQUEST_TIMEOUT_MS);

      lastFetchAt.current = now;

      if (isInitial) setIsLoadingReviews(true);

      try {
        const response = await fetch(`${REVIEWS_API_BASE_URL}/reviews`, {
          headers: { Accept: 'application/json' },
          signal: requestController.signal,
        });
        if (!response.ok) {
          throw new Error(`Reviews API responded with ${response.status}`);
        }

        const data = await response.json();
        const reviews = Array.isArray(data.reviews) ? data.reviews : [];

        if (isActive) {
          hasFetchedInitially.current = true;
          consecutiveErrors.current = 0;
          errorPauseUntil.current = 0;
          setNotes((currentNotes) => buildNotesFromReviews(reviews, currentNotes));
          if (isInitial) setStatusMessage('');
        }
      } catch (error) {
        if (error.name === 'AbortError' && !didRequestTimeout) return;

        consecutiveErrors.current += 1;
        if (isActive && isInitial) {
          setStatusMessage(didRequestTimeout
            ? 'The live guestbook request timed out. It will retry while this section is active.'
            : 'The live guestbook is not connected yet. Check the API deployment and environment variables.');
        } else if (isActive && consecutiveErrors.current >= MAX_CONSECUTIVE_ERRORS) {
          errorPauseUntil.current = Date.now() + ERROR_PAUSE_MS;
          setStatusMessage('Live guestbook connection paused after repeated errors. It will retry in a minute.');
        }
      } finally {
        window.clearTimeout(requestTimeout);
        if (abortController === requestController) {
          abortController = null;
        }
        if (isActive && isInitial) {
          setIsLoadingReviews(false);
        }
      }
    }

    if (!shouldPoll) return undefined;

    loadReviews(!hasFetchedInitially.current, true);

    const intervalId = setInterval(() => {
      loadReviews(false);
    }, POLL_INTERVAL_MS);

    return () => {
      isActive = false;
      if (abortController) abortController.abort();
      clearInterval(intervalId);
    };
  }, [buildNotesFromReviews, isPollingVisible, isTabVisible, isOnline, isIdle]);

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
    const trimmedAuthor = sanitizeText(author, AUTHOR_MAX_LENGTH);
    const trimmedMessage = sanitizeText(message, MESSAGE_MAX_LENGTH);

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

    let submitTimeout;
    let didSubmitTimeout = false;

    try {
      const reviewId = createId();
      const submitController = new AbortController();
      submitTimeout = window.setTimeout(() => {
        didSubmitTimeout = true;
        submitController.abort();
      }, REVIEWS_REQUEST_TIMEOUT_MS);
      const response = await fetch(`${REVIEWS_API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        signal: submitController.signal,
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
      optimisticNotes.current.set(String(newNote.id), newNote);

      setNotes((currentNotes) => {
        const withoutDuplicate = currentNotes.filter((note) => String(note.id) !== String(newNote.id));
        return resolveCollisions([...withoutDuplicate, newNote], newNote.id);
      });
      setMessage('');
      setAuthor('');
      setStatusMessage(`Thanks, ${trimmedAuthor}. Your note is live on the wall.`);
    } catch {
      setStatusMessage(didSubmitTimeout
        ? 'Saving timed out. Please try again while the API is reachable.'
        : 'I could not save this online yet. Check the reviews API deployment and try again.');
    } finally {
      if (submitTimeout) window.clearTimeout(submitTimeout);
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
              <h2 className="section-heading">Guestbook</h2>
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
                Drag notes. Arrow keys work when focused.
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
