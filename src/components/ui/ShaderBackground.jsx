import { useEffect, useRef } from 'react';
import './ShaderBackground.css';

/**
 * Animated WebGL "plasma" background, adapted from the shadcn shader-background
 * component to this project's conventions (JSX + scoped CSS, no Tailwind).
 *
 * Differences from the original:
 *  - Colours retuned to black + baby blue (was purple/indigo).
 *  - Positioned to fill its PARENT (absolute), not the whole window, so it can
 *    be scoped to a single section (the hero).
 *  - The render loop pauses whenever the canvas leaves the viewport, so it
 *    never draws — or costs anything — once you scroll past the hero.
 */

const vsSource = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`;

const fsSource = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;
  /* Theme-driven colours (set from JS based on light/dark mode). */
  uniform vec4 uBgColor1;
  uniform vec4 uBgColor2;
  uniform vec4 uLineColor;
  uniform float uLight; // 1.0 in light mode, 0.0 in dark mode

  const float overallSpeed = 0.2;
  const float gridSmoothWidth = 0.015;
  const float axisWidth = 0.05;
  const float majorLineWidth = 0.025;
  const float minorLineWidth = 0.0125;
  const float majorLineFrequency = 5.0;
  const float minorLineFrequency = 1.0;
  const vec4 gridColor = vec4(0.5);
  const float scale = 5.0;
  const float minLineWidth = 0.01;
  const float maxLineWidth = 0.2;
  const float lineSpeed = 1.0 * overallSpeed;
  const float lineAmplitude = 1.0;
  const float lineFrequency = 0.2;
  const float warpSpeed = 0.2 * overallSpeed;
  const float warpFrequency = 0.5;
  const float warpAmplitude = 1.0;
  const float offsetFrequency = 0.5;
  const float offsetSpeed = 1.33 * overallSpeed;
  const float minOffsetSpread = 0.6;
  const float maxOffsetSpread = 2.0;
  const int linesPerGroup = 13;

  #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
  #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
  #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
  #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

  float drawGridLines(float axis) {
    return drawCrispLine(0.0, axisWidth, axis)
          + drawPeriodicLine(majorLineFrequency, majorLineWidth, axis)
          + drawPeriodicLine(minorLineFrequency, minorLineWidth, axis);
  }

  float drawGrid(vec2 space) {
    return min(1.0, drawGridLines(space.x) + drawGridLines(space.y));
  }

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
  }

  float getPlasmaY(float x, float horizontalFade, float offset) {
    return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec4 fragColor;
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

    float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
    float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

    space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
    space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

    vec4 lines = vec4(0.0);

    for(int l = 0; l < linesPerGroup; l++) {
      float normalizedLineIndex = float(l) / float(linesPerGroup);
      float offsetTime = iTime * offsetSpeed;
      float offsetPosition = float(l) + space.x * offsetFrequency;
      float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
      float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
      float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
      float linePosition = getPlasmaY(space.x, horizontalFade, offset);
      float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

      float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
      vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
      float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

      line = line + circle;
      lines += line * uLineColor * rand;
    }

    vec4 base = mix(uBgColor1, uBgColor2, uv.x);

    if (uLight > 0.5) {
      /* Light mode: blend the light background TOWARD the line colour where
         lines are strong, so blue lines read on a light background (additive
         blending would just wash out to white). */
      float li = clamp((lines.r + lines.g + lines.b) * 0.5, 0.0, 1.0);
      fragColor = mix(base, uLineColor, li);
      fragColor.a = 1.0;
    } else {
      /* Dark mode: original additive glow over a dark, vignetted background. */
      base *= verticalFade;
      base.a = 1.0;
      fragColor = base + lines;
    }

    gl_FragColor = fragColor;
  }
`;

const loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error: ', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const initShaderProgram = (gl, vs, fs) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Shader program link error: ', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
};

export default function ShaderBackground({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL not supported.');
      return;
    }

    const program = initShaderProgram(gl, vsSource, fsSource);
    if (!program) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const vertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    const uResolution = gl.getUniformLocation(program, 'iResolution');
    const uTime = gl.getUniformLocation(program, 'iTime');
    const uBgColor1 = gl.getUniformLocation(program, 'uBgColor1');
    const uBgColor2 = gl.getUniformLocation(program, 'uBgColor2');
    const uLineColor = gl.getUniformLocation(program, 'uLineColor');
    const uLight = gl.getUniformLocation(program, 'uLight');

    // Colour palettes per theme. Dark = black + baby blue (additive glow);
    // light = pale background + a readable blue that blends over it.
    const PALETTES = {
      dark: {
        bg1: [0.0, 0.0, 0.0, 1.0],
        bg2: [0.02, 0.06, 0.10, 1.0],
        line: [0.45, 0.78, 0.95, 1.0],
        light: 0,
      },
      light: {
        bg1: [0.93, 0.95, 0.97, 1.0],
        bg2: [0.82, 0.89, 0.95, 1.0],
        line: [0.13, 0.55, 0.78, 1.0],
        light: 1,
      },
    };
    // Read the active palette straight from the <html> theme class every frame.
    // Cheap, and immune to effect/observer timing (StrictMode double-mounts,
    // child-before-parent effect order, etc.).
    const currentPalette = () =>
      document.documentElement.classList.contains('light') ? PALETTES.light : PALETTES.dark;

    // Perf: this fragment shader is expensive per pixel, so render into a
    // low-resolution buffer and let the browser upscale it. The plasma is soft,
    // so the downscale is essentially invisible but cuts pixel work by ~4x.
    const QUALITY = 0.7; // fraction of CSS pixels actually rendered
    const TARGET_FPS = 30; // cap the loop; the animation is slow so 30 is plenty

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * QUALITY));
      const h = Math.max(1, Math.floor(canvas.clientHeight * QUALITY));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const minInterval = 1000 / TARGET_FPS;
    let rafId = null;
    let running = false;
    let lastDrawn = null; // timestamp of the last frame we actually rendered
    let time = 0;

    const renderFrame = () => {
      const palette = currentPalette();
      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform4fv(uBgColor1, palette.bg1);
      gl.uniform4fv(uBgColor2, palette.bg2);
      gl.uniform4fv(uLineColor, palette.line);
      gl.uniform1f(uLight, palette.light);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vertexPosition);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const draw = (ts) => {
      rafId = requestAnimationFrame(draw);

      // Throttle to TARGET_FPS: skip this frame if too soon since the last draw.
      if (lastDrawn !== null && ts - lastDrawn < minInterval) return;
      // Advance time by the real elapsed since the last draw, so the animation
      // runs at the same speed regardless of how many frames we skip.
      if (lastDrawn !== null) time += (ts - lastDrawn) / 1000;
      lastDrawn = ts;

      renderFrame();
    };

    const start = () => {
      if (running) return;
      running = true;
      lastDrawn = null;
      rafId = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    // Respect reduced-motion: render one static frame and never animate.
    const reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let io = null;
    if (reduceMotion) {
      requestAnimationFrame(renderFrame);
    } else {
      // Only animate while the hero is on screen — pausing when scrolled away.
      io = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { threshold: 0 },
      );
      io.observe(canvas);
    }

    return () => {
      stop();
      if (io) io.disconnect();
      resizeObserver.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return <canvas ref={canvasRef} className={`shader-bg ${className}`.trim()} aria-hidden="true" />;
}
