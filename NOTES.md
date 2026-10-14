# Mythos.Guide

## How to run

Double-click **Start Mythos.Guide.command** in this folder, then use **http://localhost:3000**. Keep the Terminal window open; Control+C stops the app. This Mac uses the Node runtime already bundled with Codex, without an admin password. With Node.js 22+ and dependencies installed, `npm run dev` also works.

Internet is needed for MongoDB. Keep the private URL only in `.env.local` as `MONGODB_URI`.

## Where it is published

Nowhere. The app stays on this computer. Nothing is deployed to Vercel or Sites.

## What is done

- Search 60 sample Greek and Roman gods, including alternate spellings.
- Browse the collection, filter Greek/Roman, show more gods, and open their details.
- Explore four worlds: Olympus, the sea, the underworld, and a Roman hearth.
- Read six original short retellings with museum reference links.
- Play five-question quiz rounds from 16 questions, with explanations, scores, and replay.
- Only `/api` server code uses MongoDB, through one reused client and `client.db()` without a database name. Sample inserts preserve existing records; private environment files stay out of Git.
- All 24 automated tests passed. Chrome checks covered search, all filters and 60 browse entries, all stories and worlds, keyboard navigation, a complete scored quiz, replay, phone layouts, and recovery after an interrupted connection.
- The mythology feature save point is `3423b44`. Its tests were checked separately while another chat works on accounts/posts in this folder; that unfinished work was preserved and is outside these test results.

## How to try it

Use **Search**, **Gods**, **Their world**, **Stories**, and **Play** in the navigation. Search for Zeus or Neptune, open a god card, switch worlds, read a story, then complete a quiz and choose **Play again**.

## What is next

Expand and review the educational sample content, then choose any further improvements. Publish only after an explicit request; the secret would go in Vercel environment variables at that time.
