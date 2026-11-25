/*
  Vue 3 wrapper for Shimmerling.

    <Shimmerling>…</Shimmerling>                           plays on click anywhere in it, from the pointer
    <Shimmerling trigger="button">…</Shimmerling>          plays when a matching element is clicked
    <Shimmerling :trigger="buttonRef">…</Shimmerling>      plays when that element (a template ref) is clicked
    <Shimmerling :trigger="false" ref="r">…</Shimmerling>  plays only from r.play()

  Props: as (default 'div'), trigger, colors. Events: start, end. Other attributes go to the element.
  A template ref gets { element, play(from) }. See core.js for from and colors.
*/
import { computed, defineComponent, h, isRef, onBeforeUnmount, shallowRef, watch, watchEffect } from 'vue';
import { createShimmerling } from './core.js';

// template refs arrive unwrapped and are null until the element mounts, so null means no trigger yet
const elementOf = t => (t && typeof t === 'object' && '$el' in t) ? t.$el : t;
const toTrigger = t => isRef(t) ? () => elementOf(t.value) : elementOf(t);

export const Shimmerling = defineComponent({
  name: 'Shimmerling',
  props: { as: { default: 'div' }, trigger: { default: undefined }, colors: { default: undefined } },
  emits: ['start', 'end'],
  setup(props, { slots, emit, expose }) {
    const host = shallowRef(null);
    const element = computed(() => elementOf(host.value));
    const inst = shallowRef(null);
    const isStatic = shallowRef(false);

    const options = () => ({ trigger: toTrigger(props.trigger), colors: props.colors, onStart: () => emit('start'), onEnd: () => emit('end') });

    // the host element is replaced when `as` changes
    watch(element, el => {
      inst.value?.destroy();
      inst.value = el ? createShimmerling(el, options()) : null;
      isStatic.value = !!inst.value?.isStatic;
    }, { flush: 'post' });
    watchEffect(() => inst.value?.update(options()));
    onBeforeUnmount(() => inst.value?.destroy());

    expose({ element, play: from => inst.value ? inst.value.play(from) : Promise.resolve() });

    return () => {
      const children = [slots.default?.(), h('span', { class: 'shimmerling-layer', 'aria-hidden': 'true' })];
      return h(props.as, { ref: host, class: ['shimmerling', isStatic.value && 'shimmerling-static'] },
        typeof props.as === 'string' ? children : { default: () => children });
    };
  },
});

export default Shimmerling;
