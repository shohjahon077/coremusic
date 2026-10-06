const state = {
  token: localStorage.getItem('coremusic-token') || '',
  user: JSON.parse(localStorage.getItem('coremusic-user') || 'null'),
  currentTrack: null,
  currentGenre: 'all',
  tracks: [],
  playlists: [],
  albums: [],
  favorites: []
};

const els = {
  loginBtn: document.getElementById('loginBtn'),
  signupBtn: document.getElementById('signupBtn'),
  userMenu: document.getElementById('userMenu'),
  authModal: document.getElementById('authModal'),
  loginForm: document.getElementById('loginForm'),
  signupForm: document.getElementById('signupForm'),
  userMenuDropdown: document.getElementById('userMenuDropdown'),
  logoutBtn: document.getElementById('logoutBtn'),
  globalSearch: document.getElementById('globalSearch'),
  featuredTracks: document.getElementById('featuredTracks'),
  exploreTracks: document.getElementById('exploreTracks'),
  playlistsGrid: document.getElementById('playlistsGrid'),
  albumsGrid: document.getElementById('albumsGrid'),
  genreBtns: document.querySelectorAll('.genre-btn'),
  player: document.getElementById('player'),
  audioPlayer: document.getElementById('audioPlayer'),
  playBtn: document.getElementById('playBtn'),
  playerTitle: document.getElementById('playerTitle'),
  playerArtist: document.getElementById('playerArtist'),
  progress: document.getElementById('progress'),
  progressBar: document.querySelector('.progress-bar'),
  currentTime: document.getElementById('currentTime'),
  totalTime: document.getElementById('totalTime'),
  volumeSlider: document.getElementById('volumeSlider'),
  toast: document.getElementById('toast')
};

function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), 2000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function fetchApi(path, method = 'GET', body = null) {
  const opts = { method, headers: {} };
  if (state.token) opts.headers.Authorization = `Bearer ${state.token}`;
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, opts);
  return res.json();
}

async function loadTracks() {
  state.tracks = await fetchApi('/tracks');
  renderFeaturedTracks();
  renderExploreTracks();
}

async function loadPlaylists() {
  state.playlists = await fetchApi('/playlists');
  renderPlaylists();
}

async function loadAlbums() {
  state.albums = await fetchApi('/albums');
  renderAlbums();
}

function renderFeaturedTracks() {
  const featured = [...state.tracks].sort((a, b) => b.plays - a.plays).slice(0, 8);
  els.featuredTracks.innerHTML = featured.map(track => `
    <div class="track-card" data-id="${track.id}">
      <div class="cover">${track.cover}</div>
      <h3>${escapeHtml(track.title)}</h3>
      <div class="artist">${escapeHtml(track.artist)}</div>
      <div class="meta">
        <span>${escapeHtml(track.genre)}</span>
        <span>${track.plays} plays</span>
      </div>
      <div class="actions">
        <button class="play-track">▶ Play</button>
        <button class="add-fav">❤ Save</button>
      </div>
    </div>
  `).join('');

  attachTrackEvents(els.featuredTracks);
}

function renderExploreTracks() {
  let tracks = state.tracks;
  if (state.currentGenre !== 'all') {
    tracks = tracks.filter(t => t.genre === state.currentGenre);
  }
  
  els.exploreTracks.innerHTML = tracks.map(track => `
    <div class="track-card" data-id="${track.id}">
      <div class="cover">${track.cover}</div>
      <h3>${escapeHtml(track.title)}</h3>
      <div class="artist">${escapeHtml(track.artist)}</div>
      <div class="meta">
        <span>${escapeHtml(track.genre)}</span>
        <span>${track.duration}</span>
      </div>
      <div class="actions">
        <button class="play-track">▶ Play</button>
        <button class="add-fav">❤ Save</button>
      </div>
    </div>
  `).join('');

  attachTrackEvents(els.exploreTracks);
}

function renderPlaylists() {
  els.playlistsGrid.innerHTML = state.playlists.map(playlist => `
    <div class="playlist-card" data-id="${playlist.id}">
      <div class="cover">${playlist.cover}</div>
      <h3>${escapeHtml(playlist.name)}</h3>
      <div class="count">${playlist.tracks.length} songs</div>
    </div>
  `).join('');
}

function renderAlbums() {
  els.albumsGrid.innerHTML = state.albums.map(album => `
    <div class="playlist-card" data-id="${album.id}">
      <div class="cover">${album.cover}</div>
      <h3>${escapeHtml(album.name)}</h3>
      <div class="count">${escapeHtml(album.artist)}</div>
    </div>
  `).join('');
}

function attachTrackEvents(container) {
  container.querySelectorAll('.play-track').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const trackId = e.target.closest('.track-card').dataset.id;
      const track = state.tracks.find(t => t.id === trackId);
      if (track) playTrack(track);
    });
  });

  container.querySelectorAll('.add-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const trackId = e.target.closest('.track-card').dataset.id;
      if (!state.token) {
        showToast('Please login to save favorites');
        return;
      }
      toggleFavorite(trackId);
    });
  });
}

function playTrack(track) {
  state.currentTrack = track;
  els.playerTitle.textContent = track.title;
  els.playerArtist.textContent = track.artist;
  els.player.classList.remove('hidden');
  els.playBtn.textContent = '⏸';
  showToast(`Now playing: ${track.title}`);
}

function toggleFavorite(trackId) {
  const idx = state.favorites.indexOf(trackId);
  if (idx >= 0) state.favorites.splice(idx, 1);
  else state.favorites.push(trackId);
  localStorage.setItem('coremusic-favorites', JSON.stringify(state.favorites));
  showToast(idx >= 0 ? 'Removed from favorites' : 'Added to favorites');
}

function openAuthModal(tab = 'login') {
  els.authModal.classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.toggle('hidden', form.id !== `${tab}Form`);
  });
}

function closeAuthModal() {
  els.authModal.classList.add('hidden');
}

function setUser(user, token) {
  state.user = user;
  state.token = token;
  localStorage.setItem('coremusic-user', JSON.stringify(user));
  localStorage.setItem('coremusic-token', token);
  updateUI();
}

function logout() {
  state.user = null;
  state.token = '';
  localStorage.removeItem('coremusic-user');
  localStorage.removeItem('coremusic-token');
  updateUI();
  showToast('Logged out');
}

function updateUI() {
  if (state.user) {
    els.loginBtn.classList.add('hidden');
    els.signupBtn.classList.add('hidden');
    els.userMenu.classList.remove('hidden');
    els.userMenu.textContent = state.user.name.charAt(0).toUpperCase();
  } else {
    els.loginBtn.classList.remove('hidden');
    els.signupBtn.classList.remove('hidden');
    els.userMenu.classList.add('hidden');
  }
}

// Event listeners
els.loginBtn.addEventListener('click', () => openAuthModal('login'));
els.signupBtn.addEventListener('click', () => openAuthModal('signup'));

document.querySelector('.close-btn').addEventListener('click', closeAuthModal);

els.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const [email, password] = e.target.querySelectorAll('input');
  const result = await fetchApi('/auth/login', 'POST', {
    email: email.value,
    password: password.value
  });
  if (result.ok) {
    setUser(result.user, result.token);
    closeAuthModal();
    showToast('Login successful');
  } else {
    showToast(result.message);
  }
});

els.signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const [name, email, password] = e.target.querySelectorAll('input');
  const result = await fetchApi('/auth/register', 'POST', {
    name: name.value,
    email: email.value,
    password: password.value
  });
  if (result.ok) {
    setUser(result.user, result.token);
    closeAuthModal();
    showToast('Account created');
  } else {
    showToast(result.message);
  }
});

els.userMenu.addEventListener('click', (e) => {
  els.userMenuDropdown.classList.toggle('hidden');
});

els.logoutBtn.addEventListener('click', logout);

els.genreBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    els.genreBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentGenre = btn.dataset.genre;
    renderExploreTracks();
  });
});

els.playBtn.addEventListener('click', () => {
  if (els.playBtn.textContent === '▶') {
    els.playBtn.textContent = '⏸';
  } else {
    els.playBtn.textContent = '▶';
  }
});

els.volumeSlider.addEventListener('input', (e) => {
  els.audioPlayer.volume = e.target.value / 100;
});

els.globalSearch.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = state.tracks.filter(t => 
    t.title.toLowerCase().includes(query) || 
    t.artist.toLowerCase().includes(query)
  );
  els.exploreTracks.innerHTML = filtered.map(track => `
    <div class="track-card" data-id="${track.id}">
      <div class="cover">${track.cover}</div>
      <h3>${escapeHtml(track.title)}</h3>
      <div class="artist">${escapeHtml(track.artist)}</div>
      <div class="meta">
        <span>${escapeHtml(track.genre)}</span>
        <span>${track.duration}</span>
      </div>
      <div class="actions">
        <button class="play-track">▶ Play</button>
        <button class="add-fav">❤ Save</button>
      </div>
    </div>
  `).join('');
  attachTrackEvents(els.exploreTracks);
});

// Init
updateUI();
loadTracks();
loadPlaylists();
loadAlbums();

if (state.token) {
  showToast('Welcome back!');
}
