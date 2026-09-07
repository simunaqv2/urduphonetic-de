#!/usr/bin/env node
// SessionStart hook. Two jobs:
//   1. Record a git baseline so session-stop.mjs can tell whether this session changed anything.
//   2. Inject the newest work-history entry plus open .scratch tickets, capped at CAP chars.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const HISTORY = join(ROOT, '.memory', 'history')
const STATE = join(ROOT, '.memory', '.state')
const SCRATCH = join(ROOT, '.scratch')
const CAP = 2048

const git = (...args) => {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

// Fingerprint the working tree, ignoring .memory/ itself: the memory system's own
// writes must never count as "this session changed the repo".
const fingerprint = () => {
  const lines = git('status', '--porcelain')
    .split('\n')
    .filter((l) => l.trim() && !l.slice(3).startsWith('.memory'))
    .sort()
  return createHash('sha256').update(lines.join('\n')).digest('hex')
}

const walk = (dir) => {
  if (!existsSync(dir)) return []
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p))
    else if (entry.name.endsWith('.md') && entry.name !== 'INDEX.md') out.push(p)
  }
  return out
}

const posix = (abs) => abs.slice(ROOT.length + 1).split(sep).join('/')

let raw = ''
for await (const chunk of process.stdin) raw += chunk
let payload = {}
try { payload = JSON.parse(raw || '{}') } catch {}
const short = (payload.session_id || 'unknown').slice(0, 8)

mkdirSync(STATE, { recursive: true })
writeFileSync(join(STATE, short + '.json'), JSON.stringify({
  session_id: payload.session_id ?? null,
  short,
  startedAt: new Date().toISOString(),
  head: git('rev-parse', 'HEAD'),
  fingerprint: fingerprint(),
  blocked: false,
}, null, 2))

const parts = []
const entries = walk(HISTORY).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)

// Refresh the rollup index so history/ stays navigable as it grows (retention policy is
// "keep everything", so the index is what stops the directory becoming unreadable).
if (existsSync(HISTORY)) {
  const byMonth = new Map()
  for (const p of entries) {
    const month = posix(p).split('/')[2] ?? 'unsorted'
    if (!byMonth.has(month)) byMonth.set(month, [])
    byMonth.get(month).push(p)
  }
  const index = ['# Work history index', '', entries.length + ' entries. Newest first.', '']
  for (const month of [...byMonth.keys()].sort().reverse()) {
    index.push('## ' + month, '')
    for (const p of byMonth.get(month)) {
      index.push('- [' + basename(p, '.md') + '](' + posix(p).split('/').slice(2).join('/') + ')')
    }
    index.push('')
  }
  writeFileSync(join(HISTORY, 'INDEX.md'), index.join('\n'))
}

parts.push(entries.length
  ? 'Most recent work-history entry (' + entries.length + ' total, all under .memory/history/):\n\n' + readFileSync(entries[0], 'utf8').trim()
  : 'No work-history entries yet in .memory/history/.')

const open = walk(SCRATCH)
  .filter((p) => p.split(sep).includes('issues'))
  .filter((p) => !/^Status:\s*(resolved|wontfix)/im.test(readFileSync(p, 'utf8')))
  .map((p) => '- ' + posix(p))
if (open.length) parts.push('Open tickets:\n' + open.join('\n'))

let context = parts.join('\n\n---\n\n')
if (context.length > CAP) context = context.slice(0, CAP) + '\n...[truncated]'

process.stdout.write(JSON.stringify({
  hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
}))
