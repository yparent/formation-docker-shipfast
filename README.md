# Formation Docker — dépôt du fil rouge « ShipFast »

Bienvenue à bord. Ce dépôt contient **le code de départ** de la formation Docker sur 3 jours.
Vous n'aurez ainsi jamais à recopier à la main le code de l'application : vous le clonez, et vous
vous concentrez sur l'essentiel — **écrire vos Dockerfile, votre `compose.yaml`, votre stack Swarm**.

> **Ce dépôt ne contient aucune correction.** Les Dockerfile, fichiers Compose, stack Swarm,
> workflows CI et corrigés sont construits par vous pendant les TP et présentés en séance par le
> formateur. Ici, vous ne trouvez que le point de départ.

## Le fil rouge : ShipFast

**ShipFast** est un raccourcisseur d'URL (comme bit.ly). C'est l'application que vous allez
conteneuriser, faire persister, mettre en réseau, assembler avec Compose, puis déployer en
production sur un cluster — un peu plus à chaque mission.

| Brique | Rôle | Ce que vous y travaillez |
| --- | --- | --- |
| **api** (Node.js) | Crée les liens courts, redirige | Dockerfile, multi-stage, variables d'env, healthcheck |
| **db** (PostgreSQL) | Stocke les liens | Volumes nommés, persistance, sauvegarde |
| **cache** (Redis) | Compte les clics | Réseaux, DNS interne, isolation |
| **proxy** (nginx) | Point d'entrée unique | Port mapping, reverse proxy |

Le code fourni ici, c'est **l'API** (`shipfast/`). Les autres briques (PostgreSQL, Redis, nginx)
sont des images officielles que vous ajouterez au fil des missions — pas besoin de code pour elles.

## Contenu du dépôt

```
formation-docker-shipfast/
├── README.md            ← vous êtes ici
├── .gitignore
└── shipfast/            ← l'API du fil rouge (le code de départ à conteneuriser)
    ├── server.js
    ├── package.json
    └── README.md        ← ce que fait l'API et comment la lancer sans Docker
```

## Récupérer le dépôt

Sur votre VM de formation (ou votre poste) :

```bash
git clone <URL-DU-DÉPÔT> formation-docker-shipfast
cd formation-docker-shipfast
```

Puis suivez les énoncés du **Guide du stagiaire** (un par jour, remis par le formateur). Chaque
mission vous indique quoi construire ; le code de l'API est déjà là, à vous de l'emballer.

## Le Grand Prix (jour 3)

Le capstone final — une application inconnue à mettre en production de zéro — **n'est pas dans ce
dépôt au départ** : c'est une surprise. Le formateur le publie en séance le jour 3 (branche
`grand-prix`). Inutile de le chercher avant : tout l'intérêt est de partir d'une application que
vous n'avez jamais vue.

## Prérequis

- Un environnement Docker (fourni sur votre VM de formation : Docker Engine préinstallé).
- `git` pour cloner ce dépôt.
- Aucune installation Node/Python n'est nécessaire : tout tournera dans des conteneurs. (Le
  `README` de `shipfast/` explique tout de même comment lancer l'API sans Docker, si la curiosité
  vous prend.)

Bonne régate ! 🐳
