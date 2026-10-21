# Mythos.Guide

## How to run

Double-click **Start Mythos.Guide.command** in this folder. Open **http://localhost:3000** and choose **Open the guide**, or search for a god directly on the landing page. The activity menu is at **http://localhost:3000/guide**; each choice opens one focused part of the guide at **http://localhost:3000/activity**. Keep the Terminal window open; Control+C stops the app. The Mac shortcut uses the Node runtime bundled with Codex and needs no admin password. With Node.js 22+ and dependencies installed, `npm run dev` also works.

Internet is needed for MongoDB. Keep the saved private settings in `.env.local`; never share or commit that file. Only `/api` accesses MongoDB, using the official driver, one reused client, and `client.db()` with no database name.

For owner controls, double-click **Open Owner Controls.command** while the app runs. It copies the private passcode and opens **http://localhost:3000/owner.html**; paste and unlock. Keep the shortcut and passcode private.

## Where it is published

Source code: [ItIsAndrew/Mythos.Guide on GitHub](https://github.com/ItIsAndrew/Mythos.Guide). Source upload was authorized October 19, 2026. The website still runs on this computer; it has not been deployed to Vercel or Sites. Private files and database contents are excluded from Git.

## What is done

- A welcoming landing page leads into a compact activity menu. Search, browsing, stories, worlds, basics, quiz, and private notes each open in a focused view. The menu offers a link back to the last opened activity and a different suggested activity. Only the activity name is stored in this browser; nicknames and posts are not used. Old links to guide sections still reach the matching activity.
- The landing page now has direct god search, example names, an Athena introduction, clear beginner links, and a compact collection preview. Text uses a calmer hierarchy and phone controls have tap areas of at least 44 pixels.
- Search and browse 141 Greek and Roman divine figures, including Aether, Euterpe, and lesser-known figures. Both Thalias have working qualified Muse/Grace aliases. Clear a search without reloading, sort names A–Z or Z–A, show more or fewer cards, filter by tradition, or meet a random god.
- Every figure has source references, a myth-version note, reviewed topic tags, and a useful next-step topic. There are 12 named topics, including war, love, healing, creation, and dreams. Related stories and worlds are labeled as thematic suggestions where appropriate.
- Coverage includes all 48 figures in [Theoi’s major-pantheon overview](https://www.theoi.com/Pantheon.html) and all 12 Roman [Dei Consentes](https://penelope.uchicago.edu/encyclopaedia_romana/romanforum/deorumconsentium.html), exceeding the requested 75% of this defined major-god reference set. Ancient mythology has no fixed total for all divine figures.
- Family facts, 12 Greek/Roman name comparisons, and a 16-word glossary support research. Each word has a myth example and a link to a related figure; an eight-clue challenge lets beginners practice.
- Read 12 original educational retellings, six at a time. Search stories by title, god, or theme; combine the search with Greek/Roman filters, ask the guide to choose a matching story, and clear filters if nothing matches. Explore six worlds and places, including a healing sanctuary and Roman public life; each place opens a connected story. Stories and worlds include sources and version notes.
- Play five-question Easy, Medium, or Hard quiz rounds drawn from 48 questions. Answers show an explanation and source. After a round, review missed or correct answers, practice missed questions with a fresh score, or visit Names & words. **Play again** starts a full five-question round. Phone questions and feedback stay in view; players can keep playing or end a round to change difficulty.
- Create an account with an available, approved made-up nickname and a password. Save the private recovery code shown once; it can reset a forgotten password without email. Code replacement and password recovery invalidate old codes and sessions.
- Save, edit, and delete up to 100 private mythology notes. Safe writing ideas help start a note without overwriting or saving its draft. A successful save remains confirmed when refreshing fails; the page offers Refresh posts. Routine session checks preserve unfinished forms and edits while account changes clear private data.
- Owner tools moderate posts and pause creation/editing. Password-protected account deletion removes its posts and sessions. Sessions, origin checks, transaction protection, and database-backed rate limits protect account actions.
- Privacy checks reject common personal introductions and contact details while allowing historical school research. Free-text filters cannot recognize every possible name or disguise; owner moderation remains necessary. Use invented nicknames and sample notes only.

## How to try it

1. Open the guide, search **Aether**, and open **Sources & myth versions**. Try a topic, a story, and a world; use **Show more / Show fewer** to control the collection. In **Names & words**, try a clue and follow an example to its figure.
2. Choose **Play**, finish a five-question round, and try **Change difficulty**. In **My posts**, create an invented account, save the recovery code privately, then save, edit, and delete a mythology note.

## Latest checks

On October 21, 2026, all **86 automated tests passed** for implementation save point `65a20b8`. Live database checks passed account isolation, validation, moderation, posting controls, recovery, and session revocation. They used disposable collections inside the already configured database; all test collections were removed afterward. Browser checks confirmed save/edit success when the following refresh fails, all three quiz levels, new stories/worlds, and layouts from 320 to 1280 pixels without sideways scrolling. Another chat started further layout work after these checks; its unfinished edits were preserved. See [TESTING.md](TESTING.md) for details and the resolved audit findings.

After the Names & words expansion on October 21, all **100 current automated tests passed** locally. Browser checks confirmed the word challenge, term filtering, and a glossary link opening the matching figure. The other unfinished local edits were not included in this save point.

After the landing, story search, and quiz practice improvements on October 21, the full **100-test suite passed** again. Browser checks confirmed landing search (including multiword names), the Athena link, story search/filter/no-match/reset and paging, missed-answer review/practice/replay, and keyboard skipping to the visible activity. Landing and story layouts fit 320–1280 pixel screens without sideways scrolling. These improvements remain local; no website was deployed.

After the activity improvements on October 21, all **107 current automated tests passed** locally. Browser checks confirmed search reset, reverse name order, world-to-story links, the filtered story chooser, eight word clues, and a complete quiz round with correct-answer review. The writing prompts were checked with made-up account data in a local test harness; they did not save a post. No live database check or deployment was part of this change.

## What is next

Keep reviewing the educational content and learning paths with beginners. Use invented local test data. No website deployment is authorized: before any future publication, repeat the automated suite, live two-user/owner checks, privacy checks, and browser checks; set secrets privately in the hosting environment and verify HTTPS/Secure cookies. Keep `.env*` first in `.gitignore` and private files outside the public asset list.
