#!/usr/bin/env node
/**
 * pd-upload — Photo Distributor CLI
 *
 * Upload photos and videos from a local path (or an auto-detected SD card)
 * to a running photo-distributor server via FTP.
 *
 * Usage:
 *   pd-upload                          # auto-detect SD card and upload
 *   pd-upload /path/to/photos          # upload from a specific path
 *   pd-upload detect                   # list detected SD cards and exit
 *   pd-upload config                   # save default connection settings
 *
 * Connection flags (override saved config):
 *   --host <host>         FTP host      (default: localhost)
 *   --port <port>         FTP port      (default: 2121)
 *   --user <user>         FTP username  (default: pd)
 *   --password <pass>     FTP password
 *   --dry-run             Show what would be uploaded, but don't upload
 */

import { program } from 'commander'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

import { loadConfig, saveConfig } from './config.js'
import { detectSdCards, findMediaFiles } from './detect-cards.js'
import { uploadFiles, SUPPORTED_EXTENSIONS } from './uploader.js'

// Resolve package version from package.json
const require = createRequire(import.meta.url)
const pkg = require(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json'),
)

// ─── helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

/**
 * Merge CLI flags on top of the saved config, using only the flags that were
 * explicitly provided (so omitted flags don't overwrite saved values with
 * their Commander defaults).
 */
function resolveConnection(opts, saved) {
  return {
    host: opts.host ?? saved.host,
    port: opts.port != null ? Number(opts.port) : saved.port,
    user: opts.user ?? saved.user,
    password: opts.password ?? saved.password,
  }
}

/**
 * Prompt the user and return their answer.
 */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

/**
 * Print a simple inline progress bar.
 */
function progressBar(current, total, width = 30) {
  const pct = total === 0 ? 1 : current / total
  const filled = Math.round(pct * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  return `[${bar}] ${current}/${total}`
}

// ─── upload logic ────────────────────────────────────────────────────────────

/**
 * Run the full upload flow from a source directory.
 */
async function runUpload(sourcePath, conn, dryRun) {
  console.log(`\n🔍 Scanning ${sourcePath} …`)

  const files = await findMediaFiles(sourcePath, SUPPORTED_EXTENSIONS)

  if (files.length === 0) {
    console.log('   No supported media files found.')
    return
  }

  console.log(`   Found ${files.length} file(s)`)

  if (dryRun) {
    console.log('\n🧪 Dry-run mode — files that would be uploaded:')
    for (const f of files) {
      console.log(`   ${f}`)
    }
    console.log(`\n   Total: ${files.length} file(s)`)
    return
  }

  if (!conn.password) {
    conn.password = await prompt(
      `🔑 FTP password for ${conn.user}@${conn.host}:${conn.port}: `,
    )
  }

  console.log(
    `\n📡 Connecting to ftp://${conn.user}@${conn.host}:${conn.port} …`,
  )

  let lastLine = ''

  const stats = await uploadFiles({
    ...conn,
    files,
    onProgress(current, total, filePath, status, errMsg) {
      const filename = path.basename(filePath)
      const bar = progressBar(current, total)
      const icon =
        status === 'done'
          ? '✅'
          : status === 'error'
            ? '❌'
            : status === 'skipped'
              ? '⏭️ '
              : '⬆️ '

      const line = `  ${icon} ${bar}  ${filename}`

      // Clear previous line and overwrite
      if (lastLine) process.stdout.write('\r' + ' '.repeat(lastLine.length) + '\r')
      process.stdout.write(line)
      lastLine = line

      if (status === 'done' || status === 'error' || status === 'skipped') {
        if (status === 'error') {
          process.stdout.write(`\n     ⚠️  ${errMsg}\n`)
          lastLine = ''
        } else if (current === total) {
          process.stdout.write('\n')
          lastLine = ''
        }
      }
    },
  })

  console.log(`\n✨ Done!`)
  console.log(`   Uploaded : ${stats.uploaded}`)
  if (stats.skipped > 0) console.log(`   Skipped  : ${stats.skipped}`)
  if (stats.failed > 0) console.log(`   Failed   : ${stats.failed}`)
}

// ─── commands ────────────────────────────────────────────────────────────────

program
  .name('pd-upload')
  .description(
    'Upload photos and videos from an SD card (or any folder) to photo-distributor.',
  )
  .version(pkg.version)

// Shared connection flags added to all (sub)commands
function addConnectionOptions(cmd) {
  return cmd
    .option('--host <host>', 'FTP host')
    .option('--port <port>', 'FTP port', (v) => parseInt(v, 10))
    .option('--user <user>', 'FTP username')
    .option('--password <password>', 'FTP password')
    .option('--dry-run', 'Show what would be uploaded without uploading')
}

// ── detect ──────────────────────────────────────────────────────────────────
program
  .command('detect')
  .description('Detect connected SD cards / camera storage and list them.')
  .action(async () => {
    console.log('🔎 Scanning for SD cards …')
    const cards = await detectSdCards()

    if (cards.length === 0) {
      console.log('   No SD cards with a DCIM folder detected.')
      return
    }

    console.log(`\n   Found ${cards.length} card(s):\n`)
    for (const card of cards) {
      console.log(`   📸 ${card.name}`)
      console.log(`      Path : ${card.path}`)
      console.log(`      DCIM : ${card.dcimPath}`)
      console.log()
    }
  })

// ── config ───────────────────────────────────────────────────────────────────
addConnectionOptions(
  program
    .command('config')
    .description(
      'Save default connection settings to ~/.photo-distributor.json.',
    ),
).action(async (opts) => {
  const saved = await loadConfig()
  const updates = {}

  if (opts.host) updates.host = opts.host
  if (opts.port) updates.port = opts.port
  if (opts.user) updates.user = opts.user
  if (opts.password) updates.password = opts.password

  if (Object.keys(updates).length === 0) {
    console.log('\n📋 Current saved config:')
    console.log(`   host     : ${saved.host}`)
    console.log(`   port     : ${saved.port}`)
    console.log(`   user     : ${saved.user}`)
    console.log(`   password : ${saved.password ? '(set)' : '(not set)'}`)
    console.log(
      '\nProvide flags to update (e.g. --host 192.168.1.50 --password secret)',
    )
    return
  }

  const next = await saveConfig(updates)
  console.log('\n✅ Config saved to ~/.photo-distributor.json')
  console.log(`   host     : ${next.host}`)
  console.log(`   port     : ${next.port}`)
  console.log(`   user     : ${next.user}`)
  console.log(`   password : ${next.password ? '(set)' : '(not set)'}`)
})

// ── upload (default command) ─────────────────────────────────────────────────
addConnectionOptions(
  program
    .command('upload [source]', { isDefault: true })
    .description(
      'Upload photos/videos from [source] (or an auto-detected SD card) to photo-distributor.',
    ),
).action(async (source, opts) => {
  const saved = await loadConfig()
  const conn = resolveConnection(opts, saved)
  const dryRun = !!opts.dryRun

  // ── resolve source path ──────────────────────────────────────────────────
  let sourcePath = source

  if (!sourcePath) {
    console.log('🔎 Scanning for SD cards …')
    const cards = await detectSdCards()

    if (cards.length === 0) {
      console.error(
        '❌ No SD cards detected. Provide a path: pd-upload /path/to/photos',
      )
      process.exit(1)
    }

    if (cards.length === 1) {
      const card = cards[0]
      console.log(`\n📸 Found: ${card.name} (${card.path})`)
      const answer = await prompt('   Upload from this card? [Y/n] ')
      if (answer.toLowerCase() === 'n') {
        console.log('Cancelled.')
        process.exit(0)
      }
      sourcePath = card.dcimPath
    } else {
      console.log(`\n   Found ${cards.length} cards:\n`)
      cards.forEach((card, i) => {
        console.log(`   [${i + 1}] ${card.name} — ${card.path}`)
      })
      console.log()

      let chosen
      while (!chosen) {
        const answer = await prompt(`   Select card [1-${cards.length}]: `)
        const idx = parseInt(answer, 10) - 1
        if (!isNaN(idx) && idx >= 0 && idx < cards.length) {
          chosen = cards[idx]
        } else {
          console.log('   Invalid selection, try again.')
        }
      }

      sourcePath = chosen.dcimPath
    }
  }

  await runUpload(sourcePath, conn, dryRun)
})

program.parse()
