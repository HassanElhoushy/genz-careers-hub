## Plan

Implement only the safe, non-destructive steps you requested. No git history rewriting, no force-push, and no key rotation.

### 1. Create `.env.example`
- Add a new `.env.example` file at the project root.
- Include the same variable names as the current `.env`, but with placeholder values (no real project IDs, URLs, or keys).
- Add a short comment header explaining that real values come from Lovable Cloud and must not be committed.

### 2. Update security memory
- Record that `.env` must never be committed to Git.
- Add a strict rule: for Lovable Cloud-synced projects, never suggest `git filter-branch`, `git-filter-repo`, force-push, or any other history-rewriting approach to remove secrets.
- Note the accepted risk: the current publishable keys were already exposed in history; rotation is deferred per your request because this is a testing phase.

### Out of scope (per your instruction)
- No edits to `.gitignore`.
- No `git rm --cached` or any git command.
- No key rotation.

You will handle `.gitignore` and `git rm --cached .env` locally in your terminal.