# ShipFast — l'API du fil rouge

Une petite API de raccourcissement d'URL. C'est **le code à conteneuriser** pendant la formation.
Explorez-le : comprendre ce que fait une application est la première étape avant de l'emballer.

## Ce que fait l'API

| Méthode & route | Rôle | Exemple de réponse |
| --- | --- | --- |
| `POST /links` | Crée un lien court à partir de `{ "url": "..." }` | `{ "code": "Ab3dEf", "short": "http://localhost:3000/Ab3dEf" }` |
| `GET /:code` | Redirige (302) vers l'URL d'origine et compte le clic | redirection HTTP 302 |
| `GET /stats` | Renvoie les compteurs | `{ "links": 1, "clicks": 1, "store": "memory" }` |
| `GET /` | Petite interface web pour créer un lien à la souris | page HTML |
| `GET /health` | Sonde de santé | `{ "status": "ok" }` |

## Stockage : mémoire par défaut, base de données si configurée

- **Sans variables d'environnement**, l'API fonctionne **en mémoire** (`store: "memory"`) — parfait
  pour démarrer le jour 1.
- Si vous définissez **`DATABASE_URL`** (PostgreSQL), les liens sont **persistés** en base.
- Si vous définissez **`REDIS_URL`** (Redis), les clics sont aussi comptés dans le cache.
- `PORT` (défaut `3000`) et `PUBLIC_BASE_URL` permettent d'ajuster l'écoute et l'URL affichée.

C'est volontaire : vous ajouterez la persistance et le cache **au fil des missions**, sans toucher
au code — juste en branchant les bonnes variables et les bons services.

## Lancer l'API sans Docker (facultatif, pour explorer)

```bash
cd shipfast
npm install
npm start
# → ShipFast à l'écoute sur le port 3000 (stockage : memory)
```

## Vérifier que l'API répond (tests d'acceptation)

Ces trois tests sont votre définition de « ça marche ». Ils resteront valables une fois l'API
conteneurisée — c'est ainsi que vous prouverez que votre image est correcte.

```bash
curl -X POST localhost:3000/links -H "Content-Type: application/json" \
     -d '{"url":"https://www.sparks-formation.com"}'
# → { "code": "...", "short": "http://localhost:3000/..." }

curl -iL localhost:3000/<code>     # → 302 puis la page cible
curl localhost:3000/stats          # → { "links": 1, "clicks": 1, "store": "memory" }
```

> À vous d'écrire le `Dockerfile` qui emballe cette API. Le corrigé est présenté en séance —
> pas dans ce dépôt.
