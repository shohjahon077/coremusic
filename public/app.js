const root = document.documentElement;
const appState = {
  token: localStorage.getItem('coremusic-token') || '',
  currentTrack: null,
  favorites: (() => {
    try {
      const saved = localStorage.getItem('coremusic-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Invalid favorites data:', error);
      return [];
    }
  })(),
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
  { id: 'm1', title: 'Первый раз', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:18', cover: '🎵', audio: 'MORGENSHTERN - Первый раз.mp3' },
  { id: 'm2', title: 'Группа крови', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:45', cover: '🎧', audio: 'MORGENSHTERN - Группа крови.mp3' },
  { id: 'm3', title: '12', artist: 'Morgenshtern', genre: 'Rap', duration: '2:56', cover: '🔥', audio: 'Morgenshtern - 12.mp3' },
  { id: 'm4', title: 'Антидепрессанты', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:32', cover: '💊', audio: 'MORGENSHTERN - Антидепрессанты.mp3' },
  { id: 'm5', title: 'Дикий', artist: 'MORGENSHTERN', genre: 'Rap', duration: '3:24', cover: '🐺', audio: 'MORGENSHTERN - Дикий.mp3' },
  { id: 'm6', title: 'Дом (Лондон, Прага, Ницца)', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '4:01', cover: '🏠', audio: 'MORGENSHTERN - Дом (Лондон, Прага, Ницца).mp3' },
  { id: 'm7', title: 'Молодость', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:38', cover: '🌟', audio: 'MORGENSHTERN - Молодость.mp3' },
  { id: 'm8', title: 'Номер', artist: 'MORGENSHTERN', genre: 'Rap', duration: '3:45', cover: '📞', audio: 'MORGENSHTERN - Номер.mp3' },
  { id: 'm9', title: 'Она', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:22', cover: '💕', audio: 'MORGENSHTERN - Она.mp3' },
  { id: 'm10', title: 'Опа', artist: 'MORGENSHTERN', genre: 'Rap', duration: '2:58', cover: '🎉', audio: 'MORGENSHTERN - Опа.mp3' },
  { id: 'm11', title: 'Повод', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:15', cover: '🎭', audio: 'MORGENSHTERN - Повод.mp3' },
  { id: 'm12', title: 'Пойдет', artist: 'MORGENSHTERN', genre: 'Rap', duration: '3:28', cover: '🚀', audio: 'MORGENSHTERN - Пойдет.mp3' },
  { id: 'm13', title: 'Последняя Любовь', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:54', cover: '💔', audio: 'MORGENSHTERN - Последняя Любовь.mp3' },
  { id: 'm14', title: 'Пустой вокзал', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:42', cover: '🚂', audio: 'MORGENSHTERN - Пустой вокзал.mp3' },
  { id: 'm15', title: 'Сдача', artist: 'MORGENSHTERN', genre: 'Rap', duration: '3:11', cover: '💰', audio: 'MORGENSHTERN - Сдача.mp3' },
  { id: 'm16', title: 'Селяви', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:33', cover: '🌴', audio: 'MORGENSHTERN - Селяви.mp3' },
  { id: 'm17', title: 'Таблетки', artist: 'MORGENSHTERN', genre: 'Rap', duration: '3:19', cover: '💊', audio: 'MORGENSHTERN - Таблетки.mp3' },
  { id: 'm18', title: 'Четыре Украинки', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:27', cover: '🎸', audio: 'MORGENSHTERN - Четыре Украинки.mp3' },
  { id: 'm19', title: 'Чёрный Рус��кий', artist: 'MORGENSHTERN', genre: 'Rap', duration: '3:41', cover: '🖤', audio: 'MORGENSHTERN - Чёрный Русский.mp3' },
  { id: 'm20', title: 'Щека На Щеку', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:35', cover: '👄', audio: 'MORGENSHTERN - Щека На Щеку.mp3' },
  { id: 'm21', title: 'Я Рок Звезда', artist: 'MORGENSHTERN', genre: 'Rap', duration: '3:28', cover: '⭐', audio: 'MORGENSHTERN - Я Рок Звезда.mp3' },
  { id: 'm22', title: 'Я Убил Марка', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '4:02', cover: '⚡', audio: 'morgenshtern-ia-ubil-marka-oksimiron-diss(1).mp3' },
  { id: 'm23', title: 'Если я спал с тобой', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:45', cover: '🛏️', audio: 'MORGENSHTERN - Если я спал с тобой.mp3' },
  { id: 'm24', title: 'Кисоньке', artist: 'MORGENSHTERN', genre: 'Rap', duration: '3:18', cover: '🐱', audio: 'MORGENSHTERN - Кисоньке.mp3' },
  { id: 'm25', title: 'Когда budu умирать', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:52', cover: '☠️', audio: 'MORGENSHTERN - Когда буду умирать.mp3' },
  { id: 'm26', title: 'Мы так молоды', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:41', cover: '👶', audio: 'MORGENSHTERN - Мы так молоды.mp3' },
  { id: 'm27', title: 'Отпускаю', artist: 'MORGENSHTERN', genre: 'Rap', duration: '3:33', cover: '🕊️', audio: 'MORGENSHTERN - Отпускаю.mp3' },
  { id: 'm28', title: 'Пам Пам Пам', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:26', cover: '🔫', audio: 'MORGENSHTERN - Пам Пам Пам!.mp3' },
  { id: 'm29', title: 'Пиво и скейтборд', artist: 'MORGENSHTERN', genre: 'Rap', duration: '3:39', cover: '🛹', audio: 'MORGENSHTERN - Пиво и скейтборд.mp3' },
  { id: 'm30', title: 'Привет я Алишер', artist: 'MORGENSHTERN', genre: 'Hip-Hop', duration: '3:44', cover: '👋', audio: 'MORGENSHTERN - Привет я Алишер.mp3' },
  { id: 'n1', title: 'Midnight Echo', artist: 'Nova Lane', genre: 'Electronic', duration: '4:12', cover: '🌙', audio: 'placeholder-1.mp3' },
  { id: 'n2', title: 'Aurora Drift', artist: 'Luma', genre: 'Synthwave', duration: '3:54', cover: '✨', audio: 'placeholder-2.mp3' },
  { id: 'n3', title: 'City Lights', artist: 'Kairo', genre: 'Pop', duration: '4:06', cover: '🌃', audio: 'placeholder-3.mp3' }
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
  try {
    const res = await fetch(`/api/tracks?q=${encodeURIComponent(appState.search)}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    renderTracks(data);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    showToast('Failed to load tracks');
    els.trackList.innerHTML = '<div class="empty">Unable to load tracks. Please try again.</div>';
  }
}

function renderTracks(tracks) {
  if (!tracks || !Array.isArray(tracks)) {
    els.trackList.innerHTML = '<div class="empty">Invalid track data.</div>';
    return;
  }

  if (!tracks.length) {
    els.trackList.innerHTML = '<div class="empty">No tracks found.</div>';
    return;
  }

  els.trackList.innerHTML = tracks.map((track) => {
    const favorite = appState.favorites.includes(track.id);
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
  const track = trackSeed.find((item) => item.id === trackId);
  if (!track || !track.audio) {
    return '';
  }
  return `/audio/${encodeURIComponent(track.audio)}`;
}

function getCoverGradient(trackId) {
  const palette = {
    m1: 'linear-gradient(135deg,#7C3AED,#22D3EE)',
    m2: 'linear-gradient(135deg,#EF4444,#F59E0B)',
    m3: 'linear-gradient(135deg,#10B981,#0EA5E9)',
    m4: 'linear-gradient(135deg,#EC4899,#8B5CF6)',
    m5: 'linear-gradient(135deg,#F97316,#FBBF24)',
    m6: 'linear-gradient(135deg,#06B6D4,#0EA5E9)',
    m7: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
    m8: 'linear-gradient(135deg,#0F172A,#334155)',
    m9: 'linear-gradient(135deg,#F87171,#FB923C)',
    m10: 'linear-gradient(135deg,#10B981,#14B8A6)',
    m11: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
    m12: 'linear-gradient(135deg,#F59E0B,#FBBF24)',
    m13: 'linear-gradient(135deg,#EF4444,#F87171)',
    m14: 'linear-gradient(135deg,#1E293B,#475569)',
    m15: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
    m16: 'linear-gradient(135deg,#06B6D4,#22D3EE)',
    m17: 'linear-gradient(135deg,#EC4899,#F472B6)',
    m18: 'linear-gradient(135deg,#0EA5E9,#38BDF8)',
    m19: 'linear-gradient(135deg,#1F2937,#111827)',
    m20: 'linear-gradient(135deg,#F97316,#FB923C)',
    m21: 'linear-gradient(135deg,#FBBF24,#FCD34D)',
    m22: 'linear-gradient(135deg,#EF4444,#DC2626)',
    m23: 'linear-gradient(135deg,#EC4899,#DB2777)',
    m24: 'linear-gradient(135deg,#F472B6,#EC4899)',
    m25: 'linear-gradient(135deg,#1F2937,#374151)',
    m26: 'linear-gradient(135deg,#7C3AED,#6366F1)',
    m27: 'linear-gradient(135deg,#0EA5E9,#06B6D4)',
    m28: 'linear-gradient(135deg,#F59E0B,#D97706)',
    m29: 'linear-gradient(135deg,#10B981,#059669)',
    m30: 'linear-gradient(135deg,#8B5CF6,#7C3AED)',
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
    appState.audio.addEventListener('error', () => {
      showToast('Error loading audio');
      console.error('Audio error:', appState.audio.error);
    });
  }

  const src = getAudioUrl(trackId);
  if (src) {
    appState.audio.src = src;
    appState.audio.play().catch((error) => {
      console.error('Playback error:', error);
      showToast('Unable to play track');
    });
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

    if (!res.ok) {
      throw new Error(`Login failed with status ${res.status}`);
    }

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
    console.error('Login error:', error);
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
