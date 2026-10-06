* { box-sizing: border-box; }
:root {
  --bg: #07111f;
  --bg-2: #0d1b2a;
  --panel: rgba(17, 27, 39, 0.8);
  --panel-strong: rgba(19, 35, 49, 0.95);
  --primary: #55e6c1;
  --primary-2: #66a6ff;
  --accent: #ff7ad9;
  --text: #ecf7ff;
  --muted: #aac4d6;
  --line: rgba(255,255,255,0.08);
  --shadow: 0 20px 50px rgba(0,0,0,0.35);
}

html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  font-family: Inter, "Segoe UI", sans-serif;
  background: radial-gradient(circle at top left, rgba(85,230,193,0.18), transparent 30%), radial-gradient(circle at top right, rgba(102,166,255,0.22), transparent 25%), linear-gradient(135deg, var(--bg), var(--bg-2));
  color: var(--text);
}

a { color: inherit; text-decoration: none; }
button, input { font: inherit; }

.container { width: min(1200px, calc(100% - 32px)); margin: 0 auto; }
.navbar {
  position: sticky; top: 0; z-index: 50;
  background: rgba(7,17,31,0.6); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line);
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; min-height: 72px; gap: 20px; }
.logo { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.3rem; }
.logo-mark {
  width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: linear-gradient(135deg, var(--primary), var(--primary-2)); color: #062438; font-weight: 900;
}
.nav-links { display: flex; align-items: center; gap: 22px; color: var(--muted); }
.nav-links a:hover { color: var(--text); }
.nav-actions { display: flex; align-items: center; gap: 12px; }
.search-input {
  width: 240px; background: rgba(255,255,255,0.04); border: 1px solid var(--line); color: var(--text); border-radius: 12px; padding: 9px 12px; outline: none;
}
.search-input::placeholder { color: var(--muted); }

.btn {
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: var(--text); border-radius: 12px; padding: 10px 18px; cursor: pointer; transition: 0.2s ease;
}
.btn:hover { transform: translateY(-1px); }
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-2)); border: none; color: #061a2d; font-weight: 800;
}
.btn-ghost { border-color: var(--line); }
.btn-user { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; padding: 0; }
.hidden { display: none !important; }

.hero { padding: 90px 0 40px; }
.hero-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; align-items: center; gap: 28px; }
.eyebrow {
  display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: var(--primary); font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase;
}
.hero h1 { font-size: clamp(2.8rem, 5vw, 5rem); line-height: 0.94; margin: 20px 0 18px; letter-spacing: -0.06em; }
.lead { color: var(--muted); font-size: 1.08rem; line-height: 1.7; max-width: 650px; }
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 28px; }
.stats-row { display: flex; gap: 22px; margin-top: 28px; flex-wrap: wrap; }
.stat-box { min-width: 110px; }
.stat-box strong { display: block; font-size: 1.7rem; }
.stat-box span { color: var(--muted); font-size: 0.9rem; }

.hero-card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid var(--line); border-radius: 28px; padding: 18px; box-shadow: var(--shadow); }
.mini-player { background: var(--panel-strong); border-radius: 22px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
.cover-art { height: 300px; position: relative; display: grid; place-items: center; background: linear-gradient(135deg, rgba(255,122,217,0.8), rgba(85,230,193,0.7)), linear-gradient(135deg, #171b4d, #0d1117); }
.cover-art::before { content: ''; position: absolute; inset: 18px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.12); }
.vinyl {
  width: 170px; height: 170px; border-radius: 50%; position: relative; background: radial-gradient(circle at center, #101827 0 20%, #0f1726 21% 32%, #0a1220 33% 54%, #111827 55% 62%, #0b1020 63% 100%); box-shadow: inset 0 0 32px rgba(255,255,255,0.08), 0 16px 30px rgba(0,0,0,0.3); animation: spin 8s linear infinite;
}
.vinyl::before { content: ''; position: absolute; inset: 50%; transform: translate(-50%, -50%); width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--primary-2)); box-shadow: 0 0 18px rgba(85,230,193,0.6); }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.player-body { padding: 18px 18px 14px; }
.track-meta { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.track-name { font-weight: 800; font-size: 1.2rem; }
.track-artist { color: var(--muted); font-size: 0.92rem; }
.pill { padding: 7px 10px; border-radius: 999px; background: rgba(85,230,193,0.12); color: var(--primary); border: 1px solid rgba(85,230,193,0.18); font-size: 0.74rem; font-weight: 700; }
.wave { display: flex; align-items: end; gap: 6px; height: 28px; margin-top: 18px; }
.wave span { display: block; width: 7px; background: linear-gradient(180deg, var(--primary), var(--primary-2)); border-radius: 20px; animation: beat 1.1s ease-in-out infinite alternate; }
.wave span:nth-child(2) { animation-delay: 0.1s; }
.wave span:nth-child(3) { animation-delay: 0.2s; }
.wave span:nth-child(4) { animation-delay: 0.3s; }
.wave span:nth-child(5) { animation-delay: 0.4s; }
.wave span:nth-child(6) { animation-delay: 0.5s; }
@keyframes beat { from { height: 14%; opacity: 0.7; } to { height: 100%; opacity: 1; } }

.section { padding: 28px 0 30px; }
.section-top { margin-bottom: 18px; }
.section-top h2 { margin: 0; font-size: clamp(1.7rem, 2vw, 2.4rem); }
.chip-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.chip {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: var(--muted); border-radius: 999px; padding: 9px 14px; cursor: pointer;
}
.chip.active { background: linear-gradient(135deg, rgba(85,230,193,0.16), rgba(102,166,255,0.18)); color: var(--text); border-color: rgba(85,230,193,0.28); }

.track-grid, .playlist-grid, .album-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
.track-card, .playlist-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid var(--line); border-radius: 18px; padding: 14px; transition: 0.2s ease; overflow: hidden;
}
.track-card:hover, .playlist-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.14); }
.track-card .cover, .playlist-card .cover {
  width: 100%; aspect-ratio: 1; display: grid; place-items: center; border-radius: 14px; margin-bottom: 12px; font-size: 2.7rem; background: linear-gradient(135deg, var(--primary), var(--primary-2));
}
.track-card h3, .playlist-card h3 { margin: 0 0 6px; font-size: 1.05rem; }
.track-card .artist, .playlist-card .meta { color: var(--muted); font-size: 0.9rem; }
.track-card .meta-row { display: flex; justify-content: space-between; color: var(--muted); font-size: 0.8rem; margin-top: 8px; }
.track-card .actions { display: flex; gap: 8px; margin-top: 12px; }
.track-card button {
  flex: 1; background: rgba(85,230,193,0.08); border: 1px solid rgba(85,230,193,0.18); color: var(--text); padding: 9px 8px; border-radius: 10px; cursor: pointer;
}
.track-card .save-btn { background: rgba(255,255,255,0.03); border-color: var(--line); }

.player {
  position: fixed; left: 50%; transform: translateX(-50%); bottom: 18px; width: min(1140px, calc(100% - 26px)); z-index: 60; background: rgba(9, 17, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(18px); border-radius: 20px; box-shadow: var(--shadow); padding: 12px 16px;
}
.player-inner { display: grid; grid-template-columns: 220px 1fr 220px; gap: 16px; align-items: center; }
.now-playing { display: flex; align-items: center; gap: 12px; min-width: 0; }
.now-cover { width: 50px; height: 50px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(135deg, var(--primary), var(--primary-2)); color: #031b2c; font-weight: 900; }
.now-text { min-width: 0; }
.now-text strong, .now-text span { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.now-text span { color: var(--muted); font-size: 0.8rem; }
.player-center { width: 100%; }
.time-row { display: flex; justify-content: space-between; color: var(--muted); font-size: 0.78rem; margin-bottom: 6px; }
.progress-bar { width: 100%; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
.progress-fill { width: 0%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-2)); border-radius: inherit; }
.player-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
.circle-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line); background: rgba(255,255,255,0.02); color: var(--text); display: grid; place-items: center; }
.play-btn { width: 48px; height: 48px; background: linear-gradient(135deg, var(--primary), var(--primary-2)); color: #061d33; border: none; font-weight: 900; }
input[type="range"] { accent-color: var(--primary); }

.modal { position: fixed; inset: 0; background: rgba(3,9,17,0.7); backdrop-filter: blur(8px); display: grid; place-items: center; z-index: 80; }
.modal-card { width: min(460px, calc(100% - 24px)); background: var(--panel-strong); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; box-shadow: var(--shadow); padding: 20px; position: relative; }
.close-btn { position: absolute; right: 18px; top: 18px; border: none; background: transparent; color: var(--muted); font-size: 1.8rem; cursor: pointer; }
.modal-tabs { display: flex; gap: 10px; margin-bottom: 18px; }
.tab { flex: 1; padding: 10px 12px; border-radius: 12px; border: 1px solid transparent; background: rgba(255,255,255,0.03); color: var(--muted); cursor: pointer; }
.tab.active { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.08); color: var(--text); }
.auth-form { display: grid; gap: 14px; }
.form-group label { display: block; margin-bottom: 8px; color: var(--muted); font-size: 0.82rem; }
.form-group input {
  width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: var(--text); border-radius: 12px; padding: 12px 14px; outline: none;
}
.full { width: 100%; margin-top: 8px; }
.drop-menu {
  position: fixed; top: 74px; right: 20px; z-index: 90; background: rgba(9,17,28,0.95); border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow); padding: 8px 0; min-width: 180px;
}
.drop-menu a, .drop-menu button { display: block; width: 100%; text-align: left; background: transparent; border: none; color: var(--text); padding: 12px 16px; cursor: pointer; }
.drop-menu a:hover, .drop-menu button:hover { background: rgba(255,255,255,0.03); }

.toast {
  position: fixed; right: 20px; bottom: 110px; background: rgba(12,25,34,0.9); border: 1px solid rgba(255,255,255,0.08); color: var(--text); padding: 12px 14px; border-radius: 12px; box-shadow: var(--shadow); opacity: 0; transform: translateY(14px); transition: 0.25s ease; z-index: 120;
}
.toast.show { opacity: 1; transform: translateY(0); }

@media (max-width: 960px) {
  .hero-grid, .player-inner { grid-template-columns: 1fr; }
  .nav-links { display: none; }
  .search-input { width: 150px; }
}

@media (max-width: 560px) {
  .nav-actions { gap: 8px; }
  .search-input { display: none; }
  .player { bottom: 10px; }
  .now-playing { display: none; }
  .player-actions { justify-content: center; }
}
