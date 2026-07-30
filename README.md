# Hotels

A mobile app for discovering hotels on an interactive map, built as a
portfolio project to demonstrate mobile app development end-to-end — from UI
to geolocation to (eventually) a real backend.

**What it does:** browse a list of hotels, tap one to fly to it on the map,
and (planned) find hotels near your current location or search by city.

![App demo](docs/media/demo.gif)

## Why this project

This is a hands-on sample of my mobile development work — a real,
runnable app rather than a slide deck. It's built the way I'd approach a
production feature: a phased roadmap, working software at every step, and
decisions documented as they're made (see `plan.md` and `docs/`).

## Tech stack

- **React Native + Expo** — cross-platform app (iOS, Android, web) from a
  single TypeScript codebase.
- **Expo Router** — file-based navigation, the same model used by modern
  web frameworks like Next.js.
- **MapLibre GL** — open-source, vector-tile maps (via
  [OpenFreeMap](https://openfreemap.org/)) — no paid API keys required.
- **TypeScript** in strict mode throughout.
- **ESLint** for code quality.
- Planned: **PostgreSQL + PostGIS** for geospatial queries on a real backend
  (see the roadmap in `plan.md`).

## Project status

Actively in progress. Current phase: hotel list + map screen with mocked
data. Next up: "find hotels near me" and city search, then a real backend.
See `plan.md` for the full roadmap and `docs/logs/` for a running log of
design decisions.

## About me

Hi, I'm Tymoteusz.
I'm a full-stack developer working across frontend, backend, and user experience.
I build native mobile apps, backend APIs, and work with databases.
I'm looking for an opportunity to keep growing as a software engineer.
