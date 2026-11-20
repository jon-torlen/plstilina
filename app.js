/* =========================================================
   Dashboard de música — interactividad con JavaScript puro
   ========================================================= */

const SVG_NS = 'http://www.w3.org/2000/svg';
const svgEl = (name, attrs = {}) => {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
};

/* ---------- Tooltip ---------- */
const tooltip = document.getElementById('tooltip');
const showTip = (event, text) => {
  tooltip.textContent = text;
  tooltip.classList.add('visible');
  moveTip(event);
};
const moveTip = (event) => {
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY - 12}px`;
};
const hideTip = () => tooltip.classList.remove('visible');

/* ---------- Gráfico de barras ---------- */
const weekData = {
  'Esta semana': [2.6, 3.4, 3.0, 4.4, 2.8, 3.9, 3.2],
  'Semana pasada': [2.2, 2.8, 3.6, 3.0, 4.0, 2.6, 3.4]
};
const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const barColors = ['#bda7ed', '#f4a7ae', '#f6cf83', '#a9d5c3', '#b6a7e8', '#9fc9f0', '#c9b0ec'];

function drawBars(period) {
  const svg = document.getElementById('bars');
  svg.textContent = '';

  const base = 180;
  const top = 20;
  const scale = (base - top) / 6;

  [0, 2, 4, 6].forEach((hour) => {
    const y = base - hour * scale;
    svg.appendChild(svgEl('line', { x1: 34, x2: 474, y1: y, y2: y, class: 'grid-line' }));
    const label = svgEl('text', { x: 26, y: y + 3, 'text-anchor': 'end', class: 'axis-label' });
    label.textContent = hour === 0 ? '0' : `${hour}h`;
    svg.appendChild(label);
  });

  days.forEach((day, index) => {
    const value = weekData[period][index];
    const height = value * scale;
    const x = 54 + index * 62;
    const bar = svgEl('rect', {
      x, y: base - height, width: 26, height,
      rx: 13, fill: barColors[index], class: 'bar'
    });
    bar.addEventListener('mouseenter', (event) => showTip(event, `${day}: ${value.toFixed(1)}h`));
    bar.addEventListener('mousemove', moveTip);
    bar.addEventListener('mouseleave', hideTip);
    svg.appendChild(bar);

    const label = svgEl('text', { x: x + 13, y: 202, 'text-anchor': 'middle', class: 'axis-label' });
    label.textContent = day;
    svg.appendChild(label);
  });
}

/* ---------- Gráfico de dona ---------- */
const genres = [
  { name: 'Calma', pct: 45, color: '#a892e5' },
  { name: 'Sueño', pct: 25, color: '#f3a3ac' },
  { name: 'Enfoque', pct: 15, color: '#f6cf80' },
  { name: 'Respiración', pct: 10, color: '#a8d6b0' },
  { name: 'Otros', pct: 5, color: '#9dc6ee' }
];

function drawDonut() {
  const svg = document.getElementById('donut');
  const legend = document.getElementById('legend');
  svg.textContent = '';
  legend.textContent = '';

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  genres.forEach((genre) => {
    const length = circumference * genre.pct / 100;
    const gap = 3;
    const segment = svgEl('circle', {
      cx: 100, cy: 100, r: radius,
      fill: 'none',
      stroke: genre.color,
      'stroke-width': 28,
      'stroke-dasharray': `${length - gap} ${circumference - length + gap}`,
      'stroke-dashoffset': -offset,
      transform: 'rotate(-90 100 100)',
      class: 'donut-seg'
    });
    segment.addEventListener('mouseenter', (event) => showTip(event, `${genre.name}: ${genre.pct}%`));
    segment.addEventListener('mousemove', moveTip);
    segment.addEventListener('mouseleave', hideTip);
    svg.appendChild(segment);
    offset += length;

    const item = document.createElement('li');
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = genre.color;
    const name = document.createElement('span');
    name.textContent = genre.name;
    const pct = document.createElement('span');
    pct.className = 'pct';
    pct.textContent = `${genre.pct}%`;
    item.append(dot, name, pct);
    legend.appendChild(item);
  });
}

/* ---------- Música ambiental libre generada con Web Audio API ---------- */
class AmbientAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.filter = null;
    this.convolver = null;
    this.voices = [];
    this.arpTimer = null;
    this.config = null;
    this.playing = false;
    this.step = 0;
  }

  ensureContext() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 950;
    this.filter.Q.value = 0.4;
    this.filter.connect(this.master);

    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = this.impulse(2.8, 2.4);
    const wet = this.ctx.createGain();
    wet.gain.value = 0.3;
    this.convolver.connect(wet);
    wet.connect(this.master);
  }

  impulse(duration, decay) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  freq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  start(config) {
    this.ensureContext();
    if (!this.ctx) return;
    this.stop();
    this.config = config;
    this.ctx.resume();
    this.playing = true;
    this.step = 0;
    const now = this.ctx.currentTime;

    config.chords[0].forEach((midi, index) => {
      const osc = this.ctx.createOscillator();
      osc.type = index % 2 ? 'sine' : 'triangle';
      osc.frequency.value = this.freq(midi);
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(config.padGain, now + 2);
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.05 + index * 0.012;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = config.padGain * 0.5;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      gain.connect(this.filter);
      gain.connect(this.convolver);
      lfo.start();
      osc.start();
      this.voices.push({ osc, gain, lfo, lfoGain });
    });

    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(0, now);
    this.master.gain.linearRampToValueAtTime(0.85, now + 1.5);
    this.scheduleArpeggio();
  }

  scheduleArpeggio() {
    clearInterval(this.arpTimer);
    this.arpTimer = setInterval(() => {
      if (!this.playing || !this.ctx || this.ctx.state !== 'running') return;
      const chord = this.config.chords[Math.floor(this.step / 4) % this.config.chords.length];
      const midi = chord[this.step % chord.length] + (this.step % 8 < 4 ? 12 : 0);
      this.pluck(midi);
      this.step++;
    }, this.config.interval);
  }

  pluck(midi) {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = this.freq(midi);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(this.config.pluckGain, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
    osc.connect(gain);
    gain.connect(this.filter);
    gain.connect(this.convolver);
    osc.start(now);
    osc.stop(now + 2.7);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  pause() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    clearInterval(this.arpTimer);
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.4);
    setTimeout(() => { if (!this.playing && this.ctx) this.ctx.suspend(); }, 450);
  }

  resume() {
    if (!this.ctx || this.playing) return;
    this.ctx.resume();
    this.playing = true;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.85, now + 0.6);
    this.scheduleArpeggio();
  }

  stop() {
    clearInterval(this.arpTimer);
    this.playing = false;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.25);
    const voices = this.voices;
    this.voices = [];
    setTimeout(() => {
      voices.forEach((v) => {
        try { v.osc.stop(); v.lfo.stop(); } catch (e) {}
        v.osc.disconnect(); v.gain.disconnect(); v.lfo.disconnect(); v.lfoGain.disconnect();
      });
    }, 300);
  }
}

const ambientConfigs = {
  default: { chords: [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]], interval: 1200, padGain: 0.045, pluckGain: 0.05 },
  'Sunset Drive': { chords: [[57, 60, 64, 69], [55, 59, 62, 67], [53, 57, 60, 65], [52, 55, 59, 64]], interval: 1350, padGain: 0.042, pluckGain: 0.055 },
  'Golden Hour': { chords: [[60, 64, 67, 71], [57, 60, 64, 67], [55, 59, 62, 66], [53, 57, 60, 64]], interval: 1250, padGain: 0.04, pluckGain: 0.05 },
  'Coffee Shop': { chords: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], interval: 1400, padGain: 0.046, pluckGain: 0.045 },
  'Chill Mibes': { chords: [[55, 59, 62, 65], [53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60]], interval: 1300, padGain: 0.045, pluckGain: 0.05 }
};

const audio = new AmbientAudio();
window.ambientAudio = audio;

/* ---------- Mini player ---------- */
const player = document.getElementById('player');
const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerToggle = document.getElementById('playerToggle');
const progressFill = document.getElementById('progressFill');

let progress = 0;
let isPlaying = true;
let playerTimer = null;

function setPlayerIcon(playing) {
  playerToggle.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play');
  playerToggle.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
}

function openPlayer(title, artist, cover) {
  player.hidden = false;
  playerTitle.textContent = title;
  playerArtist.textContent = artist;
  playerCover.src = cover || 'assets/avatar-ana.png';
  progress = 0;
  isPlaying = true;
  progressFill.style.width = '0%';
  setPlayerIcon(true);

  audio.start(ambientConfigs[title] || ambientConfigs.default);

  clearInterval(playerTimer);
  playerTimer = setInterval(() => {
    if (!isPlaying) return;
    progress = (progress + 0.25) % 100;
    progressFill.style.width = `${progress}%`;
  }, 250);
}

playerToggle.addEventListener('click', () => {
  isPlaying = !isPlaying;
  setPlayerIcon(isPlaying);
  if (isPlaying) audio.resume(); else audio.pause();
});

/* ---------- Navegación lateral ---------- */
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');
navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((other) => other.classList.remove('active'));
    item.classList.add('active');
    pageTitle.textContent = item.dataset.section;
  });
});

/* ---------- Selector de periodo ---------- */
const weekSelect = document.getElementById('weekSelect');
const weekLabel = document.getElementById('weekLabel');
let currentPeriod = 'Esta semana';
weekSelect.addEventListener('click', () => {
  currentPeriod = currentPeriod === 'Esta semana' ? 'Semana pasada' : 'Esta semana';
  weekLabel.textContent = currentPeriod;
  drawBars(currentPeriod);
});

/* ---------- Búsqueda en vivo ---------- */
const search = document.getElementById('search');
const songs = document.querySelectorAll('.song');
const mixCard = document.querySelector('.mix-card');

search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();

  songs.forEach((song) => {
    const matches = query !== '' &&
      `${song.dataset.title} ${song.dataset.artist}`.toLowerCase().includes(query);
    song.style.display = matches || query === '' ? '' : 'none';
    song.classList.toggle('is-match', matches);
  });

  const mixMatches = query !== '' &&
    `${mixCard.dataset.title} ${mixCard.dataset.artist}`.toLowerCase().includes(query);
  mixCard.classList.toggle('is-match', mixMatches);
});

/* ---------- Botones de reproducción ---------- */
document.querySelectorAll('.song .play-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const song = button.closest('.song');
    openPlayer(song.dataset.title, song.dataset.artist, song.querySelector('img').src);
  });
});

document.querySelector('.mix-play').addEventListener('click', () => {
  openPlayer(mixCard.dataset.title, mixCard.dataset.artist, mixCard.dataset.cover);
});

document.querySelectorAll('button[data-title]').forEach((button) => {
  button.addEventListener('click', () => {
    openPlayer(button.dataset.title, button.dataset.artist, button.dataset.cover);
  });
});

/* ---------- Detalles menores ---------- */
document.getElementById('bell').addEventListener('click', (event) => {
  const badge = event.currentTarget.querySelector('.badge');
  badge.hidden = !badge.hidden;
});

document.querySelectorAll('.see-all').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});

/* ---------- Inicialización ---------- */
drawBars(currentPeriod);
drawDonut();
