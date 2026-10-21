# Mythos.Guide

## How to run

Double-click **Start Mythos.Guide.command** in this folder. Open **http://localhost:3000** and choose **Enter the guide**. The full tested guide is at **http://localhost:3000/guide**. Keep the Terminal window open; Control+C stops the app. The Mac shortcut uses the Node runtime bundled with Codex and needs no admin password. With Node.js 22+ and dependencies installed, `npm run dev` also works.

Internet is needed for MongoDB. Keep the saved private settings in `.env.local`; never share or commit that file. Only `/api` accesses MongoDB, using the official driver, one reused client, and `client.db()` with no database name.

For owner controls, double-click **Open Owner Controls.command** while the app runs. It copies the private passcode and opens **http://localhost:3000/owner.html**; paste and unlock. Keep the shortcut and passcode private.

## Where it is published

Source code: [ItIsAndrew/Mythos.Guide on GitHub](https://github.com/ItIsAndrew/Mythos.Guide). Source upload was authorized October 19, 2026. The website still runs on this computer; it has not been deployed to Vercel or Sites. Private files and database contents are excluded from Git.

## What is done

- A welcoming landing page leads into the full guide. A three-step beginner path and simple phone navigation help new visitors choose where to start. Old links to guide sections still open the matching section.
- Search and browse 141 Greek and Roman divine figures, including Aether, Euterpe, and lesser-known figures. Both Thalias have working qualified Muse/Grace aliases. Show more or fewer cards, filter by tradition, or meet a random god.
- Every figure has source references, a myth-version note, reviewed topic tags, and a useful next-step topic. There are 12 named topics, including war, love, healing, creation, and dreams. Related stories and worlds are labeled as thematic suggestions where appropriate.
- Coverage includes all 48 figures in [Theoi’s major-pantheon overview](https://www.theoi.com/Pantheon.html) and all 12 Roman [Dei Consentes](https://penelope.uchicago.edu/encyclopaedia_romana/romanforum/deorumconsentium.html), exceeding the requested 75% of this defined major-god reference set. Ancient mythology has no fixed total for all divine figures.
- Family facts, 12 Greek/Roman name comparisons, and an eight-word glossary support research.
- Read 12 original educational retellings, six at a time. Explore six worlds and places, including a healing sanctuary and Roman public life. Stories and worlds include sources and version notes.
- Play five-question Easy, Medium, or Hard quiz rounds drawn from 48 questions. Answers show an explanation and source. Phone questions and feedback stay in view; players can keep playing or end a round to change difficulty.
- Create an account with an available, approved made-up nickname and a password. Save the private recovery code shown once; it can reset a forgotten password without email. Code replacement and password recovery invalidate old codes and sessions.
- Save, edit, and delete up to 100 private mythology notes. A successful save remains confirmed when refreshing fails; the page offers Refresh posts. Routine session checks preserve unfinished forms and edits while account changes clear private data.
- Owner tools moderate posts and pause creation/editing. Password-protected account deletion removes its posts and sessions. Sessions, origin checks, transaction protection, and database-backed rate limits protect account actions.
- Privacy checks reject common personal introductions and contact details while allowing historical school research. Free-text filters cannot recognize every possible name or disguise; owner moderation remains necessary. Use invented nicknames and sample notes only.

## How to try it

1. Open the guide, search **Aether**, and open **Sources & myth versions**. Try a topic, a story, and a world; use **Show more / Show fewer** to control the collection.
2. Choose **Play**, finish a five-question round, and try **Change difficulty**. In **My posts**, create an invented account, save the recovery code privately, then save, edit, and delete a mythology note.

## Latest checks

On October 21, 2026, all **86 automated tests passed** for implementation save point `65a20b8`. Live database checks passed account isolation, validation, moderation, posting controls, recovery, and session revocation. They used disposable collections inside the already configured database; all test collections were removed afterward. Browser checks confirmed save/edit success when the following refresh fails, all three quiz levels, new stories/worlds, and layouts from 320 to 1280 pixels without sideways scrolling. Another chat started further layout work after these checks; its unfinished edits were preserved. See [TESTING.md](TESTING.md) for details and the resolved audit findings.

## What is next

Keep reviewing the educational content and learning paths with beginners. Use invented local test data. No website deployment is authorized: before any future publication, repeat the automated suite, live two-user/owner checks, privacy checks, and browser checks; set secrets privately in the hosting environment and verify HTTPS/Secure cookies. Keep `.env*` first in `.gitignore` and private files outside the public asset list.
