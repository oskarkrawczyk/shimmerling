/*
  React wrapper for Shimmerling (React 19).

    <Shimmerling>…</Shimmerling>                           plays on click anywhere in it, from the pointer
    <Shimmerling trigger="button">…</Shimmerling>          plays when a matching element is clicked
    <Shimmerling trigger={buttonRef}>…</Shimmerling>       plays when that element is clicked
    <Shimmerling trigger={false} ref={r}>…</Shimmerling>   plays only from r.current.play()

  Props: as (default 'div'), trigger, colors, onStart, onEnd; the rest go to the element.
  ref gets { element, play(from) }. See core.js for from and colors.
*/
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createShimmerling } from './core.js';

export function Shimmerling({ as: Tag = 'div', trigger, colors, onStart, onEnd, className, children, ref, ...rest }) {
  const hostRef = useRef(null);
  const inst = useRef(null);
  const [isStatic, setStatic] = useState(false);

  // ref objects are read at click time, so a trigger rendered later still works
  const options = {
    trigger: trigger === null ? undefined : (trigger && typeof trigger === 'object' && 'current' in trigger) ? () => trigger.current : trigger,
    colors, onStart, onEnd,
  };

  useLayoutEffect(() => {
    const s = inst.current = createShimmerling(hostRef.current, options);
    setStatic(s.isStatic);
    return () => { s.destroy(); inst.current = null; };
  }, [Tag]);

  useLayoutEffect(() => { inst.current?.update(options); });

  useImperativeHandle(ref, () => ({
    get element() { return hostRef.current; },
    play: from => inst.current ? inst.current.play(from) : Promise.resolve(),
  }), []);

  return (
    <Tag {...rest} ref={hostRef} className={['shimmerling', isStatic && 'shimmerling-static', className].filter(Boolean).join(' ')}>
      {children}
      <span className="shimmerling-layer" aria-hidden="true" />
    </Tag>
  );
}

export default Shimmerling;
