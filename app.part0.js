import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const DEFAULTS = {
  playfabTitle: '164E0A',
  photonRealtime: '45b1dd1e-3c30-4f22-99b3-9f169625e7c9',
  photonChat: '0d2bdce2-f187-4b17-9fdd-5c22ace39794',
  photonRegion: 'us',
  displayName: 'Player' + Math.floor(Math.random() * 9000 + 1000),
  avatarSex: 'male',
  friends: [],
  games: [
    { id: 'playground', name: 'Playground', desc: 'Default exploration map with jump pads.', players: 0, official: true }
  ]
};

const LS = {
  get(k, fallback) {
    try { const v = localStorage.getItem('vortoria_' + k); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(k, v) { localStorage.setItem('vortoria_' + k, JSON.stringify(v)); }
};

function loadConfig() {
  return {
    playfabTitle: LS.get('playfabTitle', DEFAULTS.playfabTitle),
    photonRealtime: LS.get('photonRealtime', DEFAULTS.photonRealtime),
    photonChat: LS.get('photonChat', DEFAULTS.photonChat),
    photonRegion: LS.get('photonRegion', DEFAULTS.photonRegion),
    displayName: LS.get('displayName', DEFAULTS.displayName),
    avatarSex: LS.get('avatarSex', DEFAULTS.avatarSex),
    friends: LS.get('friends', []),
    games: LS.get('games', DEFAULTS.games),
    studioDraft: LS.get('studioDraft', []),
    colors: LS.get('colors', { skin: '#e8c4a8', shirt: '#4a2a7a', pants: '#2a3a6e' })
  };
}
let cfg = loadConfig();

// --- Navigation ---
const views = document.querySelectorAll('.view');
document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});
document.querySelectorAll('[data-go]').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.go));
});
function showView(id) {
  views.forEach(v => v.classList.toggle('active', v.id === 'view-' + id));
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === id));
  if (id === 'games') renderGames();
  if (id === 'players') renderFriends();
  if (id === 'settings') fillSettings();
  if (id === 'studio') studio.redraw();
}

function fillSettings() {
  document.getElementById('playfabTitle').value = cfg.playfabTitle;
  document.getElementById('photonRealtime').value = cfg.photonRealtime;
  document.getElementById('photonChat').value = cfg.photonChat;
  document.getElementById('photonRegion').value = cfg.photonRegion;
  document.getElementById('avatarSex').value = cfg.avatarSex;
  document.getElementById('colSkin').value = cfg.colors.skin;
  document.getElementById('colShirt').value = cfg.colors.shirt;
  document.getElementById('colPants').value = cfg.colors.pants;
}
document.getElementById('displayName').value = cfg.displayName;
document.getElementById('userChip').textContent = cfg.displayName;

document.getElementById('saveServers').onclick = () => {
  cfg.playfabTitle = document.getElementById('playfabTitle').value.trim();
  cfg.photonRealtime = document.getElementById('photonRealtime').value.trim();
  cfg.photonChat = document.getElementById('photonChat').value.trim();
  cfg.photonRegion = document.getElementById('photonRegion').value;
  cfg.avatarSex = document.getElementById('avatarSex').value;
  cfg.colors = {
    skin: document.getElementById('colSkin').value,
    shirt: document.getElementById('colShirt').value,
    pants: document.getElementById('colPants').value
  };
  LS.set('playfabTitle', cfg.playfabTitle);
  LS.set('photonRealtime', cfg.photonRealtime);
  LS.set('photonChat', cfg.photonChat);
  LS.set('photonRegion', cfg.photonRegion);
  LS.set('avatarSex', cfg.avatarSex);
  LS.set('colors', cfg.colors);
  setServerStatus('Saved server config on this device.', 'ok');
};
document.getElementById('saveName').onclick = () => {
  cfg.displayName = (document.getElementById('displayName').value.trim() || 'Player').slice(0, 24);
  LS.set('displayName', cfg.displayName);
  document.getElementById('userChip').textContent = cfg.displayName;
};

function setServerStatus(msg, kind) {
  const el = document.getElementById('serverStatus');
  el.textContent = msg;
  el.className = 'status' + (kind ? ' ' + kind : '');
}

// Classic template clothing textures (data URLs in localStorage)
cfg.shirtTex = LS.get('shirtTex', null);
cfg.pantsTex = LS.get('pantsTex', null);
function updateClothStatus() {
  const el = document.getElementById('clothStatus');
  if (!el) return;
  const parts = [];
  if (cfg.shirtTex) parts.push('shirt');
  if (cfg.pantsTex) parts.push('pants');
  el.textContent = parts.length
    ? 'Custom textures ready: ' + parts.join(' + ') + '. They apply next time you Play.'
    : 'No custom textures — solid colors will be used.';
  el.className = 'status' + (parts.length ? ' ok' : '');
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
document.getElementById('shirtUpload')?.addEventListener('change', async (e) => {
  const f = e.target.files?.[0]; if (!f) return;
  cfg.shirtTex = await fileToDataUrl(f);
  LS.set('shirtTex', cfg.shirtTex);
  updateClothStatus();
});
document.getElementById('pantsUpload')?.addEventListener('change', async (e) => {
  const f = e.target.files?.[0]; if (!f) return;
  cfg.pantsTex = await fileToDataUrl(f);
  LS.set('pantsTex', cfg.pantsTex);
  updateClothStatus();
});
document.getElementById('clearClothTex')?.addEventListener('click', () => {
  cfg.shirtTex = null; cfg.pantsTex = null;
  LS.set('shirtTex', null); LS.set('pantsTex', null);
  updateClothStatus();
});
updateClothStatus();

// --- Friends ---
function renderFriends() {
  const ul = document.getElementById('friendList');
  ul.innerHTML = '';
  if (!cfg.friends.length) {
    ul.innerHTML = '<li><span style="color:var(--muted)">No friends yet</span></li>';
    return;
  }
  cfg.friends.forEach((name, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${escapeHtml(name)}</span>`;
    const rm = document.createElement('button');
    rm.className = 'btn danger';
    rm.style.padding = '4px 10px';
    rm.textContent = 'Remove';
    rm.onclick = () => {
      cfg.friends.splice(i, 1);
      LS.set('friends', cfg.friends);
      renderFriends();
    };
    li.appendChild(rm);
    ul.appendChild(li);
  });
}
document.getElementById('addFriend').onclick = () => {
  const name = document.getElementById('friendInput').value.trim().slice(0, 24);
  if (!name) return;
  if (!cfg.friends.includes(name)) cfg.friends.push(name);
  LS.set('friends', cfg.friends);
  document.getElementById('friendInput').value = '';
  renderFriends();
};
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// --- Games list ---
function renderGames() {
  const grid = document.getElementById('gamesGrid');
  grid.innerHTML = '';
  cfg.games.forEach(g => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span class="badge">${g.official ? 'Official' : 'Community'}</span>
      <h3>${escapeHtml(g.name)}</h3>
      <p>${escapeHtml(g.desc || '')}</p>
      <button class="btn" type="button">Join</button>
    `;
    card.querySelector('button').onclick = () => startPlay(g.id, g);
    grid.appendChild(card);
  });
}
document.getElementById('refreshGames').onclick = renderGames;
document.getElementById('joinPlayground').onclick = () => startPlay('playground');
document.getElementById('quickPlay').onclick = () => startPlay('playground');

// --- Studio (2D top-down block placer) ---
const studio = {
  blocks: [...(cfg.studioDraft || [])],
  canvas: document.getElementById('studio-canvas'),
  redraw() {
    const c = this.canvas;
    const parent = c.parentElement;
    c.width = parent.clientWidth * devicePixelRatio;
    c.height = parent.clientHeight * devicePixelRatio;
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = '#12182a';
    ctx.fillRect(0, 0, w, h);
    const cell = 32 * devicePixelRatio;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x < w; x += cell) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y < h; y += cell) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    for (const b of this.blocks) {
      ctx.fillStyle = '#3d4f8c';
      ctx.fillRect(b.x * cell, b.z * cell, cell, cell);
      ctx.strokeStyle = '#7cf0d0';
      ctx.strokeRect(b.x * cell, b.z * cell, cell, cell);
    }
  },
  addAt(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const cell = 32;
    const x = Math.floor((clientX - rect.left) / cell);
    const z = Math.floor((clientY - rect.top) / cell);
    if (this.blocks.some(b => b.x === x && b.z === z)) return;
    this.blocks.push({ x, z, y: 1 });
    this.redraw();
    document.getElementById('studioStatus').textContent = `Blocks: ${this.blocks.length}`;
  }
};
studio.canvas.addEventListener('click', (e) => studio.addAt(e.clientX, e.clientY));
document.getElementById('studioUndo').onclick = () => { studio.blocks.pop(); studio.redraw(); };
document.getElementById('studioClear').onclick = () => { studio.blocks = []; studio.redraw(); };
document.getElementById('studioSave').onclick = () => {
  cfg.studioDraft = studio.blocks;
  LS.set('studioDraft', studio.blocks);
