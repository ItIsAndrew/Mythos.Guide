# Mythos.Guide

## How to run

Double-click **Start Mythos.Guide.command** in this project folder. It starts the app and opens your browser at **http://localhost:3000**. Keep its Terminal window open while using the app; press Control+C there to stop it.

This Mac can use the Node runtime already bundled with Codex. No admin password is needed. On a computer with Node.js 22 or newer and the dependencies installed, `npm run dev` also starts the app.

An internet connection is needed to reach your MongoDB database. Keep your private URL in `.env.local` as `MONGODB_URI`; never put it in chat or commit it.

## Where it is published

Nowhere. The web app runs only on this computer at **http://localhost:3000**. Nothing has been deployed to Vercel or Sites.

## What is done

- Git save points are set up.
- The private MongoDB connection passed its check; `.env*` is the first ignore rule.
- God-name search returns descriptions, traditions, symbols, and counterparts from 60 authored sample entries about mythological characters, with no real people's records.
- Greek and Roman names, partial names, and alternate spellings work. Names missing from the sample collection receive a clear message.
- The page calls `/api/gods`; only server code uses the official MongoDB driver. The client is reused, and `client.db()` uses the database in your URL.
- Samples are saved in the app's own collection with insert-only updates. A fresh connection confirmed all 60 saved entries are readable. Other collections are untouched.
- Eight automated checks passed, including blocked access to private files. Live searches and desktop/phone layouts were checked in Chrome.
- The plain page and `/api` functions have a Vercel configuration ready for a later deployment request.

## How to check the search

1. Open **http://localhost:3000** while the app is running.
2. Search **Zeus**: a Greek description should appear. Search **Neptune**: a Roman description should appear.
3. Search **not-a-god-123**: a friendly no-match message should appear.

## What is next

Try the search and choose the next improvement. Expand and review the sample descriptions before treating the collection as a research reference. Publish only when explicitly requested; the secret would then go in Vercel environment variables.

Browsing the 60 gods by tradition, exploring four realms, reading six sample stories, and a five-question replayable quiz are complete. All 24 automated checks passed before this save point.
