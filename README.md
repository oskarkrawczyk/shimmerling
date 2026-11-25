# Shimmerling

Plays an iridescent wave across an element's background. The wave has an uneven, noise-warped front, leaves a tint behind it, and ends with a coloured glow that turns around the border. Content stays on top and the layout doesn't change.

It's plain JavaScript with no dependencies, plus thin wrappers for React 19 and Vue 3. TypeScript types are included.

## Install

```sh
npm install shimmerling
```

| Import | |
|---|---|
| `shimmerling` | `createShimmerling(element, options)`, for any page |
| `shimmerling/react` | `<Shimmerling>` for React 19 |
| `shimmerling/vue` | `<Shimmerling>` for Vue 3 |

There's no stylesheet to import. The first `createShimmerling` call, or the first mounted `<Shimmerling>`, adds the styles to the page itself. Importing the package doesn't touch the page, so it's safe in server rendering. The React wrapper is marked `'use client'` for the Next.js App Router.

## Plain JS

```js
import { createShimmerling } from 'shimmerling';

const wave = createShimmerling(document.querySelector('.card'), {
  trigger: '.card button',  // see Triggers; leave out to play on any click in the card
  colors: { glow: '#fff' }, // see Colours
  onStart() {},             // a wave started
  onEnd() {},               // the wave and the border glow have finished
});

wave.play('top');
wave.update({ colors: undefined });  // change any option; colours apply right away
wave.destroy();                      // removes the layer, the classes and the listener
```

The element must be able to have children. The core appends one layer element to it.

## React

```jsx
import { Shimmerling } from 'shimmerling/react';

<Shimmerling className="card" trigger="button" onEnd={…}>…</Shimmerling>
```

| Prop | Default | |
|---|---|---|
| `as` | `'div'` | Element or component to render as the host, e.g. `'button'`, `'li'`. |
| `trigger` | none | What starts the wave. See [Triggers](#triggers). A ref object works too. |
| `colors` | built-in palette | Colours of the wave. See [Colours](#colours). |
| `onStart` | | Called when a wave starts. |
| `onEnd` | | Called when the wave and the border glow have finished. |
| `ref` | | Receives `{ element, play(from) }`. See [Playing from code](#playing-from-code). |

Every other prop, including `className`, `style` and `onClick`, goes to the host element. Your `onClick` still runs; call `e.preventDefault()` in it to stop that click from playing the wave. Needs React 19, because `ref` is passed as a normal prop.

## Vue

```vue
<script setup>
import { useTemplateRef } from 'vue';
import { Shimmerling } from 'shimmerling/vue';

const wave = useTemplateRef('wave');
const refresh = useTemplateRef('refresh');
</script>

<template>
  <Shimmerling ref="wave" class="panel" :trigger="refresh" :colors="{ glow: '#fff' }" @end="…">…</Shimmerling>
  <button ref="refresh">Refresh</button>
</template>
```

- **Props:** `as`, `trigger` and `colors`, as in React. Pass `false` to the trigger with `:trigger="false"`.
- **Events:** `start` and `end`.
- **Template ref:** gets `play(from)` and `element`.
- **Other attributes and listeners** go to the host element, so `@click="e => e.preventDefault()"` stops that click from playing the wave.
- **Template ref triggers:** they're `null` until the element mounts, and until then nothing triggers the wave.

## Triggers

| `trigger` | What starts the wave |
|---|---|
| left out | A click anywhere in the host. The wave starts at the pointer. |
| a selector, e.g. `'button'` | A click on a matching element. |
| an element, or a ref to one | A click on that element, inside or outside the host. |
| a function returning an element | A click on the element it returns at the time of the click. |
| `false` or `null` | Nothing; only `play()` starts it. In React, `null` counts as left out. |

- **Selector:** matches inside the host are used first. Only when the host has no match does a match anywhere on the page count.
- **Clicks are caught at the document,** after your own click handlers have run. A trigger rendered after the host still works. A click whose propagation is stopped before it reaches the document doesn't play the wave.
- **Where the wave starts:** at the pointer for a mouse click. A keyboard click has no pointer position, so the wave starts from the centre of the clicked element.

## Playing from code

```js
wave.play('top');
await wave.play(buttonElement);  // settles when the wave and border glow are done
```

`wave` is what `createShimmerling` returns, `ref.current` in React, or the template ref in Vue. `play(from)` accepts:

- a mouse event: starts at the pointer
- an element: starts at its centre
- `{ x, y }`: px from the host's top-left corner, border included
- `'center'`, `'top'`, `'bottom'`, `'left'` or `'right'`
- nothing: starts at the centre

While a wave is playing, `play()` returns the running wave's promise instead of starting a new one. The border glow counts as part of the wave, so a long `--shimmerling-glow` delays the next play.

`element` is the host DOM element.

After `destroy()`, or once a React or Vue host unmounts, `play()` resolves at once and `onEnd` isn't called for a wave that was cut short.

## Colours

```js
createShimmerling(element, { colors: {
  outer: ['#ff5a36', '#ffb23d'],          // warm outer band of the rim
  inner: ['#c2185b', '#ff7a45'],          // cool inner band of the rim
  core: '#fff1dc',                        // bright line in the rim
  tint: 'rgb(60 16 8 / .55)',             // tint left behind the front
  glow: ['#ffb23d', '#ff5a36', '#c2185b'] // border glow
} });
```

The React and Vue `colors` props take the same object.

- Every key is optional, and anything left out keeps its default.
- Any CSS colour works, including `var(--brand)`.
- A single colour instead of a list fills every slot: `glow: '#fff'`.
- `tint` should normally be translucent, or it hides the host's background.
- The colours can change while a wave plays and apply right away. Leaving a key out later brings its default back.

The option sets the CSS custom properties below. You can set those yourself instead, for example from a stylesheet or a theme. Where both are set, the option wins.

## CSS custom properties

Set them on the host or any ancestor. All are optional.

| Property | Default | |
|---|---|---|
| `--shimmerling-a`, `--shimmerling-b` | `#ff4fa3`, `#ff9a3d` | Outer rim colours (`colors.outer`) |
| `--shimmerling-c`, `--shimmerling-d` | `#8b6cff`, `#35b9e6` | Inner rim colours (`colors.inner`) |
| `--shimmerling-core` | `#fff3ee` | Bright line in the rim (`colors.core`) |
| `--shimmerling-fill` | `rgb(40 18 72 / .55)` | Tint behind the front (`colors.tint`) |
| `--shimmerling-e1`, `-e2`, `-e3` | `#f5b638`, `#4aa8ff`, `#b25cff` | Border glow colours (`colors.glow`) |
| `--shimmerling-width` | 32% of the host's longer side, between 24px and 110px | Rim thickness, as a length: `80px` |
| `--shimmerling-warp` | 32% of the host's longer side, at most 110 | How far the front bends, in px without a unit: `60` |
| `--shimmerling-speed` | `.45s` | How long the front takes to cross the host |
| `--shimmerling-tail` | `1.25s` | How long the tint lingers behind the front |
| `--shimmerling-glow` | `2.4s` | How long the border glow keeps animating, fade-out included |
| `--shimmerling-glow-fade` | `1.8s` | Length of the glow's fade-out, at the end of `--shimmerling-glow`; capped at `--shimmerling-glow` |

**Timing:**

- The glow starts when the front is 55% of the way through `--shimmerling-speed`. It then fades in over .35s and turns at a steady 75° per second.
- A longer `--shimmerling-glow` keeps it turning for longer; it doesn't slow it down.
- Change size and timing between waves. A change during a wave can make it jump, and the warp and the glow's total turn are fixed when the wave starts.

```css
.slow-motion { --shimmerling-speed: 2.7s; --shimmerling-tail: 7.5s; --shimmerling-glow: 9s; }
```

## What it does to the host

The page gets one `<style data-shimmerling>` element, added first in `<head>` so your own CSS wins where specificity is equal. It's added once, however many hosts there are, and stays after `destroy()`.

The host gets:

- `isolation: isolate`.
- `position: relative`, but only if it was `position: static`. Other positions are left alone.
- The classes `shimmerling`, and `shimmerling-static` when it needs positioning. The React and Vue wrappers render them, so a change to the host's class keeps them.
- One extra child, `.shimmerling-layer`, after your content. Plain JS appends it; the React and Vue wrappers render it. It's absolutely positioned at `z-index: -1`, so it paints above the host's background and border and below its content. It takes no space and ignores pointer events.

Both classes' styles have zero specificity, so the host's own CSS always wins.

## Limits

- **Overflow:** the wave covers the host's border, unless the host has `overflow` other than `visible`. In that case it's clipped to the inside of the border.
- **Corner shapes:** the wave follows any `border-radius`, including none, per-corner, percentage and elliptical corners. It doesn't follow `corner-shape`.
- **Extra child:** the appended layer counts in selectors such as `:last-child` and `:empty` on the host.
- **Stacking:** `isolation: isolate` keeps the z-index of the host's children inside the host.
- **Hosts without children:** elements that can't have children, such as `img` and `input`, can't be hosts.
- **Content hides the wave:** opaque backgrounds on the host's content cover it. Light host backgrounds wash it out, because the rim is added on top of what's below.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, nothing is shown, `play()` resolves at once and `onStart` / `onEnd` aren't called.
- **Content-Security-Policy:** a `style-src` without `'unsafe-inline'` blocks the injected styles, and the wave doesn't show.
- **Shadow DOM:** the styles go into the document, so hosts inside a shadow root aren't styled.
- **Browsers:** tested in Chrome and Safari. Firefox is untested.
- **Frameworks:** tested with React 19 and Vue 3.5.

## Development

```sh
npm install
npm run dev     # test pages in demo/ at http://127.0.0.1:8765: React at /, Vue at /vue.html, plain JS at /vanilla.html
npm run build   # builds the package into dist/
```

The source is in `src/shimmerling/`; `core.js` holds the logic and `shimmerling.css` the styles, which the build inlines into the JS. `npm publish` runs the build first.
