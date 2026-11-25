// Layout check: measure every box with the component's classes and layer taken out, then with them in.
// positions are relative to the case, so result lines filling in above don't count as movement
function measure(root) {
  const o = root.getBoundingClientRect();
  return [root, ...root.querySelectorAll('*:not(.shimmerling-layer, .shimmerling-layer *)')].map(el => {
    const r = el.getBoundingClientRect();
    return [r.x - o.x, r.y - o.y, r.width, r.height].map(n => n.toFixed(2)).join(',');
  });
}

export function checkLayout(root) {
  const hosts = [...root.querySelectorAll('.shimmerling')];
  const layers = [...root.querySelectorAll('.shimmerling-layer')];
  const after = measure(root), posAfter = hosts.map(h => getComputedStyle(h).position);

  const classes = hosts.map(h => h.className);
  hosts.forEach(h => h.classList.remove('shimmerling', 'shimmerling-static'));
  layers.forEach(l => { l.style.display = 'none'; });
  const before = measure(root), posBefore = hosts.map(h => getComputedStyle(h).position);
  hosts.forEach((h, i) => { h.className = classes[i]; });
  layers.forEach(l => { l.style.display = ''; });

  const moved = before.filter((v, i) => v !== after[i]).length;
  const pos = [...new Set(hosts.map((_, i) => posBefore[i] === posAfter[i] ? `${posAfter[i]} (kept)` : `${posBefore[i]} → ${posAfter[i]}`))].join(', ');
  return moved
    ? { ok: false, text: `${moved} of ${before.length} boxes moved or resized by the component · host position: ${pos}` }
    : { ok: true, text: `Layout unchanged · ${before.length} boxes measured · host position: ${pos}` };
}
