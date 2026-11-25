import '../demo.css';
import { createShimmerling } from '../../src/shimmerling/index.js';
import { PALETTES } from '../palettes.js';

createShimmerling(document.getElementById('plain'));
createShimmerling(document.getElementById('ember'), { trigger: '#ember-go', colors: PALETTES.Ember });
const code = createShimmerling(document.getElementById('code'), { trigger: false, onEnd: () => console.log('code: ended') });
document.getElementById('code-play').onclick = () => code.play('top');
document.getElementById('code-destroy').onclick = () => code.destroy();
