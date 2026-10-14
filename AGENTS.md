# Project save points

- After every working change, make a Git commit with a short, clear message.
- Verify the change with checks appropriate to the work before committing.
- Keep secrets and generated dependencies out of commits; respect `.gitignore`.
- When the user says "go back," inspect the working tree and recent commits. Restore unfinished changes to the latest save point; if the working tree is clean, undo the latest change commit with a new revert commit.
- Explain exactly what was undone. Preserve earlier save points, ignored local files, and unrelated files; do not rewrite history or run a broad `git clean`.
