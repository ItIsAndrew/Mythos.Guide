# Mythos.Guide

## How to run

Double-click **Start Mythos.Guide.command** in this folder, then use **http://localhost:3000**. Keep the Terminal window open; Control+C stops the app. This Mac uses the Node runtime already bundled with Codex, without an admin password. With Node.js 22+ and dependencies installed, `npm run dev` also works.

Internet is needed for MongoDB. Keep the private URL only in `.env.local` as `MONGODB_URI`.

For owner controls, double-click **Open Owner Controls.command** while the app runs. It copies your private passcode and opens **http://localhost:3000/owner.html**; paste and unlock. Keep this shortcut and `.env.local` private. The passcode is never printed or put in a link.

## Where it is published

Nowhere. The app stays on this computer. Nothing is deployed to Vercel or Sites.

## What is done

- Search 141 sample Greek and Roman divine figures, including lesser-known figures such as Hebe, Morpheus, Nereus, the Muses, Furies, Graces, and Horae. Alternate spellings work too.
- The archive covers all 48 named Greek figures in [Theoi's major-pantheon overview](https://www.theoi.com/Pantheon.html) and all 12 Roman [Dei Consentes](https://penelope.uchicago.edu/encyclopaedia_romana/romanforum/deorumconsentium.html). This defined 60-name reference set exceeds the 75% goal for major gods; ancient traditions have many more local and minor deities, so there is no fixed total for *all* gods.
- Browse the collection, filter Greek/Roman, show more or fewer gods, and open their details.
- **Meet a random god** introduces a figure without needing a name. **Meet another random god** changes the figure without immediately repeating the one on screen.
- **What can I explore next?** offers a connected story or world from each god's search result and details, with a stories link when no suggestion fits.
- **Explore by topic** filters the collection by sea and water, sky and stars, arts and wisdom, nature and growth, or the underworld. Topic and Greek/Roman filters work together.
- **Basics → Greek and Roman names** compares 12 familiar name pairings with short shared themes and links to search each name. The two traditions are not treated as identical.
- **Basics → Mythology word guide** explains eight common words. Its search checks both the word and its meaning.
- A **New to mythology? Start here** guide introduces a three-step path: meet the gods, read a story, then choose Easy in the quiz. Phones have a simple **Start here / Explore** navigation and next-step links between the collection, stories, and quiz.
- Phone layouts have readable text, tap areas of at least 44 pixels, a full-width search button, and wrapping for long notes and codes. Checked small phones (320–430 pixels), landscape phones, tablets, and desktop with no sideways scrolling. Search, stories, god details, quizzes, and account forms were checked in the browser; signed-in and owner layouts used invented in-memory samples.
- Search results now have a **Family & more facts** button where sourced family details are available. The expanded god view shows parents, partners, children, siblings, a short fact, and a source link as applicable; myths may differ by account.
- Explore four worlds: Olympus, the sea, the underworld, and a Roman hearth.
- Read six original short retellings with museum reference links.
- Choose Easy, Medium, or Hard for five-question quiz rounds from 24 questions. Hard features lesser-known figures; each answer has an explanation, with scores and replay.
- Only `/api` server code uses MongoDB, through one reused client and `client.db()` without a database name. Sample inserts preserve existing records; private environment files stay out of Git.
- All 58 automated tests pass, including topic combinations, random selection, related suggestions, name pairings, lesser-known search names, and distinct quiz questions. Live browser checks passed for all five new discovery tools, combined filters, show-more/show-fewer, next-step destinations, keyboard focus, glossary no-match recovery, and layouts from 320 to 1280 pixels without sideways scrolling. Earlier live browser and database checks confirmed Heracles, both figures named Thalia, and all 141 browse entries.
- Invite-only accounts ask for an invented nickname and password, with no real names or contact fields. Passwords use bcrypt (cost 12); member sessions last seven days and owner sessions one hour. Sessions are private cookies; logout revokes them.
- **My posts** saves up to 100 private mythology notes per account. Members can create, edit, delete, or permanently delete their account and posts with their password. Only the owner can moderate everyone’s posts.
- Hidden owner controls create one-use invitations (24 hours), delete any member post with pagination, and turn posting on/off. Off blocks new posts and edits; reading and deletion still work.
- MongoDB-backed rate limits persist across server instances. Post changes have a three-second cooldown. New accounts need a two-part invented nickname; existing accounts keep their login format. Text is limited to 500 characters; recognizable school details, emails, phone numbers, addresses, social handles, links, and personal introductions are blocked before saving and redacted before display. Filters cannot recognize every disguise or infer whether arbitrary words are real names; owner moderation remains necessary.
- Tabs hide private screens when backgrounded and verify the current account on return. Account changes notify other tabs without passing tokens or identity.

## How to try it

Use **Search**, **Gods**, **Their world**, **Stories**, and **Play** in the navigation. Search for Aether or Euterpe, open a god card, switch worlds, read a story, then complete a quiz and choose **Play again**.

Try **Morpheus** in Search to find a lesser-known figure. In **Play**, choose a difficulty before starting; **Play again** keeps that level, and **Change difficulty** returns to the chooser.

For family facts, search **Zeus** or **Athena** and choose **Family & more facts** below the main description. In **Gods**, opening a figure with family facts shows the same extra section.

For discovery, choose **Meet a random god**, then **Meet another random god** in its details. Open **What can I explore next?** to read a suggested story or visit a world. In **Gods**, choose **Explore by topic**, combine it with Greek or Roman, and use **Show more / Show fewer gods** when available.

In **Basics**, open **Greek and Roman names** and tap a name to search it. Open **Mythology word guide** and type **nature** to find definitions that mention nature; clear the field to see all eight words.

To try accounts: open owner controls, create an invitation, then choose **My posts → Join with an invitation**. Choose a two-part made-up nickname such as **Moon-Quill**, a password of at least 10 characters (maximum 72 UTF-8 bytes), and the invitation. Save **Athena is associated with wisdom.**, edit it, and delete it. Use another browser profile or a private window for a second account. There is no email/password recovery; remember the nickname and password. Friends need a reachable app later; this local-only version has no public invitation link.

## Safety rules before any publication or republication

Do not publish unless explicitly requested. Repeat the checks below after account, moderation, or hosting changes; do not rely on an old pass.

- Run `npm test`, then with the local app running run `npm run check:safety`. On this Mac, Codex can run the same scripts with its bundled Node. On October 14, 2026, all 43 automated checks and the final live two-user check passed against the connected database. The made-up test accounts/posts were deleted and the original posting setting restored.
- **Two-user test:** A and B each save a post; each list contains only its own posts. B’s attempts to edit/delete A’s ID fail, including forged ownership fields. Logout and copied/expired sessions fail to access data. Switching accounts in another tab must hide the previous member’s displayed data.
- Invalid/oversized text, recognizable contact details, malformed or extra fields, foreign-origin writes, and requests made too quickly must be rejected. Passwords, passcodes, tokens, private database settings, and contact details must not appear in responses or logs.
- A member cookie must not unlock owner controls. Wrong/missing passcodes fail. The owner can delete any post, including a redacted legacy post and posts reached with **Load older posts**. Posting off blocks both creation and editing; members can still delete. Account deletion requires the password and removes its posts and sessions.
- Keep `.env*` first in `.gitignore`; never serve private files. Keep the saved `MONGODB_URI` and `ADMIN_PASSCODE` only in `.env.local`. If Vercel publication is later authorized, set those same server-only keys in Vercel’s environment settings privately, require HTTPS/Secure cookies, rerun the two-user/moderation checks, and verify the browser assets and headers. No Vercel secrets were uploaded during local work.
- Only `/api` talks to MongoDB through the reused official driver and `client.db()` with no name. Accounts use dedicated `mythos_guide_*` collections in the existing database. Atomic invites, account deletion, and the posting switch require MongoDB transaction support; the connected database passed these checks, and unsupported mutations fail closed.

## What is next

Try the accounts and owner controls locally. Keep reviewing and expanding the educational sample content. An idea for later is a larger trivia game. Publication remains a separate explicit request and must pass the safety rules above.
