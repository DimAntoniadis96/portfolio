import { useEffect } from 'react';

/**
 * Optically aligns every `.section-heading` with the accent line / left edge
 * above it.
 *
 * Big display fonts (Outfit) bake a left side-bearing into each glyph, so the
 * visible letter sits a few pixels inside its layout box while the accent line
 * is a solid rectangle flush to that box. The exact inset depends on the first
 * letter ("W" ≈ 0.5px, "E"/"L"/"P" ≈ 2.6px) and scales with the (clamped) font
 * size — so no single hardcoded CSS value can fix it.
 *
 * This measures each heading's real bearing with the Canvas API and pulls the
 * heading left by exactly that amount, so the visible text lines up with the
 * accent line for every section at any viewport width.
 */
export function useOpticalHeadings() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const align = () => {
      const headings = document.querySelectorAll('.section-heading');
      headings.forEach((heading) => {
        // Reset first so measurement reflects the natural box, not a prior nudge.
        heading.style.marginLeft = '0px';
        const cs = getComputedStyle(heading);
        ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const metrics = ctx.measureText(heading.textContent.trim());
        // actualBoundingBoxLeft is measured leftward from the text origin, so a
        // negative value means the ink starts to the RIGHT of the box edge by
        // that many pixels. Pulling the box left by the same amount lands the
        // visible glyph on the box edge (where the accent line begins).
        heading.style.marginLeft = `${metrics.actualBoundingBoxLeft}px`;
      });
    };

    // Fonts must be ready or the metrics come from a fallback face.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    } else {
      align();
    }

    window.addEventListener('resize', align);
    return () => window.removeEventListener('resize', align);
  }, []);
}
