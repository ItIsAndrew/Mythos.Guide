# Mythos.Guide

A beginner-friendly guide to Greek and Roman mythology. Search 141 divine figures, discover their families, read six original story retellings, explore four mythological worlds, and play trivia with 48 questions across three difficulty levels.

The guide also includes topic filters, random god discovery, Greek/Roman name comparisons, a short glossary, and invite-only accounts for private mythology notes.

## Run locally

Use Node.js 22 or newer.

1. Install dependencies with `npm install`.
2. Copy `database.env.example` to `.env.local`. Enter your MongoDB connection URL privately as `MONGODB_URI`. For account and owner features, also add `ADMIN_PASSCODE` with a long, random private value. Never commit this file or share its contents.
3. Run `npm run dev` and open **http://localhost:3000**. The new landing page leads to the full guide at **http://localhost:3000/guide**.

The existing Mac shortcuts can start the app and open owner controls. Keep the Terminal window open while using the app.

MongoDB must support transactions for invitations and account deletion. The app uses the database already named in the connection URL. Only server code in `/api` accesses MongoDB, using the official driver and a reused client.

## Checks

- `npm test` runs the automated suite without a real database.
- With the app running and private settings configured, `npm run check:safety` checks accounts, private posts, invitations, and owner controls using disposable sample data. Run it only against your local test app.

See [TESTING.md](TESTING.md) for recorded results and [NOTES.md](NOTES.md) for completed features and next steps.

## Project status

This repository shares the source code. The website currently runs locally; it has not been deployed to a public web host. Database contents, passwords, owner credentials, and local environment files are not included.

Use invented nicknames and sample notes. Mythology descriptions and retellings are educational starting points; ancient traditions vary, and source links are provided where available.
