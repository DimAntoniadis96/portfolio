import Sparkles from './Sparkles';
import './HeaderSparkles.css';

/**
 * Decorative accent for section headers: a gradient line spanning the full
 * heading width with a sparkle field beneath, edge-faded so it blends into
 * any section background. Meant to sit inside `.section-heading-block`
 * (an inline-block wrapper) so its width tracks the heading text width.
 */
export default function HeaderSparkles({ className = '' }) {
  return (
    <div className={`header-sparkles ${className}`.trim()} aria-hidden="true">
      <span className="header-sparkles-line header-sparkles-line--main-blur" />
      <span className="header-sparkles-line header-sparkles-line--main" />
      <span className="header-sparkles-line header-sparkles-line--sky-blur" />
      <span className="header-sparkles-line header-sparkles-line--sky" />
      <Sparkles
        className="header-sparkles-core"
        minSize={0.5}
        maxSize={1.5}
        particleDensity={42}
      />
    </div>
  );
}
