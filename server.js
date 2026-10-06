const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// In-memory database
const database = {
  users: [
    { id: 'u1', email: 'demo@coremusic.com', password: 'coremusic123', name: 'Demo User', avatar: '👤', bio: 'Music lover' }
  ],
  tracks: [
    { id: 't1', title: 'Первый раз', artist: 'MORGENSHTERN', album: 'Genesis', genre: 'Hip-Hop', mood: 'Energetic', duration: '3:18', cover: '🎵', plays: 1250, date: '2024-01-15' },
    { id: 't2', title: 'Группа крови', artist: 'MORGENSHTERN', album: 'Dark Times', genre: 'Hip-Hop', mood: 'Dark', duration: '3:45', cover: '🎧', plays: 980, date: '2024-01-10' },
    { id: 't3', title: '12', artist: 'Morgenshtern', album: 'Focus', genre: 'Rap', mood: 'Focus', duration: '2:56', cover: '🔥', plays: 1100, date: '2024-01-05' },
    { id: 't4', title: 'Midnight Echo', artist: 'Nova Lane', album: 'Nights', genre: 'Electronic', mood: 'Night', duration: '4:12', cover: '🌙', plays: 850, date: '2024-01-20' },
    { id: 't5', title: 'Aurora Drift', artist: 'Luma', album: 'Synthwave', genre: 'Synthwave', mood: 'Chill', duration: '3:54', cover: '✨', plays: 720, date: '2024-01-18' },
    { id: 't6', title: 'City Lights', artist: 'Kairo', album: 'Urban', genre: 'Pop', mood: 'Vibes', duration: '4:06', cover: '🌃', plays: 1400, date: '2024-01-22' },
    { id: 't7', title: 'Skyline', artist: 'Avi', album: 'Travel', genre: 'Electronic', mood: 'Travel', duration: '3:21', cover: '🚀', plays: 630, date: '2024-01-12' },
    { id: 't8', title: 'Golden Hour', artist: 'Mira', album: 'Sunset', genre: 'Pop', mood: 'Mood', duration: '3:08', cover: '☀️', plays: 950, date: '2024-01-25' }
  ],
  playlists: [
    { id: 'p1', name: 'My Favorites', creator: 'u1', tracks: ['t1', 't4', 't6'], cover: '❤️', date: '2024-01-01' },
    { id: 'p2', name: 'Workout Hits', creator: 'u1', tracks: ['t3', 't6'], cover: '💪', date: '2024-01-05' },
    { id: 'p3', name: 'Night Vibes', creator: 'u1', tracks: ['t4', 't5'], cover: '🌙', date: '2024-01-10' }
  ],
  albums: [
    { id: 'a1', name: 'Genesis', artist: 'MORGENSHTERN', cover: '📀', tracks: ['t1'], year: 2024 },
    { id: 'a2', name: 'Dark Times', artist: 'MORGENSHTERN', cover: '⚫', tracks: ['t2'], year: 2024 },
    { id: 'a3', name: 'Nights', artist: 'Nova Lane', cover: '🌃', tracks: ['t4'], year: 2024 },
    { id: 'a4', name: 'Urban', artist: 'Kairo', cover: '🏙️', tracks: ['t6'], year: 2024 }
  ],
  favorites: { u1: ['t1', 't4', 't6'] },
  sessions: {}
};

// Helper functions
function generateToken(userId) {
  return `token-${userId}-${Date.now()}`;
}

function verifyToken(token) {
  return token && token.startsWith('token-');
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'CoreMusic', version: '1.0.0' });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (database.users.some(u => u.email === email)) {
    return res.status(400).json({ ok: false, message: 'Email already exists' });
  }
  const user = {
    id: `u${Date.now()}`,
    email,
    password,
    name,
    avatar: '👤',
    bio: 'New CoreMusic user'
  };
  database.users.push(user);
  const token = generateToken(user.id);
  res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = database.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  const token = generateToken(user.id);
  res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name } });
});

// User routes
app.get('/api/user/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!verifyToken(token)) return res.status(401).json({ ok: false, message: 'Unauthorized' });
  const userId = token.split('-')[1];
  const user = database.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ ok: false, message: 'User not found' });
  res.json({ ok: true, user });
});

app.put('/api/user/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!verifyToken(token)) return res.status(401).json({ ok: false, message: 'Unauthorized' });
  const userId = token.split('-')[1];
  const user = database.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ ok: false, message: 'User not found' });
  Object.assign(user, req.body);
  res.json({ ok: true, user });
});

// Tracks routes
app.get('/api/tracks', (req, res) => {
  const { q, genre, sort } = req.query;
  let tracks = [...database.tracks];
  
  if (q) {
    const search = q.toLowerCase();
    tracks = tracks.filter(t => t.title.toLowerCase().includes(search) || t.artist.toLowerCase().includes(search));
  }
  
  if (genre && genre !== 'all') {
    tracks = tracks.filter(t => t.genre.toLowerCase() === genre.toLowerCase());
  }
  
  if (sort === 'plays') tracks.sort((a, b) => b.plays - a.plays);
  if (sort === 'date') tracks.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json(tracks);
});

app.get('/api/tracks/:id', (req, res) => {
  const track = database.tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ ok: false, message: 'Track not found' });
  res.json(track);
});

app.post('/api/tracks', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!verifyToken(token)) return res.status(401).json({ ok: false, message: 'Unauthorized' });
  
  const track = {
    id: `t${Date.now()}`,
    ...req.body,
    plays: 0,
    date: new Date().toISOString().split('T')[0],
    uploader: token.split('-')[1]
  };
  database.tracks.push(track);
  res.json({ ok: true, track });
});

// Playlists routes
app.get('/api/playlists', (req, res) => {
  res.json(database.playlists);
});

app.get('/api/playlists/:id', (req, res) => {
  const playlist = database.playlists.find(p => p.id === req.params.id);
  if (!playlist) return res.status(404).json({ ok: false, message: 'Playlist not found' });
  const tracks = playlist.tracks.map(tid => database.tracks.find(t => t.id === tid));
  res.json({ ...playlist, tracks });
});

app.post('/api/playlists', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!verifyToken(token)) return res.status(401).json({ ok: false, message: 'Unauthorized' });
  
  const playlist = {
    id: `p${Date.now()}`,
    ...req.body,
    creator: token.split('-')[1],
    tracks: req.body.tracks || [],
    date: new Date().toISOString().split('T')[0]
  };
  database.playlists.push(playlist);
  res.json({ ok: true, playlist });
});

// Albums routes
app.get('/api/albums', (req, res) => {
  res.json(database.albums);
});

app.get('/api/albums/:id', (req, res) => {
  const album = database.albums.find(a => a.id === req.params.id);
  if (!album) return res.status(404).json({ ok: false, message: 'Album not found' });
  const tracks = album.tracks.map(tid => database.tracks.find(t => t.id === tid));
  res.json({ ...album, tracks });
});

// Favorites routes
app.get('/api/favorites', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!verifyToken(token)) return res.status(401).json({ ok: false, message: 'Unauthorized' });
  const userId = token.split('-')[1];
  const favoriteIds = database.favorites[userId] || [];
  const tracks = favoriteIds.map(tid => database.tracks.find(t => t.id === tid));
  res.json(tracks.filter(Boolean));
});

app.post('/api/favorites/:trackId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!verifyToken(token)) return res.status(401).json({ ok: false, message: 'Unauthorized' });
  const userId = token.split('-')[1];
  if (!database.favorites[userId]) database.favorites[userId] = [];
  
  const idx = database.favorites[userId].indexOf(req.params.trackId);
  if (idx >= 0) database.favorites[userId].splice(idx, 1);
  else database.favorites[userId].push(req.params.trackId);
  
  res.json({ ok: true, favorites: database.favorites[userId] });
});

// Stats routes
app.get('/api/stats', (req, res) => {
  res.json({
    totalTracks: database.tracks.length,
    totalPlaylists: database.playlists.length,
    totalAlbums: database.albums.length,
    totalUsers: database.users.length,
    topTracks: [...database.tracks].sort((a, b) => b.plays - a.plays).slice(0, 5),
    recentTracks: [...database.tracks].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  });
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`CoreMusic running on http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
});
