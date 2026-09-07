#!/usr/bin/env node
// Stop hook. If this session changed the repo but wrote no history entry, block exactly
// once to force one. The `blocked` flag makes a second block structurally impossible,
// so this can never trap the session in a loop.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const HISTORY = join(ROOT, '.memory', 'history')
const STATE = join(ROOT, '.memory', '.state')

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
    else out.push(p)
  }
  return out
}

let raw = ''
for await (const chunk of process.stdin) raw += chunk
let payload = {}
try { payload = JSON.parse(raw || '{}') } catch {}

const short = (payload.session_id || '').slice(0, 8)
if (!short) process.exit(0)

const statePath = join(STATE, `${short}.json`)
if (!existsSync(statePath)) process.exit(0) // no baseline: hook added mid-session, stay quiet

const state = JSON.parse(readFileSync(statePath, 'utf8'))
if (state.blocked) process.exit(0) // already nudged once this session

const changed =
  git('rev-parse', 'HEAD') !== state.head ||
  fingerprint() !== state.fingerprint
if (!changed) process.exit(0)

if (walk(HISTORY).some((p) => p.includes(short))) process.exit(0) // entry already written

state.blocked = true
writeFileSync(statePath, JSON.stringify(state, null, 2))

const month = new Date().toISOString().slice(0, 7)
process.stdout.write(JSON.stringify({
  decision: 'block',
  reason: `This session changed the repository but wrote no work-history entry. Write one at .memory/history/${month}/<ISO-timestamp>-${short}-<slug>.md summarising what changed and why, linking any .scratch/ ticket it advanced, then finish. This check will not fire again this session.`,
}))
