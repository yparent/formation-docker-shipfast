# Solutions — Formation Docker (branche `solution`)

Corrigés de tous les exercices et TP des 3 jours. **Réservé au formateur** — à ne pas
partager avec les stagiaires. Chaque dossier correspond à un exercice ou un TP.

## Jour 1 — Images

| Exercice | Dossier | Comment l'utiliser |
| --- | --- | --- |
| Mission 4 — Premier Dockerfile (carte de visite) | `jour1-images/moncv/` | `docker build -t moncv .` puis `docker run -d -p 8081:80 moncv` |
| Mission 5 — Dockerfile applicatif (naïf) | `jour1-images/shipfast-v1/Dockerfile` | à placer dans `shipfast/`, `docker build -t shipfast:v1 ./shipfast` |
| Mission 6 — Image optimisée (multi-stage, non-root) | `jour1-images/shipfast-v2/` | copier `Dockerfile` + `.dockerignore` dans `shipfast/`, `docker build -t shipfast:v2 ./shipfast` |

## Jour 2 — Compose

| Exercice | Dossier | Comment l'utiliser |
| --- | --- | --- |
| Mission 11 — ShipFast avec Compose (api+db+cache+proxy) | `jour2-compose/shipfast-stack/` | copier à la racine du dépôt (à côté de `shipfast/`), `cp .env.example .env`, `docker compose up -d --build` |
| TP découverte Compose (Adminer + PostgreSQL) | `jour2-compose/tp-decouverte-compose/` | `docker compose up -d`, puis Adminer sur `:8080` (serveur = `db`) |
| TP découverte Compose — scaling | `jour2-compose/tp-decouverte-compose/whoami-scale/` | `docker compose up -d --scale web=3` |
| Exercice réseaux (front/backend/db + volume partagé) | `jour2-compose/exercice-reseaux/` | `docker compose up -d` |

## Jour 3 — Swarm

| Exercice | Dossier | Comment l'utiliser |
| --- | --- | --- |
| ShipFast en prod (secrets, overlay, rolling update) | `jour3-swarm/shipfast-swarm/` | construire+pousser l'image, `docker secret create pg_password`, `docker stack deploy --with-registry-auth -c stack.yml shipfast` |
| TP Swarm — WordPress + MariaDB | `jour3-swarm/tp-wordpress/` | `docker stack deploy -c stack.yml wordpress` |
| Grand Prix — meteo-du-port (Compose et Swarm) | `jour3-swarm/grand-prix-meteo/` | Compose : `docker compose up -d --build` · Swarm : build+push puis `docker stack deploy` |

## Notes importantes

- Les Dockerfiles de `shipfast` s'utilisent avec le code de l'API présent dans `shipfast/` (branche `main`).
- Sur un cluster Swarm **multi-nœuds**, l'image doit être **poussée sur un registre** : remplacez
  `VOTRE_ID` par votre identifiant Docker Hub dans les `stack.yml`, et ajoutez `--with-registry-auth`
  au déploiement si le dépôt est privé.
- Les fichiers `.env`, `db.env`, `wordpress.env` contiennent des mots de passe de démonstration :
  ne pas les réutiliser en production.
- Pour PostgreSQL 18, le volume se monte sur `/var/lib/postgresql` (et non `.../data`).
