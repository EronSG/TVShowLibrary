# TV Show Library

A Node.js + Express TV show collection app integrated with the public [TVmaze API](https://www.tvmaze.com/api).

## Features
- Search TVmaze by show title.
- View posters, genres, status, premiere date, rating, network/streaming service, summary, and TVmaze page.
- Add API search results to a local personal collection.
- Manually add shows, edit saved shows, and remove shows.
- Persist the collection in `shows.json`.
- Health endpoint at `/health`.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm start
```

Open http://localhost:3001.

## API routes
- `GET /api/shows` — list saved shows
- `POST /api/shows` — add a show
- `PUT /api/shows/:id` — update a saved show
- `DELETE /api/shows/:id` — remove a saved show
- `GET /api/lookup?title=the%20office` — search TVmaze
- `GET /health` — health check

No TVmaze API key is needed for public show search. The application credits TVmaze in its UI; see the [TVmaze API terms](https://www.tvmaze.com/api) for attribution and licensing details.

## Data note
This version uses a new `shows.json` file rather than `library.json`. The old book records are intentionally not treated as TV shows. Keep your original ZIP as a backup if you need those records later.
