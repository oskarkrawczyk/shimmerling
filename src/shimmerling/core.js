/*
  Shimmerling: plays an iridescent wave across an element's background. Content stays on top.

    const s = createShimmerling(element, { trigger, colors, onStart, onEnd });
    s.play(from);  s.update({ colors });  s.destroy();

  trigger: undefined (click anywhere in the host) | selector | element | () => element | false or null (code only).
  from: event | element | {x, y} | 'center' | 'top' | 'bottom' | 'left' | 'right'; left out, the latest pointer press.
  colors: { outer: [a, b], inner: [a, b], core, tint, glow: [a, b, c] }, any CSS colour, one colour fills every slot.
  React and Vue wrappers live in react.jsx and vue.js. The CSS custom properties are listed in shimmerling.css.
*/
import css from './shimmerling.css?inline';

// styles go in once per document, first in <head> so the page's own CSS wins on equal specificity
function injectStyles(doc) {
  if (doc.querySelector('style[data-shimmerling]')) return;
  const style = doc.createElement('style');
  style.setAttribute('data-shimmerling', '');
  style.textContent = css;
  doc.head.prepend(style);
}

// '2.4s' or '800ms' to seconds
const seconds = v => (v = v.trim()) ? parseFloat(v) / (v.endsWith('ms') ? 1000 : 1) : NaN;
const GLOW_TURN = 75;   // border glow rotation, degrees per second

const EDGE_OFFSET = 20;     // side keywords start this far outside the host, so the start isn't a sharp point on the edge
const PRESS_TTL = 1000;     // play() without a position uses a pointer press at most this old, in ms

// latest pointer press on the page, for play() calls that arrive without a position (menus, custom events);
// capture phase, so it's recorded even when a menu stops propagation or unmounts the item
let lastPress = null;
const tracked = new WeakSet();
function trackPresses(doc) {
  if (tracked.has(doc)) return;
  tracked.add(doc);
  const press = e => { lastPress = { x: e.clientX, y: e.clientY, t: performance.now() }; };
  doc.addEventListener('pointerdown', press, true);
  doc.addEventListener('pointerup', press, true);
  doc.addEventListener('keydown', () => { lastPress = null; }, true);
}

// test environments such as jsdom have neither; there play() settles at once
const reducedMotion = doc => !!doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const animationsOf = el => el.getAnimations?.({ subtree: true }) ?? [];

const hasPoint = e => typeof e?.clientX === 'number' && !!(e.clientX || e.clientY);
const clamp = (v, max) => Math.min(Math.max(v, 0), max);

// origin in the host's border box, which is the layer's box; points outside the host move to its nearest edge
function origin(host, from, w, h) {
  const r = host.getBoundingClientRect();
  const inside = (x, y) => [clamp(x - r.left, w), clamp(y - r.top, h)];
  if (typeof from === 'string') {
    const o = EDGE_OFFSET;
    return { top: [w / 2, -o], bottom: [w / 2, h + o], left: [-o, h / 2], right: [w + o, h / 2] }[from] ?? [w / 2, h / 2];
  }
  if (from instanceof Element) {
    const t = from.getBoundingClientRect();
    return inside(t.left + t.width / 2, t.top + t.height / 2);
  }
  if (hasPoint(from)) return inside(from.clientX, from.clientY);
  const isEvent = from instanceof Event || from?.nativeEvent instanceof Event;
  if (!isEvent && typeof from?.x === 'number') return [from.x, from.y];
  // nothing, or an event without a position: start where the pointer last pressed, if that was just now
  if (lastPress && performance.now() - lastPress.t < PRESS_TTL) return inside(lastPress.x, lastPress.y);
  return [w / 2, h / 2];
}

// keyboard clicks have no pointer position, so they start from the clicked element instead
const fromClick = (e, el) => (e.clientX || e.clientY) ? e : el;

// colors option to the --shimmerling-* properties shimmerling.css reads
const COLOR_SLOTS = { outer: ['a', 'b'], inner: ['c', 'd'], core: ['core'], tint: ['fill'], glow: ['e1', 'e2', 'e3'] };
function setColors(layer, colors) {
  for (const [key, slots] of Object.entries(COLOR_SLOTS)) {
    const list = colors?.[key] == null ? [] : [colors[key]].flat();
    slots.forEach((slot, i) => {
      const prop = `--shimmerling-${slot}`;
      if (list.length) layer.style.setProperty(prop, list[Math.min(i, list.length - 1)]);
      else layer.style.removeProperty(prop);
    });
  }
}

let count = 0;
const layerContent = id => `
  <span class="shimmerling-warp" style="filter: url(#${id})">
    <i class="shimmerling-fill"></i>
    <i class="shimmerling-rings"><i class="shimmerling-ring-cool"></i><i class="shimmerling-ring-core"></i><i class="shimmerling-ring-warm"></i></i>
  </span>
  <i class="shimmerling-sparks"></i><i class="shimmerling-edge shimmerling-edge-soft"></i><i class="shimmerling-edge"></i>
  <svg width="0" height="0" style="position: absolute">
    <filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" numOctaves="1" seed="7" />
      <feDisplacementMap in="SourceGraphic" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>`.replace(/>\s+</g, '><').trim();

export function createShimmerling(host, options = {}) {
  const opts = { ...options };
  injectStyles(host.ownerDocument);
  trackPresses(host.ownerDocument);

  // framework wrappers render an empty layer themselves, so their own updates never remove it
  let layer = host.querySelector(':scope > .shimmerling-layer');
  const ownLayer = !layer;
  if (ownLayer) {
    layer = document.createElement('span');
    layer.className = 'shimmerling-layer';
    layer.setAttribute('aria-hidden', 'true');
    host.append(layer);
  }
  layer.innerHTML = layerContent(`shimmerling-${++count}`);
  setColors(layer, opts.colors);

  // the layer needs a positioned host; other positions are left alone
  host.classList.add('shimmerling');
  host.classList.remove('shimmerling-static');
  const isStatic = getComputedStyle(host).position === 'static';
  host.classList.toggle('shimmerling-static', isStatic);

  let playing = null, destroyed = false;

  function play(from) {
    if (playing) return playing;
    if (destroyed || reducedMotion(host.ownerDocument)) return Promise.resolve();

    const cs = getComputedStyle(host);
    const w = host.offsetWidth, h = host.offsetHeight, size = Math.max(w, h, 1);
    const [x, y] = origin(host, from, w, h);
    const far = Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y));

    // rim, warp and noise scale with the host so small elements still read as a wave
    const set = parseFloat(cs.getPropertyValue('--shimmerling-warp'));
    const warp = Number.isFinite(set) ? set : Math.min(110, size * .32);
    const pad = Math.ceil(warp * .75) + 8;
    const ripple = parseFloat(cs.getPropertyValue('--shimmerling-ripple'));
    const k = ripple > 0 ? ripple : 1;
    layer.querySelector('feTurbulence').setAttribute('baseFrequency', `${2.7 * k / size} ${1.5 * k / size}`);
    layer.querySelector('feDisplacementMap').setAttribute('scale', warp);

    // the glow turns at the same speed however long it lasts
    const glow = seconds(cs.getPropertyValue('--shimmerling-glow'));

    const vars = {
      x, y, far, pad, 'auto-w': Math.max(24, Math.min(110, size * .32)),
      'spin-to': `${150 + GLOW_TURN * (Number.isFinite(glow) ? glow : 2.4)}deg`,
      // pull the layer out over the border
      bt: cs.borderTopWidth, br: cs.borderRightWidth, bb: cs.borderBottomWidth, bl: cs.borderLeftWidth,
    };
    for (const [k, v] of Object.entries(vars)) layer.style.setProperty(`--_${k}`, typeof v === 'number' ? v + 'px' : v);

    layer.classList.add('is-playing');
    opts.onStart?.();

    playing = Promise.allSettled(animationsOf(layer).map(a => a.finished)).then(() => {
      layer.classList.remove('is-playing');
      playing = null;
      if (!destroyed) opts.onEnd?.();
    });
    return playing;
  }

  // every trigger listens on the document, after framework click handlers have run,
  // so preventDefault in the host's own click handler can stop the wave
  function onDocClick(e) {
    const { trigger } = opts;
    if (trigger === false || trigger === null) return;
    let el = null;
    if (trigger === undefined) {
      if (!e.defaultPrevented && e.composedPath().includes(host)) el = host;
    } else if (typeof trigger === 'string') {
      el = e.target.closest?.(trigger);
      if (el && !host.contains(el) && host.querySelector(trigger)) el = null;
    } else {
      const t = typeof trigger === 'function' ? trigger() : trigger;
      if (t && e.composedPath().includes(t)) el = t;
    }
    if (el) play(fromClick(e, el));
  }
  document.addEventListener('click', onDocClick);

  return {
    element: host,
    isStatic,
    play,
    update(next) {
      Object.assign(opts, next);
      if ('colors' in next) setColors(layer, opts.colors);
    },
    destroy() {
      destroyed = true;
      document.removeEventListener('click', onDocClick);
      animationsOf(layer).forEach(a => a.cancel());
      if (ownLayer) layer.remove();
      else { layer.replaceChildren(); layer.className = 'shimmerling-layer'; layer.removeAttribute('style'); }
      host.classList.remove('shimmerling', 'shimmerling-static');
    },
  };
}
