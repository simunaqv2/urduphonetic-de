# Urdu Keyboard

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, using the default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Shared memory

Two stores under `.memory/`, with deliberately opposite lifecycles. Keep them separate.

### `.memory/knowledge/` — curated, auto-loaded

`autoMemoryDirectory` points here, so `MEMORY.md` and every entry load into **every** session. That makes each line a permanent per-turn context cost: keep entries short, one fact per file, and delete what turns out to be wrong.

Use the built-in frontmatter schema (`name`, `description`, `metadata.type` of `user` | `feedback` | `project` | `reference`) and link entries with `[[slug]]`. Add a one-line pointer to `MEMORY.md` for each new entry.

### `.memory/history/` — append-only, read on demand

Never auto-loaded. One file per unit of work:

```
.memory/history/<YYYY-MM>/<ISO-timestamp>-<short-session-id>-<slug>.md
```

The session id in the filename is what makes concurrent sessions safe — no two sessions write the same path, so no locking is needed — and is how the Stop hook detects that this session recorded its work.

**Write an entry when a coherent chunk of work lands**, not per file edit and not only at session end. Say what changed, why, and what was rejected.

### Hooks

- `.claude/hooks/session-start.mjs` — records a git baseline, then injects the newest history entry plus open `.scratch/` tickets, capped at 2KB, and refreshes `history/INDEX.md`.
- `.claude/hooks/session-stop.mjs` — if the repo changed but no history entry carries this session's id, blocks **once** to force one, then never again that session.

Both exclude `.memory/` from the git fingerprint, so the memory system's own writes never count as "the repo changed".
