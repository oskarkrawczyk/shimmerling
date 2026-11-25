/**
 * Where a wave starts: a pointer event, an element's centre, a point in the host, the centre or a side.
 * Left out, or an event without a position, it starts at the latest pointer press (within a second), else the centre.
 */
export type ShimmerlingFrom =
  | { clientX: number; clientY: number }
  | Event
  | Element
  | { x: number; y: number }
  | 'center' | 'top' | 'bottom' | 'left' | 'right';

/** What starts the wave: a selector, an element, a function returning one, or false/null for code only. Leave out to play on any click in the host. */
export type ShimmerlingTrigger = string | Element | (() => Element | null | undefined) | false | null;

/** Any CSS colour. One colour instead of a list fills every slot. */
export interface ShimmerlingColors {
  /** Warm outer band of the rim. */
  outer?: string | [string, string?];
  /** Cool inner band of the rim. */
  inner?: string | [string, string?];
  /** Bright line in the rim. */
  core?: string;
  /** Tint left behind the front, usually translucent. */
  tint?: string;
  /** Border glow. */
  glow?: string | [string, string?, string?];
}

export interface ShimmerlingOptions {
  trigger?: ShimmerlingTrigger;
  colors?: ShimmerlingColors;
  /** A wave started. */
  onStart?: () => void;
  /** The wave and the border glow have finished. */
  onEnd?: () => void;
}

export interface ShimmerlingInstance {
  readonly element: HTMLElement;
  /** True when the host was position: static and got position: relative. */
  readonly isStatic: boolean;
  /** Plays a wave; settles when it and the border glow are done. Returns the running wave's promise while one plays. Pointer and element positions outside the host move to its nearest edge. */
  play(from?: ShimmerlingFrom): Promise<void>;
  /** Changes options; colours apply right away. */
  update(options: ShimmerlingOptions): void;
  /** Removes the layer, the classes and the click listener. */
  destroy(): void;
}

export function createShimmerling(element: HTMLElement, options?: ShimmerlingOptions): ShimmerlingInstance;
