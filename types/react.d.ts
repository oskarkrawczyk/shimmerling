import type { ComponentPropsWithoutRef, ElementType, ReactNode, Ref, RefObject } from 'react';
import type { ShimmerlingColors, ShimmerlingFrom, ShimmerlingTrigger } from './index.js';

export type { ShimmerlingColors, ShimmerlingFrom, ShimmerlingTrigger } from './index.js';

export interface ShimmerlingHandle {
  readonly element: HTMLElement | null;
  play(from?: ShimmerlingFrom): Promise<void>;
}

export type ShimmerlingProps<T extends ElementType = 'div'> = {
  /** Element or component to render as the host. Default 'div'. */
  as?: T;
  /** What starts the wave. A ref object works too. Leave out to play on any click in the host. */
  trigger?: ShimmerlingTrigger | RefObject<Element | null>;
  colors?: ShimmerlingColors;
  onStart?: () => void;
  onEnd?: () => void;
  ref?: Ref<ShimmerlingHandle>;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'trigger' | 'colors' | 'onStart' | 'onEnd' | 'ref' | 'children'>;

export function Shimmerling<T extends ElementType = 'div'>(props: ShimmerlingProps<T>): ReactNode;
export default Shimmerling;
