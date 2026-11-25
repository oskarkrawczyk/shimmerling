<script setup>
import { nextTick, ref, useTemplateRef, watchEffect } from 'vue';
import { Shimmerling } from '../../src/shimmerling/vue.js';
import { PALETTES } from '../palettes.js';
import Case from './Case.vue';

const slow = ref(false);
watchEffect(() => document.body.classList.toggle('slow', slow.value));

const published = ref(false);
const clicks = ref(0);
const banner = useTemplateRef('banner');
const refresh = useTemplateRef('refresh');
const palette = ref('Default');
const palettePanel = useTemplateRef('palettePanel');
const pickPalette = async name => {
  palette.value = name;
  await nextTick();
  palettePanel.value.play('center');
};

const alt = ref(false);
const tag = ref('div');
const shown = ref(true);
</script>

<template>
  <main>
    <header>
      <div>
        <h1>Shimmerling test cases · Vue</h1>
        <p>Click any host. The wave starts where you click; keyboard activation starts from the centre.</p>
      </div>
      <div class="tools">
        <a href="/">React</a>
        <a href="/vanilla.html">Plain JS</a>
        <label><input type="checkbox" v-model="slow" /> Slow motion</label>
      </div>
    </header>

    <div class="cases">
      <Case title="1 · Card with a state change">
        Only the button triggers it (<code>trigger="button"</code>). Content swaps on <code>@start</code>.
        <template #demo>
          <Shimmerling class="card" trigger="button" @start="published = !published">
            <div class="states">
              <div :class="['state', !published && 'is-current']">
                <div class="badge">↑</div>
                <div class="muted">Publishing to production</div>
                <div class="big">v4.12.0</div>
                <div class="rows"><div><span>Branch</span><span>main</span></div><div><span>Finishes</span><span>In seconds</span></div></div>
              </div>
              <div :class="['state', published && 'is-current']">
                <div class="badge ok">✓</div>
                <div class="muted">Published to production</div>
                <div class="big">v4.12.0</div>
                <div class="rows"><div><span>Branch</span><span>main</span></div><div><span>Finished</span><span>9:41 AM</span></div></div>
              </div>
            </div>
            <button>Confirm</button>
          </Shimmerling>
        </template>
      </Case>

      <Case title="2 · Buttons, changing text, opting out">
        <code>as="button"</code>. The second host's only child is text that changes on every click; the third calls <code>preventDefault()</code>.
        <template #demo>
          <div class="buttons">
            <Shimmerling as="button" class="btn-dark">⇅ Sync 248 files</Shimmerling>
            <Shimmerling as="button" class="btn-dark" @click="clicks++">Clicked {{ clicks }} times</Shimmerling>
            <Shimmerling as="button" class="btn-dark small" @click="e => e.preventDefault()">No wave</Shimmerling>
          </div>
        </template>
      </Case>

      <Case title="3 · Grid container, blue palette">
        Colours come from the <code>colors</code> prop.
        <template #demo>
          <Shimmerling class="stats" :colors="PALETTES.Blue">
            <div><span class="muted">Requests</span><b>1.2M</b></div>
            <div><span class="muted">p95</span><b>184ms</b></div>
            <div><span class="muted">Errors</span><b>0.02%</b></div>
            <div><span class="muted">Regions</span><b>6</b></div>
            <div><span class="muted">Uptime</span><b>99.99%</b></div>
            <div><span class="muted">Deploys</span><b>14</b></div>
          </Shimmerling>
        </template>
      </Case>

      <Case title="4 · Played from code">
        <code>:trigger="false"</code> ignores clicks; buttons call <code>play(from)</code> on the template ref.
        <template #demo>
          <Shimmerling ref="banner" class="banner" :trigger="false">
            <h3>Your plan was upgraded</h3>
            <p>Pro features are now available across the workspace.</p>
          </Shimmerling>
          <div class="controls">
            <button v-for="from in ['top', 'left', 'center', 'bottom']" :key="from" class="ghost" @click="banner.play(from)">From {{ from === 'center' ? 'centre' : from }}</button>
          </div>
        </template>
      </Case>

      <Case title="5 · Trigger outside the host">
        The button is a template ref outside the panel (<code>:trigger="refresh"</code>).
        <template #demo>
          <Shimmerling class="panel" :trigger="refresh">
            <div class="muted">Monthly report</div>
            <b>Ready to refresh</b>
          </Shimmerling>
          <div class="controls"><button ref="refresh" class="ghost">Refresh report</button></div>
        </template>
      </Case>

      <Case title="6 · Colours">
        Picking a palette sets the <code>colors</code> prop and plays the wave.
        <template #demo>
          <Shimmerling ref="palettePanel" class="panel glow-demo" :trigger="false" :colors="PALETTES[palette]">
            <div class="muted">Palette</div>
            <b>{{ palette }}</b>
          </Shimmerling>
          <div class="controls">
            <button v-for="name in Object.keys(PALETTES)" :key="name" class="ghost" :aria-pressed="palette === name" @click="pickPalette(name)">{{ name }}</button>
          </div>
        </template>
      </Case>

      <Case title="7 · Class, tag and mount changes">
        Changing the host's class or tag, or unmounting it, must keep the wave working or clean it up.
        <template #demo>
          <Shimmerling v-if="shown" :as="tag" :class="['panel', alt && 'glow-demo']" id="lifecycle">
            <div class="muted">&lt;{{ tag }}&gt;{{ alt ? ' · alt class' : '' }}</div>
            <b>Click me</b>
          </Shimmerling>
          <div class="controls">
            <button class="ghost" @click="alt = !alt">Toggle class</button>
            <button class="ghost" @click="tag = tag === 'div' ? 'section' : 'div'">Toggle tag</button>
            <button class="ghost" @click="shown = !shown">{{ shown ? 'Unmount' : 'Mount' }}</button>
          </div>
        </template>
      </Case>
    </div>
  </main>
</template>
