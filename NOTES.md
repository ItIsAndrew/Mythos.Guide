# Mythos.Guide

## How to run

Double-click **Start Mythos.Guide.command** in this folder, then use **http://localhost:3000**. Keep the Terminal window open; Control+C stops the app. This Mac uses the Node runtime already bundled with Codex, without an admin password. With Node.js 22+ and dependencies installed, `npm run dev` also works.

Internet is needed for MongoDB. Keep the private URL only in `.env.local` as `MONGODB_URI`.

For owner controls, double-click **Open Owner Controls.command** while the app runs. It copies your private passcode and opens **http://localhost:3000/owner.html**; paste and unlock. Keep this shortcut and `.env.local` private. The passcode is never printed or put in a link.

## Where it is published

Nowhere. The app stays on this computer. Nothing is deployed to Vercel or Sites.

## What is done

- Search 129 sample Greek and Roman divine figures, including Aether, Euterpe, the nine Muses, early gods, Titans, sea gods, and alternate spellings.
- Browse the collection, filter Greek/Roman, show more gods, and open their details.
- Explore four worlds: Olympus, the sea, the underworld, and a Roman hearth.
- Read six original short retellings with museum reference links.
- Play five-question quiz rounds from 16 questions, with explanations, scores, and replay.
- Only `/api` server code uses MongoDB, through one reused client and `client.db()` without a database name. Sample inserts preserve existing records; private environment files stay out of Git.
- Automated checks cover search, browsing, the local server, and the quiz. Desktop and phone browser checks have also covered the main features.
- Invite-only accounts ask for an invented nickname and password, with no real names or contact fields. Passwords use bcrypt (cost 12); member sessions last seven days and owner sessions one hour. Sessions are private cookies; logout revokes them.
- **My posts** saves up to 100 private mythology notes per account. Members can create, edit, delete, or permanently delete their account and posts with their password. Only the owner can moderate everyone’s posts.
- Hidden owner controls create one-use invitations (24 hours), delete any member post with pagination, and turn posting on/off. Off blocks new posts and edits; reading and deletion still work.
- MongoDB-backed rate limits persist across server instances. Post changes have a three-second cooldown. Text is limited to 500 characters; recognizable emails, phone numbers, addresses, social handles, links, and personal introductions are blocked before saving and redacted before display. Filters cannot recognize every disguise or infer whether an arbitrary word is a real name; owner moderation remains necessary.
- Tabs hide private screens when backgrounded and verify the current account on return. Account changes notify other tabs without passing tokens or identity.

## How to try it

Use **Search**, **Gods**, **Their world**, **Stories**, and **Play** in the navigation. Search for Zeus or Neptune, open a god card, switch worlds, read a story, then complete a quiz and choose **Play again**.

To try accounts: open owner controls, create an invitation, then choose **My posts → Join with an invitation**. Choose a made-up nickname such as **Moon-Quill**, a password of at least 10 characters (maximum 72 UTF-8 bytes), and the invitation. Save **Athena is associated with wisdom.**, edit it, and delete it. Use another browser profile or a private window for a second account. There is no email/password recovery; remember the nickname and password. Friends need a reachable app later; this local-only version has no public invitation link.

## Safety rules before any publication or republication

Do not publish unless explicitly requested. Repeat the checks below after account, moderation, or hosting changes; do not rely on an old pass.

- Run `npm test`, then with the local app running run `npm run check:safety`. On this Mac, Codex can run the same scripts with its bundled Node. On October 14, 2026, all 43 automated checks and the final live two-user check passed against the connected database. The made-up test accounts/posts were deleted and the original posting setting restored.
- **Two-user test:** A and B each save a post; each list contains only its own posts. B’s attempts to edit/delete A’s ID fail, including forged ownership fields. Logout and copied/expired sessions fail to access data. Switching accounts in another tab must hide the previous member’s displayed data.
- Invalid/oversized text, recognizable contact details, malformed or extra fields, foreign-origin writes, and requests made too quickly must be rejected. Passwords, passcodes, tokens, private database settings, and contact details must not appear in responses or logs.
- A member cookie must not unlock owner controls. Wrong/missing passcodes fail. The owner can delete any post, including a redacted legacy post and posts reached with **Load older posts**. Posting off blocks both creation and editing; members can still delete. Account deletion requires the password and removes its posts and sessions.
- Keep `.env*` first in `.gitignore`; never serve private files. Keep the saved `MONGODB_URI` and `ADMIN_PASSCODE` only in `.env.local`. If Vercel publication is later authorized, set those same server-only keys in Vercel’s environment settings privately, require HTTPS/Secure cookies, rerun the two-user/moderation checks, and verify the browser assets and headers. No Vercel secrets were uploaded during local work.
- Only `/api` talks to MongoDB through the reused official driver and `client.db()` with no name. Accounts use dedicated `mythos_guide_*` collections in the existing database. Atomic invites, account deletion, and the posting switch require MongoDB transaction support; the connected database passed these checks, and unsupported mutations fail closed.

## What is next

Try the accounts and owner controls locally. Keep reviewing and expanding the educational sample content. Ideas for later: a larger trivia game and a random god generator. Publication remains a separate explicit request and must pass the safety rules above.
