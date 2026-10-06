const root = document.documentElement;
const appState = {
  token: localStorage.getItem('coremusic-token') || '',
  currentTrack: null,
  favorites: JSON.parse(localStorage.getItem('coremusic-favorites') || '[]'),
  audio: null,
  search: ''
};

const els = {
  trackList: document.getElementById('trackList'),
  sidebarFavorites: document.getElementById('favoritesList'),
  recentList: document.getElementById('recentList'),
  loginButton: document.getElementById('loginBtn'),
  signupButton: document.getElementById('signupBtn'),
  mainPlay: document.getElementById('mainPlay'),
  joinHero: document.getElementById('joinHero'),
  authModal: document.getElementById('authModal'),
  authTabs: document.querySelectorAll('.tab'),
  authForm: document.getElementById('authForm'),
  authTitle: document.getElementById('authTitle'),
  searchInput: document.getElementById('searchInput'),
  chipGroup: document.getElementById('chipGroup'),
  playerBar: document.getElementById('playerBar'),
  nowTitle: document.getElementById('nowTitle'),
  nowArtist: document.getElementById('nowArtist'),
  playToggle: document.getElementById('playToggle'),
  progressBar: document.getElementById('progressBar'),
  timeCurrent: document.getElementById('timeCurrent'),
  timeTotal: document.getElementById('timeTotal'),
  volume: document.getElementById('volume'),
  toast: document.getElementById('toast')
};

const trackSeed = [
  { id: 'm1', title: 'Первый раз', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:18', cover: '🎵' },
  { id: 'm2', title: 'Группа крови', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:45', cover: '🎧' },
  { id: 'm3', title: '12', artist: 'Morgenshtern', genre: 'Rap', duration: '2:56', cover: '🔥' },
  { id: 'n1', title: 'Midnight Echo', artist: 'Nova Lane', genre: 'Electronic', duration: '4:12', cover: '🌙' },
  { id: 'n2', title: 'Aurora Drift', artist: 'Luma', genre: 'Synthwave', duration: '3:54', cover: '✨' },
  { id: 'n3', title: 'City Lights', artist: 'Kairo', genre: 'Pop', duration: '4:06', cover: '🌃' }
];

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 1800);
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
  return trackSeed.find((track) => track.id === trackId);
}

async function fetchTracks() {
  const res = await fetch(`/api/tracks?q=${encodeURIComponent(appState.search)}`);
  const data = await res.json();
  renderTracks(data);
}

function renderTracks(tracks) {
  if (!tracks.length) {
    els.trackList.innerHTML = '<div class="empty">No tracks found.</div>';
    return;
  }

  els.trackList.innerHTML = tracks.map((track) => {
    const favorite = appState.favorites.includes(track.id);
    const audioFile = getAudioUrl(track.id);
    const coverText = track.cover || '♪';
    return `
      <article class="track-card" data-id="${track.id}">
        <div class="card-cover" style="background:${getCoverGradient(track.id)}; color: rgba(255,255,255,.9);">${coverText}</div>
        <div class="body">
          <div class="track-topline">
            <h3>${escapeHtml(track.title)}</h3>
            <button class="icon-btn favorite ${favorite ? 'active' : ''}" data-favorite="${track.id}" aria-label="Save favorite">♥</button>
          </div>
          <div class="artist">${escapeHtml(track.artist)}</div>
          <div class="meta-row">
            <span>${escapeHtml(track.genre)}</span>
            <span>${escapeHtml(track.duration)}</span>
          </div>
          <div class="card-actions">
            <button class="play-btn" data-play="${track.id}">Play</button>
            <button class="icon-btn" data-track="${track.id}" title="Preview">▶</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  els.trackList.querySelectorAll('[data-play]').forEach((button) => {
    button.addEventListener('click', () => playTrack(button.dataset.play));
  });

  els.trackList.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => toggleFavorite(button.dataset.favorite));
  });

  els.trackList.querySelectorAll('[data-track]').forEach((button) => {
    button.addEventListener('click', () => previewTrack(button.dataset.track));
  });
}

function getAudioUrl(trackId) {
  const map = {
    m1: '/audio/MORGENSHTERN%20-%20%D0%9F%D0%B5%D1%80%D0%B2%D1%8B%D0%B9%20%D1%80%D0%B0%D0%B7.mp3',
    m2: '/audio/MORGENSHTERN-%D0%93%D1%80%D1%83%D0%BF%D0%B0%20%D0%BA%D1%80%D0%BE%D0%B2%D0%B8.mp3',
    m3: '/audio/Morgenshtern%20-%2012.mp3',
    n1: '/audio/placeholder-1.mp3',
    n2: '/audio/placeholder-2.mp3',
    n3: '/audio/placeholder-3.mp3'
  };
  return map[trackId] || '';
}

function getCoverGradient(trackId) {
  const palette = {
    m1: 'linear-gradient(135deg,#7C3AED,#22D3EE)',
    m2: 'linear-gradient(135deg,#EF4444,#F59E0B)',
    m3: 'linear-gradient(135deg,#10B981,#0EA5E9)',
    n1: 'linear-gradient(135deg,#0F172A,#334155)',
    n2: 'linear-gradient(135deg,#EC4899,#8B5CF6)',
    n3: 'linear-gradient(135deg,#F97316,#FBBF24)'
  };
  return palette[trackId] || 'linear-gradient(135deg,#1f2937,#0f172a)';
}

function renderFavorites() {
  const favoritesList = appState.favorites.map((trackId) => {
    const track = getTrackById(trackId);
    if (!track) return '';
    return `
      <div class="small-track">
        <div class="small-cover">${track.cover || '♪'}</div>
        <div class="small-text">
          <strong>${escapeHtml(track.title)}</strong>
          <span>${escapeHtml(track.artist)}</span>
        </div>
        <div class="mini-actions">
          <button data-mini-play="${track.id}">▶</button>
        </div>
      </div>
    `;
  }).join('') || '<p class="muted">No favorites yet.</p>';

  els.sidebarFavorites.innerHTML = favoritesList;
  els.sidebarFavorites.querySelectorAll('[data-mini-play]').forEach((button) => {
    button.addEventListener('click', () => playTrack(button.dataset.miniPlay));
  });
}

function renderRecent() {
  const recent = [
    { title: 'Midnight Echo', artist: 'Nova Lane' },
    { title: 'Aurora Drift', artist: 'Luma' },
    { title: 'City Lights', artist: 'Kairo' }
  ];

  els.recentList.innerHTML = recent.map((track) => `
    <div class="small-track">
      <div class="small-cover">♫</div>
      <div class="small-text">
        <strong>${escapeHtml(track.title)}</strong>
        <span>${escapeHtml(track.artist)}</span>
      </div>
    </div>
  `).join('');
}

function playTrack(trackId) {
  const track = getTrackById(trackId);
  if (!track) return;

  if (!appState.audio) {
    appState.audio = new Audio();
    appState.audio.addEventListener('timeupdate', () => {
      const progress = appState.audio.duration ? (appState.audio.currentTime / appState.audio.duration) * 100 : 0;
      els.progressBar.style.width = `${progress}%`;
      els.timeCurrent.textContent = formatTime(appState.audio.currentTime);
    });
    appState.audio.addEventListener('loadedmetadata', () => {
      els.timeTotal.textContent = formatTime(appState.audio.duration);
    });
    appState.audio.addEventListener('ended', () => {
      els.playToggle.textContent = '▶';
    });
  }

  const src = getAudioUrl(trackId);
  if (src) {
    appState.audio.src = src;
    appState.audio.play();
  }

  appState.currentTrack = track;
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
  const idx = appState.favorites.indexOf(trackId);
  if (idx >= 0) {
    appState.favorites.splice(idx, 1);
    showToast('Removed from favorites');
  } else {
    appState.favorites.push(trackId);
    showToast('Added to favorites');
  }

  localStorage.setItem('coremusic-favorites', JSON.stringify(appState.favorites));
  renderTracksFromSearch();
  renderFavorites();
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function renderTracksFromSearch() {
  fetchTracks();
}

els.searchInput.addEventListener('input', (event) => {
  appState.search = event.target.value.trim();
  renderTracksFromSearch();
});

els.loginButton.addEventListener('click', () => {
  els.authModal.classList.remove('hidden');
  els.authTitle.textContent = 'Log in';
  els.authTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === 'login'));
});

els.signupButton.addEventListener('click', () => {
  els.authModal.classList.remove('hidden');
  els.authTitle.textContent = 'Create account';
  els.authTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === 'signup'));
});

els.authTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    els.authTabs.forEach((item) => item.classList.toggle('active', item === tab));
    els.authTitle.textContent = tab.dataset.tab === 'login' ? 'Log in' : 'Create account';
  });
});

els.authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(els.authForm);
  const payload = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!result.ok) {
      showToast(result.message || 'Login failed');
      return;
    }

    appState.token = result.token;
    localStorage.setItem('coremusic-token', result.token);
    els.authModal.classList.add('hidden');
    showToast('Welcome back to CoreMusic');
  } catch (error) {
    showToast('Something went wrong');
  }
});

els.mainPlay.addEventListener('click', () => {
  if (trackSeed.length) {
    playTrack(trackSeed[0].id);
  }
});

els.joinHero.addEventListener('click', () => els.authModal.classList.remove('hidden'));

els.playToggle.addEventListener('click', () => {
  if (!appState.audio) return;
  if (appState.audio.paused) {
    appState.audio.play();
    els.playToggle.textContent = '⏸';
  } else {
    appState.audio.pause();
    els.playToggle.textContent = '▶';
  }
});

els.volume.addEventListener('input', (event) => {
  if (!appState.audio) return;
  appState.audio.volume = Number(event.target.value) / 100;
});

document.querySelector('.close-btn').addEventListener('click', () => {
  els.authModal.classList.add('hidden');
});

els.chipGroup.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach((item) => item.classList.remove('active'));
  chip.classList.add('active');
  appState.search = chip.dataset.filter || '';
  renderTracksFromSearch();
});

renderRecent();
renderFavorites();
fetchTracks();
