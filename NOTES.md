# Mythos.Guide

## How to run

Double-click **Start Mythos.Guide.command** in this folder, then use **http://localhost:3000**. Keep the Terminal window open; Control+C stops the app. This Mac uses the Node runtime already bundled with Codex, without an admin password. With Node.js 22+ and dependencies installed, `npm run dev` also works.

Internet is needed for MongoDB. Keep the private URL only in `.env.local` as `MONGODB_URI`.

For owner controls, double-click **Open Owner Controls.command** while the app runs. It copies your private passcode and opens **http://localhost:3000/owner.html**; paste and unlock. Keep this shortcut and `.env.local` private. The passcode is never printed or put in a link.

## Where it is published

Source code: [ItIsAndrew/Mythos.Guide on GitHub](https://github.com/ItIsAndrew/Mythos.Guide). The user authorized this source upload on October 19, 2026. The app still runs on this computer; nothing is deployed to Vercel or Sites. Private environment files and database contents are excluded from the repository.

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
- Choose Easy, Medium, or Hard for five-question quiz rounds from 48 questions (16 per difficulty). Each level now has more Greek and Roman questions, including Hera, Diana, Persephone, Aurora, Euterpe, and Pomona. Hard features lesser-known figures; each answer has an explanation, with scores and replay.
- Only `/api` server code uses MongoDB, through one reused client and `client.db()` without a database name. Sample inserts preserve existing records; private environment files stay out of Git.
- All 59 automated tests pass, including topic combinations, random selection, related suggestions, name pairings, lesser-known search names, and distinct quiz questions. Every one of the 48 quiz questions passed correct-answer, incorrect-answer, and answer-locking checks. Live browser checks passed full Easy/Medium/Hard rounds, feedback, scores, replay, difficulty switching, keyboard play, and 320/390-pixel phone and 1280-pixel desktop layouts without sideways scrolling. Earlier browser checks passed all five discovery tools, filters, next-step destinations, keyboard focus, and glossary no-match recovery; live database checks confirmed Heracles, both figures named Thalia, and all 141 browse entries.
- Invite-only accounts ask for a made-up nickname and password, with no real names or contact fields. New members get an impersonal nickname made from approved word pairs and can ask the page for another suggestion; existing members can still log in with their original nickname. Passwords use bcrypt (cost 12); member sessions last seven days and owner sessions one hour. Sessions are private cookies; logout revokes them.
- **My posts** saves up to 100 private mythology notes per account. Members can create, edit, delete, or permanently delete their account and posts with their password. Only the owner can moderate everyone’s posts.
- Hidden owner controls create one-use invitations (24 hours), delete any member post with pagination, and turn posting on/off. Off blocks new posts and edits; reading and deletion still work.
- MongoDB-backed rate limits persist across server instances. Post changes have a three-second cooldown. New accounts use a curated, two-word nickname; existing accounts keep their login format. Text is limited to 500 characters; recognizable school details, emails, phone numbers, addresses, social handles, links, and personal references such as “my friend” are blocked before saving and redacted before display. Free-text filters cannot recognize every possible name or disguise; owner moderation remains necessary.
- Tabs hide private screens when backgrounded and verify the current account on return. Account changes notify other tabs without passing tokens or identity.

## How to try it

The full local app was checked on October 16, 2026. On October 19, the account privacy changes passed all 59 automated tests, the live account/post/owner safety checks, and a browser signup check. All disposable test data was removed and the original posting setting restored. See [TESTING.md](TESTING.md) for details and one older symbol-data item to review.

Use **Search**, **Gods**, **Their world**, **Stories**, and **Play** in the navigation. Search for Aether or Euterpe, open a god card, switch worlds, read a story, then complete a quiz and choose **Play again**.

Try **Morpheus** in Search to find a lesser-known figure. In **Play**, choose a difficulty before starting; **Play again** keeps that level, and **Change difficulty** returns to the chooser.

For the expanded trivia game, choose **Play → Easy, Medium, or Hard → Start quiz**. Finish five answers to see your score, then choose **Play again** for another shuffled round or **Change difficulty** to try another level. Questions do not repeat within a round; they can return in later rounds.

For family facts, search **Zeus** or **Athena** and choose **Family & more facts** below the main description. In **Gods**, opening a figure with family facts shows the same extra section.

For discovery, choose **Meet a random god**, then **Meet another random god** in its details. Open **What can I explore next?** to read a suggested story or visit a world. In **Gods**, choose **Explore by topic**, combine it with Greek or Roman, and use **Show more / Show fewer gods** when available.

In **Basics**, open **Greek and Roman names** and tap a name to search it. Open **Mythology word guide** and type **nature** to find definitions that mention nature; clear the field to see all eight words.

To try accounts: open owner controls, create an invitation, then choose **My posts → Join with an invitation**. The page suggests a made-up nickname; choose **Suggest another nickname** if you prefer. Enter a password of at least 10 characters (maximum 72 UTF-8 bytes) and the invitation. Save **Athena is associated with wisdom.**, edit it, and delete it. Use another browser profile or a private window for a second account. There is no email/password recovery; remember the nickname and password. Friends need a reachable app later; this local-only version has no public invitation link.

## Safety rules before any publication or republication

Do not publish unless explicitly requested. Repeat the checks below after account, moderation, or hosting changes; do not rely on an old pass.

- Run `npm test`, then with the local app running run `npm run check:safety`. On this Mac, Codex can run the same scripts with its bundled Node. On October 19, 2026, all 59 automated checks and the live two-user check passed against the connected database. The made-up test accounts/posts were deleted and the original posting setting restored.
- **Two-user test:** A and B each save a post; each list contains only its own posts. B’s attempts to edit/delete A’s ID fail, including forged ownership fields. Logout and copied/expired sessions fail to access data. Switching accounts in another tab must hide the previous member’s displayed data.
- Invalid/oversized text, recognizable contact details, malformed or extra fields, foreign-origin writes, and requests made too quickly must be rejected. Passwords, passcodes, tokens, private database settings, and contact details must not appear in responses or logs.
- A member cookie must not unlock owner controls. Wrong/missing passcodes fail. The owner can delete any post, including a redacted legacy post and posts reached with **Load older posts**. Posting off blocks both creation and editing; members can still delete. Account deletion requires the password and removes its posts and sessions.
- Keep `.env*` first in `.gitignore`; never serve private files. Keep the saved `MONGODB_URI` and `ADMIN_PASSCODE` only in `.env.local`. If Vercel publication is later authorized, set those same server-only keys in Vercel’s environment settings privately, require HTTPS/Secure cookies, rerun the two-user/moderation checks, and verify the browser assets and headers. No Vercel secrets were uploaded during local work.
- Only `/api` talks to MongoDB through the reused official driver and `client.db()` with no name. Accounts use dedicated `mythos_guide_*` collections in the existing database. Atomic invites, account deletion, and the posting switch require MongoDB transaction support; the connected database passed these checks, and unsupported mutations fail closed.

## What is next

Try the accounts and owner controls locally. Keep reviewing and expanding the educational sample content and trivia questions. Website deployment remains a separate explicit request and must pass the safety rules above.
