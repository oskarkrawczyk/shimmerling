import type { Component, DefineComponent, PropType, Ref } from 'vue';
import type { ShimmerlingColors, ShimmerlingFrom, ShimmerlingTrigger } from './index.js';

export type { ShimmerlingColors, ShimmerlingFrom, ShimmerlingTrigger } from './index.js';

/** What a template ref on <Shimmerling> gets. */
export interface ShimmerlingExposed {
  readonly element: HTMLElement | null;
  play(from?: ShimmerlingFrom): Promise<void>;
}

export declare const Shimmerling: DefineComponent<
  {
    /** Element or component to render as the host. Default 'div'. */
    as: { type: PropType<string | Component>; default: 'div' };
    /** What starts the wave. A template ref or component works too. Leave out to play on any click in the host. */
    trigger: { type: PropType<ShimmerlingTrigger | Ref<Element | null> | { $el: Element }>; default: undefined };
    colors: { type: PropType<ShimmerlingColors>; default: undefined };
  },
  ShimmerlingExposed,
  {},
  {},
  {},
  {},
  {},
  { start: () => void; end: () => void }
>;
export default Shimmerling;
