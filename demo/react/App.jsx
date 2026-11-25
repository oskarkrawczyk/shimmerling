import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Shimmerling } from '../../src/shimmerling/react.jsx';
import { checkLayout } from '../layout-check.js';
import { PALETTES } from '../palettes.js';

function Case({ title, children, demo }) {
  const body = useRef(null);
  const [result, setResult] = useState(null);
  useEffect(() => {
    let live = true;
    document.fonts.ready.then(() => setTimeout(() => live && setResult(checkLayout(body.current))));
    return () => { live = false; };
  }, []);
  return (
    <section className="case">
      <h2>{title}</h2>
      <p>{children}</p>
      <div ref={body}>{demo}</div>
      <div className={`check ${result ? (result.ok ? 'ok' : 'bad') : ''}`}>{result?.text}</div>
    </section>
  );
}

export default function App() {
  const [slow, setSlow] = useState(false);
  const [published, setPublished] = useState(false);
  const [glow, setGlow] = useState(2.4);
  const [clicks, setClicks] = useState(0);

  const all = useRef(new Set());
  const collect = h => { all.current.add(h); return () => all.current.delete(h); };
  const keep = r => h => { r.current = h; all.current.add(h); return () => { r.current = null; all.current.delete(h); }; };

  const card = useRef(null), cardButton = useRef(null);
  const banner = useRef(null);
  const refresh = useRef(null);
  const glowPlay = useRef(null);
  const palettePanel = useRef(null);
  const [palette, setPalette] = useState('Default');

  useEffect(() => { document.body.classList.toggle('slow', slow); }, [slow]);
  // render the new colours first, then play
  const pickPalette = name => { flushSync(() => setPalette(name)); palettePanel.current.play('center'); };

  const playAll = () => {
    for (const h of all.current) h.play(h === card.current ? cardButton.current : 'center');
  };

  return (
    <main>
      <header>
        <div>
          <h1>Shimmerling test cases</h1>
          <p>Click any host. The wave starts where you click; keyboard activation starts from the centre.</p>
        </div>
        <div className="tools">
          <a href="/vue.html">Vue</a>
          <a href="/vanilla.html">Plain JS</a>
          <label><input type="checkbox" checked={slow} onChange={e => setSlow(e.target.checked)} /> Slow motion</label>
          <button className="ghost" onClick={playAll}>Play all</button>
        </div>
      </header>

      <div className="cases">
        <Case title="1 · Card with a state change" demo={
          <Shimmerling className="card" trigger="button" ref={keep(card)} onStart={() => setPublished(p => !p)}>
            <div className="states">
              <div className={`state ${published ? '' : 'is-current'}`}>
                <div className="badge">↑</div>
                <div className="muted">Publishing to production</div>
                <div className="big">v4.12.0</div>
                <div className="rows">
                  <div><span>Branch</span><span>main</span></div>
                  <div><span>Finishes</span><span>In seconds</span></div>
                </div>
              </div>
              <div className={`state ${published ? 'is-current' : ''}`}>
                <div className="badge ok">✓</div>
                <div className="muted">Published to production</div>
                <div className="big">v4.12.0</div>
                <div className="rows">
                  <div><span>Branch</span><span>main</span></div>
                  <div><span>Finished</span><span>9:41 AM</span></div>
                </div>
              </div>
            </div>
            <button ref={cardButton}>Confirm</button>
          </Shimmerling>
        }>
          Only the button triggers it (<code>trigger="button"</code>). Content swaps in <code>onStart</code>.
        </Case>

        <Case title="2 · Buttons as hosts" demo={
          <div className="buttons">
            <Shimmerling as="button" className="btn-dark" ref={collect}>⇅ Sync 248 files</Shimmerling>
            <Shimmerling as="button" className="btn-dark small" ref={collect}>Retry</Shimmerling>
            <Shimmerling as="button" className="btn-dark" ref={collect} style={{ borderRadius: 10 }}>Square corners</Shimmerling>
          </div>
        }>
          <code>as="button"</code>, inline-flex, small sizes. Rim and warp scale down with the host.
        </Case>

        <Case title="3 · Flex list rows, custom palette" demo={
          <ul className="list">
            <Shimmerling as="li" ref={collect}><span className="icon">✉</span><span className="text"><b>Invoice sent</b><span className="meta">To Northwind · $2,400</span></span><span className="meta">now</span></Shimmerling>
            <Shimmerling as="li" ref={collect}><span className="icon">⚑</span><span className="text"><b>Review requested</b><span className="meta">Design system v2</span></span><span className="meta">2m</span></Shimmerling>
            <Shimmerling as="li" ref={collect}><span className="icon">✓</span><span className="text"><b>Checks passed</b><span className="meta">18 of 18</span></span><span className="meta">5m</span></Shimmerling>
          </ul>
        }>
          Each row is a host; colours come from <code>--shimmerling-*</code> on the row.
        </Case>

        <Case title="4 · Grid container, blue palette" demo={
          <Shimmerling className="stats" ref={collect} colors={PALETTES.Blue}>
            <div><span className="muted">Requests</span><b>1.2M</b></div>
            <div><span className="muted">p95</span><b>184ms</b></div>
            <div><span className="muted">Errors</span><b>0.02%</b></div>
            <div><span className="muted">Regions</span><b>6</b></div>
            <div><span className="muted">Uptime</span><b>99.99%</b></div>
            <div><span className="muted">Deploys</span><b>14</b></div>
          </Shimmerling>
        }>
          The layer is absolutely positioned, so it never takes a grid cell. Colours come from the <code>colors</code> prop.
        </Case>

        <Case title="5 · Host that is already positioned" demo={
          <div className="frame">
            <Shimmerling className="toast" ref={collect}>
              <span className="badge ok" style={{ margin: 0, width: 32, height: 32, fontSize: 14 }}>✓</span>
              <span><b style={{ fontWeight: 600 }}>Saved</b><br /><span className="muted">All changes synced</span></span>
            </Shimmerling>
          </div>
        }>
          The toast is <code>position: absolute</code>; the component leaves that alone.
        </Case>

        <Case title="6 · Played from code" demo={<>
          <Shimmerling className="banner" trigger={false} ref={keep(banner)}>
            <h3>Your plan was upgraded</h3>
            <p>Pro features are now available across the workspace.</p>
          </Shimmerling>
          <div className="controls">
            {['top', 'left', 'center', 'bottom'].map(from => (
              <button key={from} className="ghost" onClick={() => banner.current.play(from)}>From {from === 'center' ? 'centre' : from}</button>
            ))}
          </div>
        </>}>
          <code>trigger=&#123;false&#125;</code> ignores clicks; buttons call <code>ref.current.play(from)</code>.
        </Case>

        <Case title="7 · Thick border, trigger outside the host" demo={<>
          <Shimmerling className="panel" trigger={refresh} ref={collect}>
            <div className="muted">Monthly report</div>
            <b>Ready to refresh</b>
          </Shimmerling>
          <div className="controls"><button className="ghost" ref={refresh}>Refresh report</button></div>
        </>}>
          The wave covers the 6px border; the button lives outside the panel (<code>trigger=&#123;refreshRef&#125;</code>).
        </Case>

        <Case title="8 · Border glow duration" demo={<>
          <Shimmerling className="panel glow-demo" trigger={glowPlay} ref={collect} style={{ '--shimmerling-glow': `${glow}s` }}>
            <div className="muted">Border glow</div>
            <b>{glow}s</b>
          </Shimmerling>
          <div className="controls">
            <input type="range" min="0.6" max="12" step="0.2" value={glow} onChange={e => setGlow(+e.target.value)} aria-label="Border glow duration in seconds" />
            <button className="ghost" ref={glowPlay}>Play</button>
          </div>
        </>}>
          Sets <code>--shimmerling-glow</code> on the host. The glow turns at the same speed and fades over the last <code>--shimmerling-glow-fade</code>.
        </Case>

        <Case title="9 · Colours" demo={<>
          <Shimmerling className="panel glow-demo" trigger={false} ref={keep(palettePanel)} colors={PALETTES[palette]}>
            <div className="muted">Palette</div>
            <b>{palette}</b>
          </Shimmerling>
          <div className="controls">
            {Object.keys(PALETTES).map(name => (
              <button key={name} className="ghost" aria-pressed={palette === name} onClick={() => pickPalette(name)}>{name}</button>
            ))}
          </div>
        </>}>
          Picking a palette sets the <code>colors</code> prop and plays the wave.
        </Case>
        <Case title="10 · Changing text, opting out" demo={
          <div className="buttons">
            <Shimmerling as="button" className="btn-dark" ref={collect} onClick={() => setClicks(n => n + 1)}>{`Clicked ${clicks} times`}</Shimmerling>
            <Shimmerling as="button" className="btn-dark" ref={collect} onClick={e => e.preventDefault()}>No wave</Shimmerling>
          </div>
        }>
          The first host's only child is text that changes on every click. The second calls <code>e.preventDefault()</code> in its <code>onClick</code>.
        </Case>
      </div>
    </main>
  );
}
