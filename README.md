# Zack, developer portfolio

A dark, purple-neon personal portfolio with a **live Discord presence card** (Lanyard WebSocket), a tools page (calculator, DevEx converter, live crypto prices) and a built-in prompt generator so visitors can make their own.

## Run locally
```
npm start
```
Open http://localhost:3000 (tools page: http://localhost:3000/tools). No `npm install` needed, there are no dependencies. `.env` is optional (see `.env.example`).

## Live Discord presence
Join the Lanyard Discord server (https://discord.gg/lanyard) with the account whose ID is set as `DISCORD_ID` at the top of `frontend/js/main.js`. No tokens or secrets are used.

## Edit your content
All in `frontend/js/main.js`: `DISCORD_ID`, `EMO` (custom Discord emojis), `PROJECTS`, `SOCIALS`, `CRYPTO`. Email is in `frontend/index.html`. Banner: `frontend/assets/banner.gif`.

## Structure
```
frontend/   index.html, tools.html, css/, js/, assets/
backend/    server.js (zero-dependency static server)
netlify.toml
```

## Deploy
Netlify / Vercel / Cloudflare Pages: publish the `frontend` folder (`netlify.toml` is included). The Node server is only needed for local use.

## Public APIs used (no keys)
Lanyard, CoinGecko, Binance market data, open.er-api.com, fawazahmed0 currency-api.

## React + TypeScript (v2)
The home page is now a Vite + React + TypeScript app (`frontend/src`). Static files (CSS, the 3D world `js/scene.js`, effects `js/fx.js`, tool pages, assets) live in `frontend/public` and are copied as is.
```
npm install
npm run dev      # dev server with hot reload
npm run build    # type-check + build into dist/
npm start        # serve dist/ at http://localhost:3000
```
**Render:** Build Command `npm install && npm run build`, Start Command `npm start` (Web Service), or Static Site with Publish Directory `dist`.
