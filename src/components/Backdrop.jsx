import './Backdrop.css';

/**
 * Fixed, decorative background layer that sits behind all content.
 * Drifting light-blue glow orbs + fine grain + subtle framing rails
 * fill the empty black space without reintroducing the old dot grid.
 */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-orb backdrop-orb--1" />
      <div className="backdrop-orb backdrop-orb--2" />
      <div className="backdrop-orb backdrop-orb--3" />
      <div className="backdrop-rays" />
      <div className="backdrop-rails" />
      <div className="backdrop-grain" />
    </div>
  );
}
