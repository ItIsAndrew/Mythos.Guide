# Project save points

- After every working change, make a Git commit with a short, clear message.
- Verify the change with checks appropriate to the work before committing.
- Keep secrets and generated dependencies out of commits; respect `.gitignore`.
- When the user says "go back," inspect the working tree and recent commits. Restore unfinished changes to the latest save point; if the working tree is clean, undo the latest change commit with a new revert commit.
- Explain exactly what was undone. Preserve earlier save points, ignored local files, and unrelated files; do not rewrite history or run a broad `git clean`.

# Mythos.Guide local app

- God-name search, browsing gods and goddesses, exploring the gods' world, reading stories, and a mythology quiz are now authorized. Keep the experience simple and accessible.
- Use a simple web page plus Vercel-compatible serverless functions in `/api`, using the official `mongodb` driver.
- Only server code in `/api` may talk to MongoDB. Create the MongoDB client once and reuse it.
- Keep the real database URL only in `.env.local` as `MONGODB_URI`, and later in Vercel environment variables if deployment is requested. Never put it in code, fallbacks, logs, chat, or commits, and never ask the user to paste it into chat.
- Use the database already specified in the URL: call `client.db()` with no name. Do not use `MONGODB_DB` or a hardcoded database name.
- Keep `.env*` first in `.gitignore`.
- The one-time URL entry and private connection check are complete. Keep the user's saved `.env.local`; do not reset it to the placeholder.
- GitHub source upload is authorized to https://github.com/ItIsAndrew/Mythos.Guide. Keep secrets and database contents private. Website hosting or deployment still requires a separate explicit request. Use only made-up sample data, no real people.
- Run the app locally, open it in the user's browser, and give simple steps for trying the features. The user should not need to read code or debug.
- Maintain a short `NOTES.md` with how to run, publication status, completed work, and next steps. Update it after each big change.
