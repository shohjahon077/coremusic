const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const audioFiles = new Set([
  'MORGENSHTERN - Отпускаю.mp3',
  'MORGENSHTERN - Привет я Алишер.mp3',
  'MORGENSHTERN - Пиво и скейтборд.mp3',
  'MORGENSHTERN - Пам Пам Пам!.mp3',
  'MORGENSHTERN - Молодость.mp3',
  'MORGENSHTERN - Мы так молоды.mp3',
  'MORGENSHTERN - Селяви.mp3',
  'MORGENSHTERN - Сдача.mp3',
  'MORGENSHTERN - Дикий.mp3',
  'MORGENSHTERN - Дом (Лондон, Прага, Ницца).mp3',
  'MORGENSHTERN - Кисоньке.mp3',
  'MORGENSHTERN - Когда буду умирать.mp3',
  'MORGENSHTERN - Номер.mp3',
  'MORGENSHTERN - Опа.mp3',
  'MORGENSHTERN - Она.mp3',
  'MORGENSHTERN - Повод.mp3',
  'MORGENSHTERN - Пойдет.mp3',
  'MORGENSHTERN - Последняя Любовь.mp3',
  'MORGENSHTERN - Пустой вокзал.mp3',
  'MORGENSHTERN - Таблетки.mp3',
  'MORGENSHTERN - Четыре Украинки.mp3',
  'MORGENSHTERN - Чёрный Русский.mp3',
  'MORGENSHTERN - Щека На Щеку.mp3',
  'MORGENSHTERN - Я Рок Звезда.mp3',
  'MORGENSHTERN - Я хороший.mp3',
  'MORGENSHTERN - Если я спал с тобой.mp3',
  'MORGENSHTERN - Антидепрессанты.mp3',
  'MORGENSHTERN - Первый раз.mp3',
  'MORGENSHTERN - Группа крови.mp3',
  'Morgenshtern - 12.mp3',
  'morgenshtern-ia-ubil-marka-oksimiron-diss(1).mp3',
  'Morgenshtern - Пиво и скейтборд.mp3',
  'Morgenshtern - Пам Пам Пам!.mp3',
  'Morgenshtern - Молодость.mp3',
  'Morgenshtern - Мы так молоды.mp3',
  'Morgenshtern - Селяви.mp3',
  'Morgenshtern - Сдача.mp3',
  'Morgenshtern - Дикий.mp3',
  'Morgenshtern - Дом (Лондон, Прага, Ницца).mp3',
  'Morgenshtern - Кисоньке.mp3',
  'Morgenshtern - Когда буду умирать.mp3',
  'Morgenshtern - Номер.mp3',
  'Morgenshtern - Опа.mp3',
  'Morgenshtern - Она.mp3',
  'Morgenshtern - Повод.mp3',
  'Morgenshtern - Пойдет.mp3',
  'Morgenshtern - Последняя Любовь.mp3',
  'Morgenshtern - Пустой вокзал.mp3',
  'Morgenshtern - Таблетки.mp3',
  'Morgenshtern - Четыре Украинки.mp3',
  'Morgenshtern - Чёрный Русский.mp3',
  'Morgenshtern - Щека На Щеку.mp3',
  'Morgenshtern - Я Рок Звезда.mp3',
  'Morgenshtern - Я хороший.mp3',
  'Morgenshtern - Если я спал с тобой.mp3',
  'Morgenshtern - Антидепрессанты.mp3',
  'Morgenshtern - Братосын.mp3'
]);

const tracks = [
  { id: 'm1', title: 'Первый раз', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Energetic', duration: '3:18', cover: '🎵', audio: 'MORGENSHTERN - Первый раз.mp3' },
  { id: 'm2', title: 'Группа крови', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Dark', duration: '3:45', cover: '🎧', audio: 'MORGENSHTERN - Группа крови.mp3' },
  { id: 'm3', title: '12', artist: 'Morgenshtern', genre: 'Rap', mood: 'Focus', duration: '2:56', cover: '🔥', audio: 'Morgenshtern - 12.mp3' },
  { id: 'm4', title: 'Антидепрессанты', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Chill', duration: '3:32', cover: '💊', audio: 'MORGENSHTERN - Антидепрессанты.mp3' },
  { id: 'm5', title: 'Дикий', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Energetic', duration: '3:24', cover: '🐺', audio: 'MORGENSHTERN - Дикий.mp3' },
  { id: 'm6', title: 'Дом (Лондон, Прага, Ницца)', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Vibes', duration: '4:01', cover: '🏠', audio: 'MORGENSHTERN - Дом (Лондон, Прага, Ницца).mp3' },
  { id: 'm7', title: 'Молодость', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Energetic', duration: '3:38', cover: '🌟', audio: 'MORGENSHTERN - Молодость.mp3' },
  { id: 'm8', title: 'Номер', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Night', duration: '3:45', cover: '📞', audio: 'MORGENSHTERN - Номер.mp3' },
  { id: 'm9', title: 'Она', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Chill', duration: '3:22', cover: '💕', audio: 'MORGENSHTERN - Она.mp3' },
  { id: 'm10', title: 'Опа', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Energetic', duration: '2:58', cover: '🎉', audio: 'MORGENSHTERN - Опа.mp3' },
  { id: 'm11', title: 'Повод', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Vibes', duration: '3:15', cover: '🎭', audio: 'MORGENSHTERN - Повод.mp3' },
  { id: 'm12', title: 'Пойдет', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Chill', duration: '3:28', cover: '🚀', audio: 'MORGENSHTERN - Пойдет.mp3' },
  { id: 'm13', title: 'Последняя Любовь', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Romantic', duration: '3:54', cover: '💔', audio: 'MORGENSHTERN - Последняя Любовь.mp3' },
  { id: 'm14', title: 'Пустой вокзал', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Dark', duration: '3:42', cover: '🚂', audio: 'MORGENSHTERN - Пустой вокзал.mp3' },
  { id: 'm15', title: 'Сдача', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Focus', duration: '3:11', cover: '💰', audio: 'MORGENSHTERN - Сдача.mp3' },
  { id: 'm16', title: 'Селяви', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Chill', duration: '3:33', cover: '🌴', audio: 'MORGENSHTERN - Селяви.mp3' },
  { id: 'm17', title: 'Таблетки', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Dark', duration: '3:19', cover: '💊', audio: 'MORGENSHTERN - Таблетки.mp3' },
  { id: 'm18', title: 'Четыре Украинки', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Energetic', duration: '3:27', cover: '🎸', audio: 'MORGENSHTERN - Четыре Украинки.mp3' },
  { id: 'm19', title: 'Чёрный Русский', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Focus', duration: '3:41', cover: '🖤', audio: 'MORGENSHTERN - Чёрный Русский.mp3' },
  { id: 'm20', title: 'Щека На Щеку', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Romantic', duration: '3:35', cover: '👄', audio: 'MORGENSHTERN - Щека На Щеку.mp3' },
  { id: 'm21', title: 'Я Рок Звезда', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Energetic', duration: '3:28', cover: '⭐', audio: 'MORGENSHTERN - Я Рок Звезда.mp3' },
  { id: 'm22', title: 'Я Убил Марка', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Dark', duration: '4:02', cover: '⚡', audio: 'morgenshtern-ia-ubil-marka-oksimiron-diss(1).mp3' },
  { id: 'm23', title: 'Если я спал с тобой', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Romantic', duration: '3:45', cover: '🛏️', audio: 'MORGENSHTERN - Если я спал с тобой.mp3' },
  { id: 'm24', title: 'Кисоньке', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Chill', duration: '3:18', cover: '🐱', audio: 'MORGENSHTERN - Кисоньке.mp3' },
  { id: 'm25', title: 'Когда буду умирать', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Dark', duration: '3:52', cover: '☠️', audio: 'MORGENSHTERN - Когда буду умирать.mp3' },
  { id: 'm26', title: 'Мы так молоды', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Energetic', duration: '3:41', cover: '👶', audio: 'MORGENSHTERN - Мы так молоды.mp3' },
  { id: 'm27', title: 'Отпускаю', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Romantic', duration: '3:33', cover: '🕊️', audio: 'MORGENSHTERN - Отпускаю.mp3' },
  { id: 'm28', title: 'Пам Пам Пам', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Energetic', duration: '3:26', cover: '🔫', audio: 'MORGENSHTERN - Пам Пам Пам!.mp3' },
  { id: 'm29', title: 'Пиво и скейтборд', artist: 'MORGENSHTERN', genre: 'Rap', mood: 'Vibes', duration: '3:39', cover: '🛹', audio: 'MORGENSHTERN - Пиво и скейтборд.mp3' },
  { id: 'm30', title: 'Привет я Алишер', artist: 'MORGENSHTERN', genre: 'Hip-Hop', mood: 'Chill', duration: '3:44', cover: '👋', audio: 'MORGENSHTERN - Привет я Алишер.mp3' },
  { id: 'n1', title: 'Midnight Echo', artist: 'Nova Lane', genre: 'Electronic', mood: 'Night', duration: '4:12', cover: '🌙', audio: 'placeholder-1.mp3' },
  { id: 'n2', title: 'Aurora Drift', artist: 'Luma', genre: 'Synthwave', mood: 'Chill', duration: '3:54', cover: '✨', audio: 'placeholder-2.mp3' },
  { id: 'n3', title: 'City Lights', artist: 'Kairo', genre: 'Pop', mood: 'Vibes', duration: '4:06', cover: '🌃', audio: 'placeholder-3.mp3' }
];

const favorites = new Map();

app.use(express.json());

app.use('/audio', (req, res, next) => {
  const safeUrl = decodeURIComponent(req.path || '/');
  const fileName = path.basename(safeUrl);

  if (!fileName.toLowerCase().endsWith('.mp3')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!audioFiles.has(fileName)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }

  next();
}, express.static(__dirname));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'CoreMusic', time: new Date().toISOString() });
});

app.get('/api/tracks', (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    const filtered = q
      ? tracks.filter((track) =>
          `${track.title} ${track.artist} ${track.genre} ${track.mood}`
            .toLowerCase()
            .includes(q)
        )
      : tracks;

    res.json(filtered);
  } catch (error) {
    console.error('Error in /api/tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const valid = email === 'demo@coremusic.com' && password === 'coremusic123';

    if (!valid) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password' });
    }

    res.json({
      ok: true,
      token: 'demo-token-for-coremusic-user',
      user: { email, name: 'CoreMusic User' }
    });
  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

app.get('/api/favorites', (req, res) => {
  try {
    const user = req.query.user || 'guest';
    res.json({ items: favorites.get(user) || [] });
  } catch (error) {
    console.error('Error in /api/favorites GET:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites', (req, res) => {
  try {
    const { user = 'guest', trackId } = req.body || {};
    const current = favorites.get(user) || [];
    const exists = current.includes(trackId);
    const next = exists ? current.filter((id) => id !== trackId) : [...current, trackId];
    favorites.set(user, next);
    res.json({ ok: true, items: next });
  } catch (error) {
    console.error('Error in /api/favorites POST:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`CoreMusic app running on http://localhost:${PORT}`);
});

module.exports = app;
