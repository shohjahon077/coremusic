const state = {
  token: localStorage.getItem('coremusic-token') || '',
  search: '',
  filter: 'all',
  favorites: JSON.parse(localStorage.getItem('coremusic-favorites') || '[]'),
  currentTrack: null,
  audio: null,
  tracks: []
};

const els = {
  trackList: document.getElementById('trackList'),
  favoritesList: document.getElementById('favoritesList'),
  recentList: document.getElementById('recentList'),
  featuredStats: document.getElementById('featuredStats'),
  loginBtn: document.getElementById('loginBtn'),
  signupBtn: document.getElementById('signupBtn'),
  mainPlayBtn: document.getElementById('mainPlay'),
  joinHeroBtn: document.getElementById('joinHero'),
  authModal: document.getElementById('authModal'),
  authForm: document.getElementById('authForm'),
  authTitle: document.getElementById('authTitle'),
  tabs: document.querySelectorAll('.tab'),
  searchInput: document.getElementById('searchInput'),
  chips: document.querySelectorAll('.chip'),
  toast: document.getElementById('toast'),
  nowTitle: document.getElementById('nowTitle'),
  nowArtist: document.getElementById('nowArtist'),
  playToggle: document.getElementById('playToggle'),
  progressBar: document.getElementById('progressBar'),
  timeCurrent: document.getElementById('timeCurrent'),
  timeTotal: document.getElementById('timeTotal'),
  volumeInput: document.getElementById('volume'),
  playerBar: document.getElementById('playerBar')
};

const demoTracks = [
  { id: 'm1', title: 'Первый раз', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Energetic', duration: '3:18', cover: '🎵', color: 'linear-gradient(135deg,#7C3AED,#22D3EE)', audio: '/audio/MORGENSHTERN%20-%20%D0%9F%D0%B5%D1%80%D0%B2%D1%8B%D0%B9%20%D1%80%D0%B0%D0%B7.mp3' },
  { id: 'm2', title: 'Группа крови', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Dark', duration: '3:45', cover: '🎧', color: 'linear-gradient(135deg,#EF4444,#F59E0B)', audio: '/audio/MORGENSHTERN-%D0%93%D1%80%D1%83%D0%BF%D0%B0%20%D0%BA%D1%80%D0%BE%D0%B2%D0%B8.mp3' },
  { id: 'm3', title: '12', artist: 'Morgenshtern', genre: 'Rap', mood: 'Focus', duration: '2:56', cover: '🔥', color: 'linear-gradient(135deg,#10B981,#0EA5E9)', audio: '/audio/Morgenshtern%20-%2012.mp3' },
  { id: 'n1', title: 'Midnight Echo', artist: 'Nova Lane', genre: 'Electronic', mood: 'Night', duration: '4:12', cover: '🌙', color: 'linear-gradient(135deg,#0F172A,#334155)', audio: '/audio/placeholder-1.mp3' },
  { id: 'n2', title: 'Aurora Drift', artist: 'Luma', genre: 'Synthwave', mood: 'Chill', duration: '3:54', cover: '✨', color: 'linear-gradient(135deg,#EC4899,#8B5CF6)', audio: '/audio/placeholder-2.mp3' },
  { id: 'n3', title: 'City Lights', artist: 'Kairo', genre: 'Pop', mood: 'Vibes', duration: '4:06', cover: '🌃', color: 'linear-gradient(135deg,#F97316,#FBBF24)', audio: '/audio/placeholder-3.mp3' },
  { id: 'l1', title: 'Skyline', artist: 'Avi', genre: 'Electronic', mood: 'Travel', duration: '3:21', cover: '🚀', color: 'linear-gradient(135deg,#0EA5E9,#38BDF8)', audio: '/audio/placeholder-4.mp3' },
  { id: 'l2', title: 'Golden Hour', artist: 'Mira', genre: 'Pop', mood: 'Mood', duration: '3:08', cover: '☀️', color: 'linear-gradient(135deg,#F59E0B,#FCD34D)', audio: '/audio/placeholder-5.mp3' }
];

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => els.toast.classList.remove('show'), 1800);
}

async function loadTracks() {
  const params = new URLSearchParams({ q: state.search, genre: state.filter });
  const res = await fetch(`/api/tracks?${params.toString()}`);
  state.tracks = await res.json();
  renderTracks();
}

async function initFeaturedStats() {
  const res = await fetch('/api/featured');
  const data = await res.json();
  els.featuredStats.innerHTML = `
    <div class="stat"><strong>${data.totalTracks}</strong><span>Tracks</span></div>
    <div class="stat"><strong>${data.totalGenres}</strong><span>Genres</span></div>
    <div class="stat"><strong>${data.latest.length}</strong><span>Fresh picks</span></div>
  `;
}

function renderTracks() {
  if (!state.tracks.length) {
    els.trackList.innerHTML = '<div class="empty">No tracks found.</div>';
    return;
  }

  els.trackList.innerHTML = state.tracks.map((track) => {
    const isFav = state.favorites.includes(track.id);
    return `
      <article class="track-card">
        <div class="card-cover" style="background:${track.color};">${track.cover}</div>
        <div class="body">
          <div class="track-topline">
            <h3>${escapeHtml(track.title)}</h3>
            <button class="icon-btn favorite ${isFav ? 'active' : ''}" data-favorite="${track.id}" aria-label="Toggle favorite">♥</button>
          </div>
          <div class="artist">${escapeHtml(track.artist)}</div>
          <div class="meta-row">
            <span>${escapeHtml(track.genre)}</span>
            <span>${escapeHtml(track.duration)}</span>
          </div>
          <div class="card-actions">
            <button class="play-btn" data-play="${track.id}">Play</button>
            <button class="icon-btn" data-preview="${track.id}" aria-label="Preview">▶</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  els.trackList.querySelectorAll('[data-play]').forEach((btn) => {
    btn.addEventListener('click', () => playTrack(btn.dataset.play));
  });

  els.trackList.querySelectorAll('[data-preview]').forEach((btn) => {
    btn.addEventListener('click', () => previewTrack(btn.dataset.preview));
  });

  els.trackList.querySelectorAll('[data-favorite]').forEach((btn) => {
    btn.addEventListener('click', () => toggleFavorite(btn.dataset.favorite));
  });
}

function renderFavorites() {
  const list = state.favorites.map((trackId) => {
    const track = demoTracks.find((item) => item.id === trackId);
    if (!track) return '';
    return `
      <div class="small-track">
        <div class="small-cover">${track.cover}</div>
        <div class="small-text">
          <strong>${escapeHtml(track.title)}</strong>
          <span>${escapeHtml(track.artist)}</span>
        </div>
        <div class="mini-actions">
          <button data-mini-play="${track.id}" type="button">▶</button>
        </div>
      </div>
    `;
  }).join('') || '<p class="muted">No favorites yet.</p>';

  els.favoritesList.innerHTML = list;
  els.favoritesList.querySelectorAll('[data-mini-play]').forEach((btn) => {
    btn.addEventListener('click', () => playTrack(btn.dataset.miniPlay));
  });
}

function renderRecent() {
  const recent = [
    { title: 'Midnight Echo', artist: 'Nova Lane', icon: '🌙' },
    { title: 'Aurora Drift', artist: 'Luma', icon: '✨' },
    { title: 'City Lights', artist: 'Kairo', icon: '🌃' }
  ];

  els.recentList.innerHTML = recent.map((track) => `
    <div class="small-track">
      <div class="small-cover">${track.icon}</div>
      <div class="small-text">
        <strong>${escapeHtml(track.title)}</strong>
        <span>${escapeHtml(track.artist)}</span>
      </div>
    </div>
  `).join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getTrackById(trackId) {
  return demoTracks.find((track) => track.id === trackId) || null;
}

function playTrack(trackId) {
  const track = getTrackById(trackId);
  if (!track) return;

  if (!state.audio) {
    state.audio = new Audio();
    state.audio.volume = Number(els.volumeInput.value) / 100;
    state.audio.addEventListener('timeupdate', () => {
      const total = state.audio.duration || 0;
      const current = state.audio.currentTime || 0;
      const percent = total ? (current / total) * 100 : 0;
      els.progressBar.style.width = `${percent}%`;
      els.timeCurrent.textContent = formatTime(current);
    });
    state.audio.addEventListener('loadedmetadata', () => {
      els.timeTotal.textContent = formatTime(state.audio.duration);
    });
    state.audio.addEventListener('ended', () => {
      els.playToggle.textContent = '▶';
    });
  }

  state.currentTrack = track;
  state.audio.src = track.audio;
  state.audio.play();

  els.nowTitle.textContent = track.title;
  els.nowArtist.textContent = track.artist;
  els.playerBar.classList.remove('hidden');
  els.playToggle.textContent = '⏸';
  showToast(`Now playing: ${track.title}`);
}

function previewTrack(trackId) {
  playTrack(trackId);
}

function toggleFavorite(trackId) {
  const index = state.favorites.indexOf(trackId);
  if (index >= 0) {
    state.favorites.splice(index, 1);
    showToast('Removed from favorites');
  } else {
    state.favorites.push(trackId);
    showToast('Added to favorites');
  }

  localStorage.setItem('coremusic-favorites', JSON.stringify(state.favorites));
  renderFavorites();
  renderTracks();
}

function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function openAuth(mode) {
  els.authModal.classList.remove('hidden');
  els.authTitle.textContent = mode === 'signup' ? 'Create account' : 'Log in';
  els.tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === mode));
}

els.loginBtn.addEventListener('click', () => openAuth('login'));
els.signupBtn.addEventListener('click', () => openAuth('signup'));

els.tabs.forEach((tab) => {
  tab.addEventListener('click', () => openAuth(tab.dataset.tab));
});

document.querySelector('.close-btn').addEventListener('click', () => {
  els.authModal.classList.add('hidden');
});

els.authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.authForm).entries());

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!result.ok) {
      showToast(result.message || 'Login failed');
      return;
    }

    state.token = result.token;
    localStorage.setItem('coremusic-token', result.token);
    els.authModal.classList.add('hidden');
    showToast('Welcome back to CoreMusic');
  } catch (err) {
    showToast('Something went wrong');
  }
});

els.searchInput.addEventListener('input', (event) => {
  state.search = event.target.value.trim();
  loadTracks();
});

els.chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    els.chips.forEach((el) => el.classList.toggle('active', el === chip));
    state.filter = chip.dataset.filter || 'all';
    loadTracks();
  });
});

els.mainPlayBtn.addEventListener('click', () => {
  if (demoTracks.length) playTrack(demoTracks[0].id);
});

els.joinHeroBtn.addEventListener('click', () => openAuth('signup'));

els.playToggle.addEventListener('click', () => {
  if (!state.audio) return;
  if (state.audio.paused) {
    state.audio.play();
    els.playToggle.textContent = '⏸';
  } else {
    state.audio.pause();
    els.playToggle.textContent = '▶';
  }
});

els.volumeInput.addEventListener('input', (event) => {
  if (state.audio) state.audio.volume = Number(event.target.value) / 100;
});

renderFavorites();
renderRecent();
initFeaturedStats();
loadTracks();
