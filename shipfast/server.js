// ShipFast — raccourcisseur d'URL (fil rouge de la formation Docker)
// -------------------------------------------------------------------
// Comportement :
//   POST /links   { "url": "https://..." }  -> { code, short }
//   GET  /:code                             -> redirection 302 vers l'URL d'origine
//   GET  /stats                             -> { links, clicks, store }
//   GET  /                                  -> petite interface web
//   GET  /health                            -> { status: "ok" }
//
// Stockage : si les variables d'environnement DATABASE_URL / REDIS_URL sont
// définies, l'API utilise PostgreSQL et Redis ; sinon, elle fonctionne en
// mémoire — parfait pour démarrer, la persistance viendra plus tard.

const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

// ---- Stockage : PostgreSQL + Redis si configurés, sinon mémoire ----
let db = null;
let cache = null;
let store = 'memory';
const mem = new Map(); // code -> url
let memClicks = 0;

async function init() {
  if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    const cfg = { connectionString: process.env.DATABASE_URL };
    // Secret monté en fichier (utile en Swarm : DATABASE_PASSWORD_FILE)
    if (process.env.DATABASE_PASSWORD_FILE) {
      cfg.password = require('fs')
        .readFileSync(process.env.DATABASE_PASSWORD_FILE, 'utf8')
        .trim();
    }
    db = new Pool(cfg);
    await db.query(
      `CREATE TABLE IF NOT EXISTS links (
         code   TEXT PRIMARY KEY,
         url    TEXT NOT NULL,
         clicks INTEGER NOT NULL DEFAULT 0
       )`
    );
    store = 'postgres';
  }
  if (process.env.REDIS_URL) {
    cache = require('redis').createClient({ url: process.env.REDIS_URL });
    cache.on('error', () => {}); // on n'interrompt pas l'API si le cache tombe
    await cache.connect();
  }
}

function newCode() {
  return crypto.randomBytes(6).toString('base64url').slice(0, 6);
}

// Créer un lien court
app.post('/links', async (req, res) => {
  const url = req.body && req.body.url;
  if (!url) return res.status(400).json({ error: 'champ "url" manquant' });
  const code = newCode();
  if (db) {
    await db.query('INSERT INTO links(code, url) VALUES ($1, $2)', [code, url]);
  } else {
    mem.set(code, url);
  }
  res.json({ code, short: `${PUBLIC_BASE}/${code}` });
});

// Statistiques
app.get('/stats', async (req, res) => {
  let links;
  let clicks;
  if (db) {
    const r = await db.query(
      'SELECT COUNT(*)::int AS n, COALESCE(SUM(clicks), 0)::int AS c FROM links'
    );
    links = r.rows[0].n;
    clicks = r.rows[0].c;
  } else {
    links = mem.size;
    clicks = memClicks;
  }
  res.json({ links, clicks, store });
});

// Sonde de santé (utile pour les HEALTHCHECK)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Interface web minimale
app.get('/', (req, res) => res.type('html').send(PAGE));

// Redirection : doit rester APRÈS les routes ci-dessus (route attrape-tout)
app.get('/:code', async (req, res) => {
  const { code } = req.params;
  let url = null;
  if (db) {
    const r = await db.query(
      'UPDATE links SET clicks = clicks + 1 WHERE code = $1 RETURNING url',
      [code]
    );
    url = r.rows[0] && r.rows[0].url;
  } else if (mem.has(code)) {
    url = mem.get(code);
    memClicks += 1;
  }
  if (cache && url) {
    try { await cache.incr(`clicks:${code}`); } catch (e) { /* cache best-effort */ }
  }
  if (!url) return res.status(404).json({ error: 'lien inconnu' });
  res.redirect(302, url);
});

const PAGE = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ShipFast</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0b2a45;color:#eef;margin:0;
       display:flex;min-height:100vh;align-items:center;justify-content:center}
  .card{background:#123a5e;border-radius:14px;padding:28px 32px;max-width:520px;width:90%}
  h1{margin:.1em 0;color:#fff} .tag{color:#d99a2b;font-weight:bold;letter-spacing:1px}
  input,button{font-size:16px;border-radius:8px;border:0;padding:10px 12px}
  input{width:100%;box-sizing:border-box;margin:10px 0}
  button{background:#0e7c86;color:#fff;cursor:pointer;width:100%}
  a{color:#7ed39a;word-break:break-all} #out{margin-top:14px}
  small{color:#9fb8c8}
</style></head>
<body><div class="card">
  <div class="tag">FIL ROUGE · FORMATION DOCKER</div>
  <h1>ShipFast</h1>
  <p><small>Collez une URL, obtenez un lien court. Le compteur de clics est en bas.</small></p>
  <input id="u" placeholder="https://exemple.com/page-tres-longue">
  <button onclick="go()">Raccourcir</button>
  <div id="out"></div>
  <p><small id="stats"></small></p>
  <script>
    async function go(){
      const url=document.getElementById('u').value; if(!url)return;
      const r=await fetch('/links',{method:'POST',headers:{'Content-Type':'application/json'},
                                    body:JSON.stringify({url})});
      const d=await r.json();
      document.getElementById('out').innerHTML =
        d.short ? 'Lien : <a href="'+d.short+'" target="_blank">'+d.short+'</a>' :
                  ('Erreur : '+(d.error||'inconnue'));
      stats();
    }
    async function stats(){
      const s=await (await fetch('/stats')).json();
      document.getElementById('stats').textContent =
        s.links+' lien(s) · '+s.clicks+' clic(s) · stockage : '+s.store;
    }
    stats();
  </script>
</div></body></html>`;

init()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`ShipFast à l'écoute sur le port ${PORT} (stockage : ${store})`)
    );
  })
  .catch((err) => {
    console.error('Échec du démarrage :', err);
    process.exit(1);
  });
