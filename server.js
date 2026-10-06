const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const tracks = [
  {
    id: 'm1',
    title: 'Первый раз',
    artist: 'MORGENSHTERN',
    genre: 'Hip-Hop',
    mood: 'Energetic',
    duration: '3:18',
    cover: '🎵',
    color: 'linear-gradient(135deg,#7C3AED,#22D3EE)',
    audio: '/audio/MORGENSHTERN%20-%20%D0%9F%D0%B5%D1%80%D0%B2%D1%8B%D0%B9%20%D1%80%D0%B0%D0%B7.mp3'
  },
  {
    id: 'm2',
    title: 'Группа крови',
    artist: 'MORGENSHTERN',
    genre: 'Hip-Hop',
    mood: 'Dark',
    duration: '3:45',
    cover: '🎧',
    color: 'linear-gradient(135deg,#EF4444,#F59E0B)',
    audio: '/audio/MORGENSHTERN-%D0%93%D1%80%D1%83%D0%BF%D0%B0%20%D0%BA%D1%80%D0%BE%D0%B2%D0%B8.mp3'
  },
  {
    id: 'm3',
    title: '12',
    artist: 'Morgenshtern',
    genre: 'Rap',
    mood: 'Focus',
    duration: '2:56',
    cover: '🔥',
    color: 'linear-gradient(135deg,#10B981,#0EA5E9)',
    audio: '/audio/Morgenshtern%20-%2012.mp3'
  },
  {
    id: 'n1',
    title: 'Midnight Echo',
    artist: 'Nova Lane',
    genre: 'Electronic',
    mood: 'Night',
    duration: '4:12',
    cover: '🌙',
    color: 'linear-gradient(135deg,#0F172A,#334155)',
    audio: '/audio/placeholder-1.mp3'
  },
  {
    id: 'n2',
    title: 'Aurora Drift',
    artist: 'Luma',
    genre: 'Synthwave',
    mood: 'Chill',
    duration: '3:54',
    cover: '✨',
    color: 'linear-gradient(135deg,#EC4899,#8B5CF6)',
    audio: '/audio/placeholder-2.mp3'
  },
  {
    id: 'n3',
    title: 'City Lights',
    artist: 'Kairo',
    genre: 'Pop',
    mood: 'Vibes',
    duration: '4:06',
    cover: '🌃',
    color: 'linear-gradient(135deg,#F97316,#FBBF24)',
    audio: '/audio/placeholder-3.mp3'
  },
  {
    id: 'l1',
    title: 'Skyline',
    artist: 'Avi',
    genre: 'Electronic',
    mood: 'Travel',
    duration: '3:21',
    cover: '🚀',
    color: 'linear-gradient(135deg,#0EA5E9,#38BDF8)',
    audio: '/audio/placeholder-4.mp3'
  },
  {
    id: 'l2',
    title: 'Golden Hour',
    artist: 'Mira',
    genre: 'Pop',
    mood: 'Mood',
    duration: '3:08',
    cover: '☀️',
    color: 'linear-gradient(135deg,#F59E0B,#FCD34D)',
    audio: '/audio/placeholder-5.mp3'
  }
];

const favorites = new Map();

app.use(express.json());
app.use('/audio', express.static(path.join(__dirname, 'audio')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'CoreMusic', time: new Date().toISOString() });
});

app.get('/api/featured', (req, res) => {
  res.json({
    totalTracks: tracks.length,
    totalGenres: [...new Set(tracks.map((t) => t.genre))].length,
    latest: tracks.slice(0, 3)
  });
});

app.get('/api/tracks', (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase();
  const filter = (req.query.genre || '').toString().trim().toLowerCase();

  const filtered = tracks.filter((track) => {
    const token = `${track.title} ${track.artist} ${track.genre} ${track.mood}`.toLowerCase();
    const matchesQuery = !q || token.includes(q);
    const matchesGenre = !filter || filter === 'all' || track.genre.toLowerCase() === filter || track.mood.toLowerCase() === filter;
    return matchesQuery && matchesGenre;
  });

  res.json(filtered);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const valid = email === 'demo@coremusic.com' && password === 'coremusic123';

  if (!valid) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password' });
  }

  res.json({
    ok: true,
    token: 'demo-token-coremusic-user',
    user: { email, name: 'CoreMusic User' }
  });
});

app.get('/api/favorites', (req, res) => {
  const user = req.query.user || 'guest';
  res.json({ items: favorites.get(user) || [] });
});

app.post('/api/favorites', (req, res) => {
  const { user = 'guest', trackId } = req.body || {};
  const current = favorites.get(user) || [];
  const next = current.includes(trackId)
    ? current.filter((id) => id !== trackId)
    : [...current, trackId];

  favorites.set(user, next);
  res.json({ ok: true, items: next });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CoreMusic app running on http://localhost:${PORT}`);
});
