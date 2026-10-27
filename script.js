/* ============================================ */
/* CORE MUSIC 2.0 — Main Script                 */
/* ============================================ */

(function () {
  'use strict';

  // ==========================================
  // STATE
  // ==========================================
  const state = {
    tracks: [],
    currentIndex: -1,
    currentView: 'home',
    previousView: null,
    isPlaying: false,
    shuffle: false,
    repeat: 'none', // 'none' | 'all' | 'one'
    volume: 0.8,
    muted: false,
    lastVolume: 0.8,
    
    favorites: [],
    recent: [],
    playlists: [],
    queue: [],
    playCounts: {}, // trackId -> count
    
    settings: {
      animations: true,
      bgIntensity: 0.6,
      reducedMotion: false,
      accentColor: '#00e5ff'
    },
    
    searchQuery: '',
    currentFilter: {
      genre: 'all',
      mood: 'all',
      artist: 'all',
      album: 'all'
    },
    
    audio: null,
    introCompleted: false
  };

  // ==========================================
  // DOM REFERENCES
  // ==========================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const dom = {
    app: $('#app'),
    intro: $('#intro'),
    introSkip: $('#introSkip'),
    sidebar: $('#sidebar'),
    menuBtn: $('#menuBtn'),
    content: $('#content'),
    globalSearch: $('#globalSearch'),
    
    // Player
    player: $('#player'),
    playerCover: $('#playerCover'),
    playerTitle: $('#playerTitle'),
    playerArtist: $('#playerArtist'),
    playerFavBtn: $('#playerFavBtn'),
    playBtn: $('#playBtn'),
    prevBtn: $('#prevBtn'),
    nextBtn: $('#nextBtn'),
    shuffleBtn: $('#shuffleBtn'),
    repeatBtn: $('#repeatBtn'),
    progress: $('#progress'),
    progressFill: $('#progressFill'),
    progressHandle: $('#progressHandle'),
    currentTime: $('#currentTime'),
    duration: $('#duration'),
    volume: $('#volume'),
    muteBtn: $('#muteBtn'),
    lyricsBtn: $('#lyricsBtn'),
    queueBtn: $('#queueBtn'),
    
    // Now Playing Full
    nowPlayingFull: $('#nowPlayingFull'),
    npfBackdrop: $('#npfBackdrop'),
    npfClose: $('#npfClose'),
    npfCover: $('#npfCover'),
    npfTitle: $('#npfTitle'),
    npfArtist: $('#npfArtist'),
    npfVisualizer: $('#npfVisualizer'),
    npfProgress: $('#npfProgress'),
    npfProgressFill: $('#npfProgressFill'),
    npfCurrentTime: $('#npfCurrentTime'),
    npfDuration: $('#npfDuration'),
    npfPlay: $('#npfPlay'),
    npfPrev: $('#npfPrev'),
    npfNext: $('#npfNext'),
    npfShuffle: $('#npfShuffle'),
    npfRepeat: $('#npfRepeat'),
    
    // Mini player in sidebar
    nowPlayingMini: $('#nowPlayingMini'),
    npCover: $('#npCover'),
    npTitle: $('#npTitle'),
    npArtist: $('#npArtist'),
    
    // Modal
    modal: $('#modal'),
    modalCard: $('#modalCard'),
    
    // Toast
    toast: $('#toast'),
    
    // Background
    bgCanvas: $('#bgCanvas'),
    
    // Audio library
    audioLibrary: $('#audioLibrary')
  };

  // ==========================================
  // STORAGE
  // ==========================================
  const STORAGE_KEY = 'coremusic_v2';

  function loadStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      
      state.favorites = data.favorites || [];
      state.recent = data.recent || [];
      state.playlists = data.playlists || [];
      state.queue = data.queue || [];
      state.playCounts = data.playCounts || {};
      state.shuffle = !!data.shuffle;
      state.repeat = data.repeat || 'none';
      state.volume = data.volume ?? 0.8;
      state.settings = { ...state.settings, ...data.settings };
    } catch (e) {
      console.warn('Storage load error', e);
    }
  }

  function saveStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        favorites: state.favorites,
        recent: state.recent,
        playlists: state.playlists,
        queue: state.queue,
        playCounts: state.playCounts,
        shuffle: state.shuffle,
        repeat: state.repeat,
        volume: state.volume,
        settings: state.settings
      }));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }

  // ==========================================
  // UTILS
  // ==========================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function showToast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => dom.toast.classList.remove('show'), 2500);
  }

  function uid() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // ==========================================
  // LOAD TRACKS FROM HTML
  // ==========================================
  function loadTracksFromHTML() {
    const audios = $$('audio[data-track-id]', dom.audioLibrary);
    state.tracks = audios.map((el, idx) => ({
      id: el.dataset.trackId || String(idx + 1),
      title: el.dataset.title || 'Nomsiz',
      artist: el.dataset.artist || 'Noma\'lum',
      album: el.dataset.album || 'Single',
      genre: el.dataset.genre || 'Other',
      mood: el.dataset.mood || 'Chill',
      cover: el.dataset.cover || '',
      lyrics: el.dataset.lyrics || '',
      src: el.src,
      element: el
    }));
  }

  // ==========================================
  // AUDIO SYSTEM
  // ==========================================
  function createAudio() {
    if (state.audio) {
      state.audio.pause();
      state.audio.removeEventListener('timeupdate', onTimeUpdate);
      state.audio.removeEventListener('loadedmetadata', onLoadedMeta);
      state.audio.removeEventListener('ended', onEnded);
      state.audio.removeEventListener('error', onError);
    }
    
    state.audio = new Audio();
    state.audio.preload = 'metadata';
    state.audio.volume = state.volume;
    
    state.audio.addEventListener('timeupdate', onTimeUpdate);
    state.audio.addEventListener('loadedmetadata', onLoadedMeta);
    state.audio.addEventListener('ended', onEnded);
    state.audio.addEventListener('error', onError);
  }

  function onTimeUpdate() {
    if (!state.audio || !state.audio.duration) return;
    const pct = (state.audio.currentTime / state.audio.duration) * 100;
    
    dom.progressFill.style.width = pct + '%';
    dom.progressHandle.style.left = pct + '%';
    dom.currentTime.textContent = formatTime(state.audio.currentTime);
    
    if (dom.npfProgressFill) {
      dom.npfProgressFill.style.width = pct + '%';
      dom.npfCurrentTime.textContent = formatTime(state.audio.currentTime);
    }
  }

  function onLoadedMeta() {
    dom.duration.textContent = formatTime(state.audio.duration);
    if (dom.npfDuration) {
      dom.npfDuration.textContent = formatTime(state.audio.duration);
    }
  }

  function onEnded() {
    if (state.repeat === 'one') {
      state.audio.currentTime = 0;
      state.audio.play().catch(() => {});
    } else {
      playNext(true);
    }
  }

  function onError() {
    showToast('Audio fayl topilmadi');
    setTimeout(() => playNext(true), 600);
  }

  function loadTrack(index, autoplay = true, context = 'library') {
    let trackList = getFilteredTracks(context);
    if (index < 0 || index >= trackList.length) return;
    
    const track = trackList[index];
    state.currentIndex = index;
    
    state.audio.src = track.src;
    state.audio.load();
    
    updatePlayerUI(track);
    
    if (autoplay) {
      const p = state.audio.play();
      if (p && p.catch) p.catch(() => {});
      state.isPlaying = true;
      updatePlayIcon();
    }
    
    // Update play count
    state.playCounts[track.id] = (state.playCounts[track.id] || 0) + 1;
    
    // Add to recent
    state.recent = [track.id, ...state.recent.filter(id => id !== track.id)].slice(0, 50);
    
    saveStorage();
    renderCurrentView();
  }

  function updatePlayerUI(track) {
    // Mini player
    dom.playerTitle.textContent = track.title;
    dom.playerArtist.textContent = track.artist;
    dom.playerCover.innerHTML = track.cover
      ? `<img src="${escapeHtml(track.cover)}" alt="${escapeHtml(track.title)}" />`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <path d="M9 18V5l12-2v13"/>
           <circle cx="6" cy="18" r="3"/>
           <circle cx="18" cy="16" r="3"/>
         </svg>`;
    
    // Sidebar mini
    dom.npTitle.textContent = track.title;
    dom.npArtist.textContent = track.artist;
    dom.npCover.innerHTML = track.cover
      ? `<img src="${escapeHtml(track.cover)}" alt="" />`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <path d="M9 18V5l12-2v13"/>
           <circle cx="6" cy="18" r="3"/>
           <circle cx="18" cy="16" r="3"/>
         </svg>`;
    
    // Now Playing Full
    if (dom.npfTitle) {
      dom.npfTitle.textContent = track.title;
      dom.npfArtist.textContent = track.artist;
      dom.npfCover.innerHTML = track.cover
        ? `<img src="${escapeHtml(track.cover)}" alt="" />`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <path d="M9 18V5l12-2v13"/>
             <circle cx="6" cy="18" r="3"/>
             <circle cx="18" cy="16" r="3"/>
           </svg>`;
      
      if (track.cover) {
        dom.npfBackdrop.style.backgroundImage = `url(${escapeHtml(track.cover)})`;
      }
    }
    
    updateFavButton();
  }

  function togglePlay() {
    if (!state.audio || !state.audio.src) {
      const tracks = getFilteredTracks();
      if (tracks.length > 0) {
        loadTrack(0, true);
      }
      return;
    }
    
    if (state.audio.paused) {
      const p = state.audio.play();
      if (p && p.catch) p.catch(() => {});
      state.isPlaying = true;
    } else {
      state.audio.pause();
      state.isPlaying = false;
    }
    updatePlayIcon();
  }

  function updatePlayIcon() {
    const playIcons = $$('.icon-play');
    const pauseIcons = $$('.icon-pause');
    
    if (state.isPlaying) {
      playIcons.forEach(el => el.classList.add('hidden'));
      pauseIcons.forEach(el => el.classList.remove('hidden'));
    } else {
      playIcons.forEach(el => el.classList.remove('hidden'));
      pauseIcons.forEach(el => el.classList.add('hidden'));
    }
  }

  function playNext(auto = false) {
    const tracks = getFilteredTracks();
    if (tracks.length === 0) return;
    
    let next;
    if (state.shuffle) {
      next = Math.floor(Math.random() * tracks.length);
      if (tracks.length > 1 && next === state.currentIndex) {
        next = (next + 1) % tracks.length;
      }
    } else {
      next = state.currentIndex + 1;
      if (next >= tracks.length) {
        if (state.repeat === 'all' || !auto) {
          next = 0;
        } else {
          state.isPlaying = false;
          updatePlayIcon();
          return;
        }
      }
    }
    loadTrack(next, true);
  }

  function playPrev() {
    const tracks = getFilteredTracks();
    if (tracks.length === 0) return;
    
    if (state.audio && state.audio.currentTime > 3) {
      state.audio.currentTime = 0;
      return;
    }
    
    let prev = state.currentIndex - 1;
    if (prev < 0) prev = tracks.length - 1;
    loadTrack(prev, true);
  }

  function seek(e, progressEl = dom.progress) {
    if (!state.audio || !state.audio.duration) return;
    const rect = progressEl.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    state.audio.currentTime = pct * state.audio.duration;
  }

  // ==========================================
  // FAVORITES
  // ==========================================
  function toggleFavorite(trackId) {
    const idx = state.favorites.indexOf(trackId);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      showToast('Sevimlilardan olib tashlandi');
    } else {
      state.favorites.push(trackId);
      showToast('Sevimlilarga qo\'shildi');
    }
    saveStorage();
    updateFavButton();
    renderCurrentView();
  }

  function isFavorite(trackId) {
    return state.favorites.includes(trackId);
  }

  function updateFavButton() {
    const tracks = getFilteredTracks();
    if (state.currentIndex < 0 || state.currentIndex >= tracks.length) return;
    const track = tracks[state.currentIndex];
    if (!track) return;
    
    const faved = isFavorite(track.id);
    dom.playerFavBtn.classList.toggle('active', faved);
    const svg = dom.playerFavBtn.querySelector('svg');
    if (faved) {
      svg.setAttribute('fill', 'currentColor');
    } else {
      svg.setAttribute('fill', 'none');
    }
  }

  // ==========================================
  // FILTERING
  // ==========================================
  function getFilteredTracks(context = state.currentView) {
    let list = [];
    
    if (context === 'home' || context === 'explore' || context === 'library') {
      list = state.tracks.slice();
    } else if (context === 'favorites') {
      list = state.tracks.filter(t => isFavorite(t.id));
    } else if (context === 'recent') {
      list = state.recent
        .map(id => state.tracks.find(t => t.id === id))
        .filter(Boolean);
    } else if (context === 'queue') {
      list = state.queue.map(id => state.tracks.find(t => t.id === id)).filter(Boolean);
    } else if (context.startsWith('playlist-')) {
      const plId = context.replace('playlist-', '');
      const pl = state.playlists.find(p => p.id === plId);
      list = pl ? pl.trackIds.map(id => state.tracks.find(t => t.id === id)).filter(Boolean) : [];
    } else if (context.startsWith('artist-')) {
      const artist = context.replace('artist-', '');
      list = state.tracks.filter(t => t.artist === artist);
    } else if (context.startsWith('album-')) {
      const album = context.replace('album-', '');
      list = state.tracks.filter(t => t.album === album);
    } else if (context.startsWith('genre-')) {
      const genre = context.replace('genre-', '');
      list = state.tracks.filter(t => t.genre === genre);
    } else if (context.startsWith('mood-')) {
      const mood = context.replace('mood-', '');
      list = state.tracks.filter(t => t.mood === mood);
    } else if (context === 'search') {
      list = state.tracks.slice();
    }
    
    // Apply search
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
      );
    }
    
    return list;
  }

  // ==========================================
  // NAVIGATION
  // ==========================================
  function setView(view) {
    state.previousView = state.currentView;
    state.currentView = view;
    updateActiveNav();
    renderCurrentView();
    
    if (window.innerWidth <= 1024) {
      dom.sidebar.classList.remove('open');
    }
    
    // Scroll to top
    dom.content.scrollTop = 0;
  }

  function updateActiveNav() {
    $$('.nav-item').forEach(el => {
      const view = el.dataset.view;
      const isActive = view === state.currentView ||
        (view === 'playlists' && state.currentView.startsWith('playlist-')) ||
        (view === 'artists' && state.currentView.startsWith('artist-')) ||
        (view === 'albums' && state.currentView.startsWith('album-'));
      el.classList.toggle('active', isActive);
    });
    
    $$('.mobile-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === state.currentView);
    });
  }

  // ==========================================
  // RENDER VIEWS
  // ==========================================
  function renderCurrentView() {
    const view = state.currentView;
    
    if (view === 'home') renderHome();
    else if (view === 'explore') renderExplore();
    else if (view === 'library') renderLibrary();
    else if (view === 'playlists') renderPlaylists();
    else if (view.startsWith('playlist-')) renderPlaylistDetail();
    else if (view === 'artists') renderArtists();
    else if (view.startsWith('artist-')) renderArtistDetail();
    else if (view === 'albums') renderAlbums();
    else if (view.startsWith('album-')) renderAlbumDetail();
    else if (view === 'queue') renderQueue();
    else if (view === 'statistics') renderStatistics();
    else if (view === 'settings') renderSettings();
    else if (view === 'about') renderAbout();
    else if (view === 'search') renderSearch();
    else if (view === 'favorites') renderFavorites();
    else if (view === 'recent') renderRecent();
  }

  function renderHome() {
    const recentTracks = state.recent.slice(0, 6).map(id => state.tracks.find(t => t.id === id)).filter(Boolean);
    const topTracks = [...state.tracks].sort((a, b) => (state.playCounts[b.id] || 0) - (state.playCounts[a.id] || 0)).slice(0, 6);
    const newTracks = state.tracks.slice(-6);
    
    let html = `
      <div class="hero">
        <div class="hero-content">
          <h1>CoreMusic</h1>
          <p>Your Sound. Your World. Premium musiqa tajribasi.</p>
        </div>
      </div>
    `;
    
    if (recentTracks.length > 0) {
      html += `
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Davom ettirish</h2>
          </div>
          <div class="track-grid">
            ${recentTracks.map(t => renderTrackCard(t)).join('')}
          </div>
        </div>
      `;
    }
    
    if (topTracks.length > 0) {
      html += `
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Eng ko'p tinglangan</h2>
          </div>
          <div class="track-grid">
            ${topTracks.map(t => renderTrackCard(t)).join('')}
          </div>
        </div>
      `;
    }
    
    if (newTracks.length > 0) {
      html += `
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Yangi qo'shilgan</h2>
          </div>
          <div class="track-grid">
            ${newTracks.map(t => renderTrackCard(t)).join('')}
          </div>
        </div>
      `;
    }
    
    if (state.tracks.length === 0) {
      html = renderEmpty('Kutubxona bo\'sh', 'index.html fayliga qo\'shiqlar qo\'shing');
    }
    
    dom.content.innerHTML = html;
    bindTrackCards();
  }

  function renderExplore() {
    const genres = [...new Set(state.tracks.map(t => t.genre))];
    const moods = [...new Set(state.tracks.map(t => t.mood))];
    
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Janrlar</h2>
        </div>
        <div class="category-grid">
          ${genres.map(g => `
            <div class="category-card" data-genre="${escapeHtml(g)}">
              <div class="category-card-bg"></div>
              <div class="category-card-content">
                <div class="category-card-title">${escapeHtml(g)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Kayfiyat</h2>
        </div>
        <div class="category-grid">
          ${moods.map(m => `
            <div class="category-card" data-mood="${escapeHtml(m)}">
              <div class="category-card-bg"></div>
              <div class="category-card-content">
                <div class="category-card-title">${escapeHtml(m)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    dom.content.innerHTML = html;
    
    $$('.category-card[data-genre]').forEach(card => {
      card.addEventListener('click', () => {
        setView('genre-' + card.dataset.genre);
      });
    });
    
    $$('.category-card[data-mood]').forEach(card => {
      card.addEventListener('click', () => {
        setView('mood-' + card.dataset.mood);
      });
    });
  }

  function renderLibrary() {
    const tracks = getFilteredTracks('library');
    
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Barcha qo'shiqlar</h2>
          <span style="color:var(--text-dim)">${tracks.length} ta</span>
        </div>
        <div class="track-list">
          ${tracks.map((t, idx) => renderTrackItem(t, idx)).join('')}
        </div>
      </div>
    `;
    
    if (tracks.length === 0) {
      html = renderEmpty('Qo\'shiqlar topilmadi', 'Qidiruvni o\'zgartiring');
    }
    
    dom.content.innerHTML = html;
    bindTrackItems();
  }

  function renderPlaylists() {
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Playlistlar</h2>
          <button class="btn primary" id="createPlaylistBtn">+ Yangi playlist</button>
        </div>
        <div class="track-grid">
          <div class="track-card" id="newPlaylistCard" style="border-style:dashed;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:48px;height:48px;margin-bottom:12px;color:var(--text-mute)">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <div style="color:var(--text-dim)">Yangi playlist</div>
          </div>
          ${state.playlists.map(pl => `
            <div class="track-card" data-playlist-id="${escapeHtml(pl.id)}">
              <div class="track-card-cover">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div class="track-card-title">${escapeHtml(pl.name)}</div>
              <div class="track-card-artist">${pl.trackIds.length} ta qo'shiq</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    dom.content.innerHTML = html;
    
    $('#createPlaylistBtn').addEventListener('click', openCreatePlaylistModal);
    $('#newPlaylistCard').addEventListener('click', openCreatePlaylistModal);
    
    $$('[data-playlist-id]').forEach(card => {
      card.addEventListener('click', () => {
        setView('playlist-' + card.dataset.playlistId);
      });
    });
  }

  function renderPlaylistDetail() {
    const plId = state.currentView.replace('playlist-', '');
    const pl = state.playlists.find(p => p.id === plId);
    if (!pl) {
      setView('playlists');
      return;
    }
    
    const tracks = pl.trackIds.map(id => state.tracks.find(t => t.id === id)).filter(Boolean);
    
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${escapeHtml(pl.name)}</h2>
          <div style="display:flex;gap:8px">
            <button class="btn primary" id="playPlaylistBtn">▶ Ijro etish</button>
            <button class="btn danger" id="deletePlaylistBtn">O'chirish</button>
          </div>
        </div>
        <div class="track-list">
          ${tracks.map((t, idx) => renderTrackItem(t, idx, true)).join('')}
        </div>
      </div>
    `;
    
    if (tracks.length === 0) {
      html = `
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">${escapeHtml(pl.name)}</h2>
            <button class="btn danger" id="deletePlaylistBtn">O'chirish</button>
          </div>
          ${renderEmpty('Playlist bo\'sh', 'Qo\'shiqlarni kutubxonadan qo\'shing')}
        </div>
      `;
    }
    
    dom.content.innerHTML = html;
    
    $('#deletePlaylistBtn').addEventListener('click', () => {
      if (confirm('Playlistni o\'chirasizmi?')) {
        state.playlists = state.playlists.filter(p => p.id !== plId);
        saveStorage();
        setView('playlists');
        showToast('Playlist o\'chirildi');
      }
    });
    
    if ($('#playPlaylistBtn')) {
      $('#playPlaylistBtn').addEventListener('click', () => {
        if (tracks.length > 0) {
          state.currentView = 'playlist-' + plId;
          loadTrack(0, true);
        }
      });
    }
    
    bindTrackItems(true);
  }

  function renderArtists() {
    const artists = [...new Set(state.tracks.map(t => t.artist))];
    
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Ijrochilar</h2>
        </div>
        <div class="track-grid">
          ${artists.map(a => `
            <div class="track-card" data-artist="${escapeHtml(a)}">
              <div class="track-card-cover">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="track-card-title">${escapeHtml(a)}</div>
              <div class="track-card-artist">${state.tracks.filter(t => t.artist === a).length} ta qo'shiq</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    dom.content.innerHTML = html;
    
    $$('[data-artist]').forEach(card => {
      card.addEventListener('click', () => {
        setView('artist-' + card.dataset.artist);
      });
    });
  }

  function renderArtistDetail() {
    const artist = state.currentView.replace('artist-', '');
    const tracks = state.tracks.filter(t => t.artist === artist);
    
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${escapeHtml(artist)}</h2>
          <button class="btn primary" id="playArtistBtn">▶ Ijro etish</button>
        </div>
        <div class="track-list">
          ${tracks.map((t, idx) => renderTrackItem(t, idx)).join('')}
        </div>
      </div>
    `;
    
    dom.content.innerHTML = html;
    
    $('#playArtistBtn').addEventListener('click', () => {
      if (tracks.length > 0) {
        state.currentView = 'artist-' + artist;
        loadTrack(0, true);
      }
    });
    
    bindTrackItems();
  }

  function renderAlbums() {
    const albums = [...new Set(state.tracks.map(t => t.album))];
    
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Albomlar</h2>
        </div>
        <div class="track-grid">
          ${albums.map(a => `
            <div class="track-card" data-album="${escapeHtml(a)}">
              <div class="track-card-cover">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div class="track-card-title">${escapeHtml(a)}</div>
              <div class="track-card-artist">${state.tracks.filter(t => t.album === a).length} ta trek</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    dom.content.innerHTML = html;
    
    $$('[data-album]').forEach(card => {
      card.addEventListener('click', () => {
        setView('album-' + card.dataset.album);
      });
    });
  }

  function renderAlbumDetail() {
    const album = state.currentView.replace('album-', '');
    const tracks = state.tracks.filter(t => t.album === album);
    
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${escapeHtml(album)}</h2>
          <button class="btn primary" id="playAlbumBtn">▶ Ijro etish</button>
        </div>
        <div class="track-list">
          ${tracks.map((t, idx) => renderTrackItem(t, idx)).join('')}
        </div>
      </div>
    `;
    
    dom.content.innerHTML = html;
    
    $('#playAlbumBtn').addEventListener('click', () => {
      if (tracks.length > 0) {
        state.currentView = 'album-' + album;
        loadTrack(0, true);
      }
    });
    
    bindTrackItems();
  }

  function renderQueue() {
    const tracks = state.queue.map(id => state.tracks.find(t => t.id === id)).filter(Boolean);
    
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Navbat</h2>
          ${tracks.length > 0 ? '<button class="btn ghost" id="clearQueueBtn">Tozalash</button>' : ''}
        </div>
        <div class="track-list">
          ${tracks.map((t, idx) => renderTrackItem(t, idx, false, true)).join('')}
        </div>
      </div>
    `;
    
    if (tracks.length === 0) {
      html = renderEmpty('Navbat bo\'sh', 'Qo\'shiqlarni navbatga qo\'shing');
    }
    
    dom.content.innerHTML = html;
    
    if ($('#clearQueueBtn')) {
      $('#clearQueueBtn').addEventListener('click', () => {
        state.queue = [];
        saveStorage();
        renderQueue();
        showToast('Navbat tozalandi');
      });
    }
    
    bindTrackItems(false, true);
  }

  function renderStatistics() {
    const totalPlays = Object.values(state.playCounts).reduce((sum, c) => sum + c, 0);
    const topTracks = [...state.tracks]
      .sort((a, b) => (state.playCounts[b.id] || 0) - (state.playCounts[a.id] || 0))
      .slice(0, 10);
    
    const artistCounts = {};
    state.tracks.forEach(t => {
      artistCounts[t.artist] = (artistCounts[t.artist] || 0) + (state.playCounts[t.id] || 0);
    });
    const topArtists = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    let html = `
      <div class="section">
        <h2 class="section-title" style="margin-bottom:24px">Statistika</h2>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:32px">
          <div style="background:var(--surface);padding:24px;border-radius:var(--radius);border:1px solid var(--border)">
            <div style="font-size:32px;font-weight:700;color:var(--accent)">${totalPlays}</div>
            <div style="color:var(--text-dim);margin-top:4px">Umumiy tinglashlar</div>
          </div>
          <div style="background:var(--surface);padding:24px;border-radius:var(--radius);border:1px solid var(--border)">
            <div style="font-size:32px;font-weight:700;color:var(--accent)">${state.tracks.length}</div>
            <div style="color:var(--text-dim);margin-top:4px">Qo'shiqlar</div>
          </div>
          <div style="background:var(--surface);padding:24px;border-radius:var(--radius);border:1px solid var(--border)">
            <div style="font-size:32px;font-weight:700;color:var(--accent)">${state.favorites.length}</div>
            <div style="color:var(--text-dim);margin-top:4px">Sevimlilar</div>
          </div>
        </div>
        
        <h3 style="font-size:18px;margin-bottom:16px">Eng ko'p tinglangan qo'shiqlar</h3>
        <div class="track-list">
          ${topTracks.map((t, idx) => renderTrackItem(t, idx)).join('')}
        </div>
        
        ${topArtists.length > 0 ? `
          <h3 style="font-size:18px;margin:32px 0 16px">Eng ko'p tinglangan ijrochilar</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${topArtists.map(([artist, count]) => `
              <div style="background:var(--surface);padding:16px;border-radius:var(--radius-sm);border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
                <span style="font-weight:600">${escapeHtml(artist)}</span>
                <span style="color:var(--text-dim)">${count} marta</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    if (totalPlays === 0) {
      html = renderEmpty('Statistika bo\'sh', 'Qo\'shiqlarni tinglang, statistika shu yerda ko\'rinadi');
    }
    
    dom.content.innerHTML = html;
    bindTrackItems();
  }

  function renderSettings() {
    let html = `
      <div class="section">
        <h2 class="section-title" style="margin-bottom:24px">Sozlamalar</h2>
        
        <div style="display:flex;flex-direction:column;gap:16px;max-width:600px">
          <div style="background:var(--surface);padding:20px;border-radius:var(--radius);border:1px solid var(--border)">
            <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
              <span style="font-weight:600">Animatsiyalar</span>
              <input type="checkbox" id="settingAnimations" ${state.settings.animations ? 'checked' : ''} style="width:20px;height:20px;cursor:pointer" />
            </label>
          </div>
          
          <div style="background:var(--surface);padding:20px;border-radius:var(--radius);border:1px solid var(--border)">
            <label style="display:block;margin-bottom:12px;font-weight:600">Fon intensivligi</label>
            <input type="range" id="settingBgIntensity" min="0" max="1" step="0.1" value="${state.settings.bgIntensity}" style="width:100%;cursor:pointer" />
          </div>
          
          <div style="background:var(--surface);padding:20px;border-radius:var(--radius);border:1px solid var(--border)">
            <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
              <span style="font-weight:600">Kamaytirilgan harakat</span>
              <input type="checkbox" id="settingReducedMotion" ${state.settings.reducedMotion ? 'checked' : ''} style="width:20px;height:20px;cursor:pointer" />
            </label>
          </div>
          
          <div style="background:var(--surface);padding:20px;border-radius:var(--radius);border:1px solid var(--border)">
            <button class="btn danger" id="clearDataBtn" style="width:100%">Barcha ma'lumotlarni tozalash</button>
          </div>
        </div>
      </div>
    `;
    
    dom.content.innerHTML = html;
    
    $('#settingAnimations').addEventListener('change', (e) => {
      state.settings.animations = e.target.checked;
      saveStorage();
      updateBackgroundVisibility();
    });
    
    $('#settingBgIntensity').addEventListener('input', (e) => {
      state.settings.bgIntensity = parseFloat(e.target.value);
      saveStorage();
      updateBackgroundIntensity();
    });
    
    $('#settingReducedMotion').addEventListener('change', (e) => {
      state.settings.reducedMotion = e.target.checked;
      saveStorage();
      updateBackgroundVisibility();
    });
    
    $('#clearDataBtn').addEventListener('click', () => {
      if (confirm('Barcha ma\'lumotlar o\'chiriladi. Davom etasizmi?')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });
  }

  function renderAbout() {
    let html = `
      <div class="section">
        <h2 class="section-title" style="margin-bottom:24px">CoreMusic haqida</h2>
        
        <div style="background:var(--surface);padding:32px;border-radius:var(--radius);border:1px solid var(--border);max-width:700px">
          <h3 style="font-size:24px;margin-bottom:16px;background:var(--accent-grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">
            Premium Futuristic Music Experience
          </h3>
          <p style="color:var(--text-dim);line-height:1.8;margin-bottom:16px">
            CoreMusic — zamonaviy, premium musiqa web-ilovasi. Liquid Glass dizayni, jonli animatsiyali fon, 
            cinematic kirish animatsiyasi va to'liq funksional musiqa playeri bilan jihozlangan.
          </p>
          <p style="color:var(--text-dim);line-height:1.8;margin-bottom:24px">
            Barcha qo'shiqlar HTML orqali ulanadi, JavaScript avtomatik ravishda kutubxonani shakllantiradi.
            Playlistlar, sevimlilar va sozlamalar localStorage'da saqlanadi.
          </p>
          
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-top:24px">
            <div>
              <div style="font-size:12px;color:var(--text-mute);text-transform:uppercase;letter-spacing:1px">Versiya</div>
              <div style="font-size:18px;font-weight:600;margin-top:4px">2.0</div>
            </div>
            <div>
              <div style="font-size:12px;color:var(--text-mute);text-transform:uppercase;letter-spacing:1px">Texnologiyalar</div>
              <div style="font-size:18px;font-weight:600;margin-top:4px">HTML5, CSS3, JS</div>
            </div>
            <div>
              <div style="font-size:12px;color:var(--text-mute);text-transform:uppercase;letter-spacing:1px">Dizayn</div>
              <div style="font-size:18px;font-weight:600;margin-top:4px">Liquid Glass</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    dom.content.innerHTML = html;
  }

  function renderSearch() {
    const tracks = getFilteredTracks('search');
    
    let html = `
      <div class="section">
        <h2 class="section-title" style="margin-bottom:24px">Qidiruv natijalari</h2>
        ${state.searchQuery ? `
          <p style="color:var(--text-dim);margin-bottom:20px">"${escapeHtml(state.searchQuery)}" uchun ${tracks.length} ta natija</p>
        ` : ''}
        <div class="track-list">
          ${tracks.map((t, idx) => renderTrackItem(t, idx)).join('')}
        </div>
      </div>
    `;
    
    if (tracks.length === 0 && state.searchQuery) {
      html = renderEmpty('Hech narsa topilmadi', 'Boshqa kalit so\'z bilan sinab ko\'ring');
    } else if (!state.searchQuery) {
      html = renderEmpty('Qidiruv', 'Qo\'shiq, ijrochi, albom yoki janr nomini kiriting');
    }
    
    dom.content.innerHTML = html;
    bindTrackItems();
  }

  function renderFavorites() {
    const tracks = getFilteredTracks('favorites');
    
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Sevimlilar</h2>
          ${tracks.length > 0 ? `<button class="btn primary" id="playFavoritesBtn">▶ Ijro etish</button>` : ''}
        </div>
        <div class="track-list">
          ${tracks.map((t, idx) => renderTrackItem(t, idx)).join('')}
        </div>
      </div>
    `;
    
    if (tracks.length === 0) {
      html = renderEmpty('Sevimlilar bo\'sh', 'Qo\'shiqlarni ♥ belgisi bilan saqlang');
    }
    
    dom.content.innerHTML = html;
    
    if ($('#playFavoritesBtn')) {
      $('#playFavoritesBtn').addEventListener('click', () => {
        state.currentView = 'favorites';
        loadTrack(0, true);
      });
    }
    
    bindTrackItems();
  }

  function renderRecent() {
    const tracks = getFilteredTracks('recent');
    
    let html = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Yaqinda tinglangan</h2>
          ${tracks.length > 0 ? `<button class="btn primary" id="playRecentBtn">▶ Ijro etish</button>` : ''}
        </div>
        <div class="track-list">
          ${tracks.map((t, idx) => renderTrackItem(t, idx)).join('')}
        </div>
      </div>
    `;
    
    if (tracks.length === 0) {
      html = renderEmpty('Yaqinda tinglanganlar bo\'sh', 'Qo\'shiqlarni tinglang, shu yerda ko\'rinadi');
    }
    
    dom.content.innerHTML = html;
    
    if ($('#playRecentBtn')) {
      $('#playRecentBtn').addEventListener('click', () => {
        state.currentView = 'recent';
        loadTrack(0, true);
      });
    }
    
    bindTrackItems();
  }

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  function renderTrackCard(track) {
    const isPlaying = state.tracks[state.currentIndex]?.id === track.id && state.isPlaying;
    
    return `
      <div class="track-card ${isPlaying ? 'playing' : ''}" data-track-id="${escapeHtml(track.id)}">
        <div class="track-card-cover">
          ${track.cover
            ? `<img src="${escapeHtml(track.cover)}" alt="" loading="lazy" />`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                 <path d="M9 18V5l12-2v13"/>
                 <circle cx="6" cy="18" r="3"/>
                 <circle cx="18" cy="16" r="3"/>
               </svg>`}
          <button class="track-card-play">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
        <div class="track-card-title">${escapeHtml(track.title)}</div>
        <div class="track-card-artist">${escapeHtml(track.artist)}</div>
      </div>
    `;
  }

  function renderTrackItem(track, index, inPlaylist = false, inQueue = false) {
    const isPlaying = state.tracks[state.currentIndex]?.id === track.id && state.isPlaying;
    const faved = isFavorite(track.id);
    
    return `
      <div class="track-item ${isPlaying ? 'playing' : ''}" data-track-id="${escapeHtml(track.id)}" data-index="${index}">
        <div class="track-cover">
          ${track.cover
            ? `<img src="${escapeHtml(track.cover)}" alt="" loading="lazy" />`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                 <path d="M9 18V5l12-2v13"/>
                 <circle cx="6" cy="18" r="3"/>
                 <circle cx="18" cy="16" r="3"/>
               </svg>`}
        </div>
        <div class="track-info">
          <div class="track-title">${escapeHtml(track.title)}</div>
          <div class="track-artist">${escapeHtml(track.artist)}</div>
        </div>
        <div class="track-meta">
          <span class="track-genre">${escapeHtml(track.genre)}</span>
        </div>
        <div class="track-actions">
          <button class="icon-btn ${faved ? 'faved' : ''}" data-action="fav" data-id="${escapeHtml(track.id)}" title="Sevimli">
            <svg viewBox="0 0 24 24" fill="${faved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          ${!inQueue ? `
            <button class="icon-btn" data-action="queue" data-id="${escapeHtml(track.id)}" title="Navbatga qo'shish">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          ` : `
            <button class="icon-btn" data-action="remove-queue" data-id="${escapeHtml(track.id)}" title="Navbatdan olib tashlash">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          `}
          ${inPlaylist ? `
            <button class="icon-btn" data-action="remove-playlist" data-id="${escapeHtml(track.id)}" title="Playlistdan olib tashlash">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderEmpty(title, desc) {
    return `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(desc)}</p>
      </div>
    `;
  }

  function bindTrackCards() {
    $$('.track-card[data-track-id]').forEach(card => {
      card.addEventListener('click', () => {
        const trackId = card.dataset.trackId;
        const tracks = getFilteredTracks();
        const idx = tracks.findIndex(t => t.id === trackId);
        if (idx >= 0) {
          loadTrack(idx, true);
        }
      });
    });
  }

  function bindTrackItems(inPlaylist = false, inQueue = false) {
    $$('.track-item[data-track-id]').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return;
        
        const trackId = item.dataset.trackId;
        const tracks = getFilteredTracks();
        const idx = tracks.findIndex(t => t.id === trackId);
        if (idx >= 0) {
          loadTrack(idx, true);
        }
      });
    });
    
    $$('[data-action="fav"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.id);
      });
    });
    
    $$('[data-action="queue"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToQueue(btn.dataset.id);
      });
    });
    
    $$('[data-action="remove-queue"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromQueue(btn.dataset.id);
      });
    });
    
    $$('[data-action="remove-playlist"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.currentView.startsWith('playlist-')) {
          const plId = state.currentView.replace('playlist-', '');
          removeFromPlaylist(plId, btn.dataset.id);
        }
      });
    });
  }

  // ==========================================
  // QUEUE MANAGEMENT
  // ==========================================
  function addToQueue(trackId) {
    if (!state.queue.includes(trackId)) {
      state.queue.push(trackId);
      saveStorage();
      showToast('Navbatga qo\'shildi');
    } else {
      showToast('Allaqachon navbatda');
    }
  }

  function removeFromQueue(trackId) {
    state.queue = state.queue.filter(id => id !== trackId);
    saveStorage();
    renderQueue();
    showToast('Navbatdan olib tashlandi');
  }

  // ==========================================
  // PLAYLIST MANAGEMENT
  // ==========================================
  function openCreatePlaylistModal() {
    dom.modalCard.innerHTML = `
      <h3>Yangi playlist</h3>
      <input type="text" id="playlistNameInput" placeholder="Playlist nomi..." />
      <div class="modal-actions">
        <button class="btn ghost" data-modal-close>Bekor</button>
        <button class="btn primary" id="savePlaylistBtn">Yaratish</button>
      </div>
    `;
    
    dom.modal.classList.remove('hidden');
    
    setTimeout(() => {
      const input = $('#playlistNameInput');
      input.focus();
      
      $('#savePlaylistBtn').addEventListener('click', () => {
        const name = input.value.trim();
        if (!name) {
          showToast('Nom kiriting');
          return;
        }
        createPlaylist(name);
        closeModal();
      });
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          $('#savePlaylistBtn').click();
        }
      });
    }, 100);
  }

  function createPlaylist(name) {
    const pl = { id: uid(), name: name.trim(), trackIds: [] };
    state.playlists.push(pl);
    saveStorage();
    renderCurrentView();
    showToast('Playlist yaratildi');
  }

  function removeFromPlaylist(playlistId, trackId) {
    const pl = state.playlists.find(p => p.id === playlistId);
    if (!pl) return;
    pl.trackIds = pl.trackIds.filter(id => id !== trackId);
    saveStorage();
    renderPlaylistDetail();
    showToast('Playlistdan olib tashlandi');
  }

  function closeModal() {
    dom.modal.classList.add('hidden');
  }

  // ==========================================
  // BACKGROUND ANIMATION
  // ==========================================
  let bgCtx, bgAnimId;
  const particles = [];

  function initBackground() {
    const canvas = dom.bgCanvas;
    bgCtx = canvas.getContext('2d');
    
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    animateBackground();
  }

  function animateBackground() {
    if (!state.settings.animations || state.settings.reducedMotion) {
      bgAnimId = requestAnimationFrame(animateBackground);
      return;
    }
    
    const canvas = dom.bgCanvas;
    bgCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(0, 229, 255, ${p.opacity * state.settings.bgIntensity})`;
      bgCtx.fill();
    });
    
    bgAnimId = requestAnimationFrame(animateBackground);
  }

  function updateBackgroundVisibility() {
    if (!state.settings.animations || state.settings.reducedMotion) {
      dom.bgCanvas.style.opacity = '0';
    } else {
      dom.bgCanvas.style.opacity = '0.6';
    }
  }

  function updateBackgroundIntensity() {
    // Intensity applied in animation loop
  }

  // ==========================================
  // INTRO ANIMATION
  // ==========================================
  function playIntro() {
    setTimeout(() => {
      dom.intro.style.animation = 'introFadeOut 0.8s ease forwards';
      setTimeout(() => {
        dom.intro.classList.add('hidden');
        state.introCompleted = true;
      }, 800);
    }, 2500);
  }

  function skipIntro() {
    dom.intro.style.animation = 'introFadeOut 0.3s ease forwards';
    setTimeout(() => {
      dom.intro.classList.add('hidden');
      state.introCompleted = true;
    }, 300);
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  function bindEvents() {
    // Navigation
    $$('.nav-item').forEach(el => {
      el.addEventListener('click', () => setView(el.dataset.view));
    });
    
    $$('.mobile-nav-item').forEach(el => {
      el.addEventListener('click', () => setView(el.dataset.view));
    });
    
    // Mobile menu
    dom.menuBtn.addEventListener('click', () => {
      dom.sidebar.classList.toggle('open');
    });
    
    // Intro skip
    dom.introSkip.addEventListener('click', skipIntro);
    
    // Player controls
    dom.playBtn.addEventListener('click', togglePlay);
    dom.prevBtn.addEventListener('click', playPrev);
    dom.nextBtn.addEventListener('click', () => playNext(false));
    
    dom.shuffleBtn.addEventListener('click', () => {
      state.shuffle = !state.shuffle;
      dom.shuffleBtn.classList.toggle('active', state.shuffle);
      if (dom.npfShuffle) dom.npfShuffle.classList.toggle('active', state.shuffle);
      saveStorage();
      showToast(state.shuffle ? 'Tasodifiy: yoqildi' : 'Tasodifiy: o\'chirildi');
    });
    
    dom.repeatBtn.addEventListener('click', () => {
      state.repeat = state.repeat === 'none' ? 'all' : state.repeat === 'all' ? 'one' : 'none';
      dom.repeatBtn.classList.toggle('active', state.repeat !== 'none');
      if (dom.npfRepeat) dom.npfRepeat.classList.toggle('active', state.repeat !== 'none');
      saveStorage();
      showToast('Takror: ' + state.repeat);
    });
    
    // Progress
    dom.progress.addEventListener('click', (e) => seek(e));
    let dragging = false;
    dom.progress.addEventListener('mousedown', (e) => {
      dragging = true;
      seek(e);
    });
    document.addEventListener('mousemove', (e) => {
      if (dragging) seek(e);
    });
    document.addEventListener('mouseup', () => { dragging = false; });
    
    // Volume
    dom.volume.addEventListener('input', () => {
      state.volume = parseFloat(dom.volume.value);
      if (state.audio) state.audio.volume = state.volume;
      state.muted = state.volume === 0;
      saveStorage();
    });
    
    dom.muteBtn.addEventListener('click', () => {
      if (!state.audio) return;
      if (state.volume > 0) {
        state.lastVolume = state.volume;
        state.audio.volume = 0;
        dom.volume.value = 0;
        state.muted = true;
      } else {
        state.audio.volume = state.lastVolume || 0.8;
        dom.volume.value = state.lastVolume || 0.8;
        state.volume = state.lastVolume || 0.8;
        state.muted = false;
      }
    });
    
    // Player fav
    dom.playerFavBtn.addEventListener('click', () => {
      const tracks = getFilteredTracks();
      if (state.currentIndex >= 0 && state.currentIndex < tracks.length) {
        toggleFavorite(tracks[state.currentIndex].id);
      }
    });
    
    // Now Playing Full
    dom.nowPlayingMini.addEventListener('click', () => {
      dom.nowPlayingFull.classList.remove('hidden');
    });
    
    dom.npfClose.addEventListener('click', () => {
      dom.nowPlayingFull.classList.add('hidden');
    });
    
    dom.npfPlay.addEventListener('click', togglePlay);
    dom.npfPrev.addEventListener('click', playPrev);
    dom.npfNext.addEventListener('click', () => playNext(false));
    
    dom.npfShuffle.addEventListener('click', () => {
      dom.shuffleBtn.click();
    });
    
    dom.npfRepeat.addEventListener('click', () => {
      dom.repeatBtn.click();
    });
    
    if (dom.npfProgress) {
      dom.npfProgress.addEventListener('click', (e) => seek(e, dom.npfProgress));
    }
    
    // Search
    dom.globalSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (state.currentView !== 'search' && state.searchQuery) {
        setView('search');
      } else if (state.currentView === 'search') {
        renderSearch();
      }
    });
    
    // Modal close
    $$('[data-modal-close]').forEach(el => {
      el.addEventListener('click', closeModal);
    });
    
    dom.modal.addEventListener('click', (e) => {
      if (e.target === dom.modal) closeModal();
    });
    
    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && e.ctrlKey) {
        playNext(false);
      } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
        playPrev();
      } else if (e.code === 'Escape') {
        if (!dom.nowPlayingFull.classList.contains('hidden')) {
          dom.nowPlayingFull.classList.add('hidden');
        } else if (!dom.modal.classList.contains('hidden')) {
          closeModal();
        }
      }
    });
    
    // Click outside sidebar
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 &&
          dom.sidebar.classList.contains('open') &&
          !dom.sidebar.contains(e.target) &&
          e.target !== dom.menuBtn &&
          !dom.menuBtn.contains(e.target)) {
        dom.sidebar.classList.remove('open');
      }
    });
  }

  // ==========================================
  // INIT
  // ==========================================
  function init() {
    loadStorage();
    loadTracksFromHTML();
    createAudio();
    
    // Apply settings
    dom.volume.value = state.volume;
    if (state.audio) state.audio.volume = state.volume;
    dom.shuffleBtn.classList.toggle('active', state.shuffle);
    dom.repeatBtn.classList.toggle('active', state.repeat !== 'none');
    
    if (dom.npfShuffle) dom.npfShuffle.classList.toggle('active', state.shuffle);
    if (dom.npfRepeat) dom.npfRepeat.classList.toggle('active', state.repeat !== 'none');
    
    // Create visualizer bars
    if (dom.npfVisualizer) {
      for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'npf-visualizer-bar';
        bar.style.animationDelay = `${Math.random() * 1}s`;
        dom.npfVisualizer.appendChild(bar);
      }
    }
    
    bindEvents();
    initBackground();
    updateBackgroundVisibility();
    playIntro();
    renderCurrentView();
    
    if (state.tracks.length === 0) {
      setTimeout(() => {
        showToast('Qo\'shiqlar topilmadi. index.html fayliga audio elementlar qo\'shing');
      }, 3000);
    }
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();