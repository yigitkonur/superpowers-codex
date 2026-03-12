#!/usr/bin/env node
// superpowers-codex — Interactive installer/uninstaller for macOS
// Zero dependencies. Uses only Node.js built-ins.

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// ── Colors (ANSI escape codes) ─────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const ok = (msg) => console.log(`  ${c.green}✓${c.reset} ${msg}`);
const warn = (msg) => console.log(`  ${c.yellow}⚠${c.reset} ${msg}`);
const fail = (msg) => console.log(`  ${c.red}✗${c.reset} ${msg}`);
const info = (msg) => console.log(`  ${c.cyan}→${c.reset} ${msg}`);
const step = (n, total, msg) =>
  console.log(`\n${c.bold}[${n}/${total}]${c.reset} ${msg}`);
const banner = (msg) => console.log(`\n${c.magenta}${c.bold}${msg}${c.reset}`);

// ── Paths ───────────────────────────────────────────────────────────────────

const HOME = process.env.HOME || process.env.USERPROFILE;
const REPO_DIR = path.join(HOME, '.codex', 'superpowers-codex');
const SKILLS_SRC = path.resolve(__dirname, 'skills');
const GLOBAL_SKILLS_DIR = path.join(HOME, '.agents', 'skills');
const GLOBAL_SYMLINK = path.join(GLOBAL_SKILLS_DIR, 'superpowers');
const CONFIG_FILE = path.join(HOME, '.codex', 'config.toml');
const REPO_URL = 'https://github.com/yigitkonur/superpowers-codex.git';

// ── Helpers ─────────────────────────────────────────────────────────────────

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(`  ${c.cyan}?${c.reset} ${question} `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function fileExists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function isSymlink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

function readSymlink(p) {
  try {
    return fs.readlinkSync(p);
  } catch {
    return null;
  }
}

function countSkills(skillsDir) {
  try {
    return fs
      .readdirSync(skillsDir)
      .filter((d) => {
        const skillFile = path.join(skillsDir, d, 'SKILL.md');
        return fileExists(skillFile);
      }).length;
  } catch {
    return 0;
  }
}

function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// ── Install ─────────────────────────────────────────────────────────────────

async function install(mode) {
  banner("superpowers-codex — installer");

  const isGlobal = mode === 'global';
  const isProject = mode === 'project';
  const totalSteps = isGlobal ? 5 : 4;

  // Determine skills source — if running from the cloned repo, use local skills/
  // If running via npx from a temp dir, we need to clone or reference the repo
  let skillsSource = SKILLS_SRC;
  let needsClone = false;

  if (!fileExists(skillsSource)) {
    // Running via npx from a temp location — need to clone
    needsClone = true;
  }

  // ── Step 1: Prerequisites ──

  step(1, totalSteps, 'Checking prerequisites');

  if (!commandExists('node')) {
    fail('Node.js not found. Install it from https://nodejs.org');
    process.exit(1);
  }
  ok(`Node.js ${process.version}`);

  if (!commandExists('git')) {
    fail('git not found. Install it via: xcode-select --install');
    process.exit(1);
  }
  ok('git available');

  // ── Step 2: Clone/update repo (global only) ──

  if (isGlobal) {
    step(2, totalSteps, 'Setting up repository');

    if (needsClone) {
      if (fileExists(REPO_DIR)) {
        info(`Updating existing repo at ${c.dim}${REPO_DIR}${c.reset}`);
        try {
          execSync('git pull --ff-only', { cwd: REPO_DIR, stdio: 'pipe' });
          ok('Repository updated');
        } catch {
          warn('Could not pull (might have local changes). Using existing.');
        }
        skillsSource = path.join(REPO_DIR, 'skills');
      } else {
        info(
          `Cloning to ${c.dim}${REPO_DIR}${c.reset}`
        );
        fs.mkdirSync(path.dirname(REPO_DIR), { recursive: true });
        execSync(`git clone ${REPO_URL} "${REPO_DIR}"`, { stdio: 'inherit' });
        skillsSource = path.join(REPO_DIR, 'skills');
        ok('Repository cloned');
      }
    } else {
      ok(`Using local skills at ${c.dim}${skillsSource}${c.reset}`);
    }
  }

  // ── Step N: Create symlink ──

  const symlinkStep = isGlobal ? 3 : 2;
  const symlinkTarget = isProject
    ? path.join(process.cwd(), '.agents', 'skills', 'superpowers')
    : GLOBAL_SYMLINK;
  const symlinkDir = path.dirname(symlinkTarget);

  step(symlinkStep, totalSteps, `Creating symlink (${isProject ? 'project' : 'user'}-level)`);

  info(
    `${c.dim}${symlinkTarget}${c.reset} → ${c.dim}${skillsSource}${c.reset}`
  );

  // Create parent directory
  if (!fileExists(symlinkDir)) {
    fs.mkdirSync(symlinkDir, { recursive: true });
    ok(`Created ${symlinkDir}`);
  }

  // Handle existing
  if (isSymlink(symlinkTarget)) {
    const oldTarget = readSymlink(symlinkTarget);
    if (oldTarget === skillsSource) {
      ok('Symlink already correct — skipping');
    } else {
      fs.unlinkSync(symlinkTarget);
      fs.symlinkSync(skillsSource, symlinkTarget);
      ok(`Updated symlink (was → ${oldTarget})`);
    }
  } else if (fileExists(symlinkTarget)) {
    fail(
      `${symlinkTarget} exists and is not a symlink. Back it up and remove it, then retry.`
    );
    process.exit(1);
  } else {
    fs.symlinkSync(skillsSource, symlinkTarget);
    ok('Symlink created');
  }

  // ── Step N+1: Config check ──

  const configStep = isGlobal ? 4 : 3;
  step(configStep, totalSteps, 'Checking Codex configuration');

  const AGENT_ROLES = `
[agents]
max_threads = 6
max_depth = 1

[agents.implementer]
description = "Implementation-focused agent. Follows TDD, implements one task at a time, commits work."

[agents.spec-reviewer]
description = "Spec compliance reviewer. Verifies code matches requirements exactly — nothing more, nothing less."

[agents.code-reviewer]
description = "Code quality reviewer. Reviews for clean code, test coverage, maintainability."

[agents.explorer]
description = "Read-only codebase explorer for gathering evidence before changes are proposed."
`;

  if (fileExists(CONFIG_FILE)) {
    let configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
    let changed = false;

    // Add multi_agent = true
    if (!/multi_agent\s*=\s*true/.test(configContent)) {
      warn('multi_agent = true not found in config.toml');
      const answer = await ask('Add superpowers config (multi_agent + agent roles)? (y/N)');
      if (answer.toLowerCase() === 'y') {
        if (configContent.includes('[features]')) {
          configContent = configContent.replace(
            /\[features\]/,
            '[features]\nmulti_agent = true'
          );
        } else {
          configContent += '\n[features]\nmulti_agent = true\n';
        }
        changed = true;
      } else {
        warn('Skipped. Add manually for subagent support.');
      }
    } else {
      ok('multi_agent = true is set');
    }

    // Add agent role definitions if missing
    if (!/\[agents\.implementer\]/.test(configContent)) {
      if (changed || await ask('Add agent role definitions (implementer, spec-reviewer, code-reviewer, explorer)? (y/N)').then(a => a.toLowerCase() === 'y')) {
        configContent += AGENT_ROLES;
        changed = true;
        ok('Added agent role definitions');
      }
    } else {
      ok('Agent roles already configured');
    }

    if (changed) {
      fs.writeFileSync(CONFIG_FILE, configContent);
      ok('config.toml updated');
    }
  } else {
    warn(`${CONFIG_FILE} not found`);
    const answer = await ask('Create config.toml with superpowers config? (y/N)');
    if (answer.toLowerCase() === 'y') {
      fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
      fs.writeFileSync(
        CONFIG_FILE,
        '[features]\nmulti_agent = true\n' + AGENT_ROLES
      );
      ok('Created config.toml with multi_agent + agent roles');
    } else {
      warn('Skipped. Create manually for subagent support.');
    }
  }

  // ── Step N+2: Verify ──

  const verifyStep = isGlobal ? 5 : 4;
  step(verifyStep, totalSteps, 'Verifying installation');

  const skillCount = countSkills(skillsSource);
  if (skillCount > 0) {
    ok(`${skillCount} skills discovered`);
  } else {
    fail('No skills found — check symlink target');
    process.exit(1);
  }

  // ── Done ──

  banner("superpowers installed");
  console.log();
  console.log(`  location:   ${c.dim}${symlinkTarget}${c.reset}`);
  console.log(`  skills:     ${c.cyan}${skillCount}${c.reset} loaded`);
  console.log();
  console.log(`  next steps:`);
  console.log(`    start a new codex session`);
  console.log(`    ask it to build something — $brainstorming fires automatically`);
  console.log(`    reference skills with ${c.cyan}$skill-name${c.reset} in prompts`);
  console.log();
}

// ── Uninstall ───────────────────────────────────────────────────────────────

async function uninstall(mode) {
  banner("superpowers-codex — uninstaller");

  const removeGlobal = mode === 'global' || mode === 'all';
  const removeProject = mode === 'project' || mode === 'all';
  let removed = false;

  // ── Step 1: Remove symlink ──

  step(1, 3, `Removing skills symlink (${mode === 'all' ? 'all scopes' : mode})`);

  // Check global
  if (removeGlobal && isSymlink(GLOBAL_SYMLINK)) {
    fs.unlinkSync(GLOBAL_SYMLINK);
    ok(`Removed ${GLOBAL_SYMLINK}`);
    removed = true;
  } else if (removeGlobal) {
    info('No global symlink found');
  }

  // Check project-level
  const projectSymlink = path.join(
    process.cwd(),
    '.agents',
    'skills',
    'superpowers'
  );
  if (removeProject && isSymlink(projectSymlink)) {
    fs.unlinkSync(projectSymlink);
    ok(`Removed ${projectSymlink}`);
    removed = true;
  } else if (removeProject) {
    info('No project-level symlink found');
  }

  if (!removed) {
    info('No symlinks to remove');
  }

  // ── Step 2: Optionally remove cloned repo ──

  step(2, 3, 'Cloned repository');

  if (fileExists(REPO_DIR)) {
    const answer = await ask(
      `Remove ${c.dim}${REPO_DIR}${c.reset}? (y/N)`
    );
    if (answer.toLowerCase() === 'y') {
      fs.rmSync(REPO_DIR, { recursive: true, force: true });
      ok('Repository removed');
    } else {
      info('Kept repository');
    }
  } else {
    info('No cloned repository found');
  }

  // ── Step 3: Config cleanup ──

  step(3, 3, 'Configuration');

  if (fileExists(CONFIG_FILE)) {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    let cleaned = raw;

    // Remove [agents.*] role sections (implementer, spec-reviewer, etc.)
    cleaned = cleaned.replace(/\n*\[agents\.[^\]]+\]\s*\n(?:[^\[]*(?:\n|$))*/g, '\n');

    // Remove [agents] top-level section (max_threads, max_depth, job_max_runtime_seconds)
    cleaned = cleaned.replace(/\n*\[agents\]\s*\n(?:(?:max_threads|max_depth|job_max_runtime_seconds)\s*=\s*[^\n]*\n?)*/g, '\n');

    // Remove multi_agent = true from [features]
    cleaned = cleaned.replace(/\nmulti_agent\s*=\s*true\s*\n?/g, '\n');

    // Remove empty [features] section if nothing left in it
    cleaned = cleaned.replace(/\[features\]\s*\n(?=\s*\[|$)/, '');

    // Collapse multiple blank lines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim() + '\n';

    if (cleaned !== raw) {
      fs.writeFileSync(CONFIG_FILE, cleaned);
      ok('Removed multi_agent, [agents], and agent role sections from config.toml');
    } else {
      info('No superpowers-related config found to remove');
    }
  }

  console.log(
    `\n${c.bold}${c.green}Uninstall complete.${c.reset}\n`
  );
}

// ── Status ──────────────────────────────────────────────────────────────────

function status() {
  banner("superpowers-codex — status");

  // Global symlink
  if (isSymlink(GLOBAL_SYMLINK)) {
    const target = readSymlink(GLOBAL_SYMLINK);
    ok(`Global symlink: ${c.dim}${GLOBAL_SYMLINK}${c.reset} → ${c.dim}${target}${c.reset}`);
    const count = countSkills(target);
    ok(`  ${count} skills discovered`);
  } else if (fileExists(GLOBAL_SYMLINK)) {
    warn(`${GLOBAL_SYMLINK} exists but is not a symlink`);
  } else {
    fail('No global install found');
  }

  // Project symlink
  const projectSymlink = path.join(
    process.cwd(),
    '.agents',
    'skills',
    'superpowers'
  );
  if (isSymlink(projectSymlink)) {
    const target = readSymlink(projectSymlink);
    ok(
      `Project symlink: ${c.dim}${projectSymlink}${c.reset} → ${c.dim}${target}${c.reset}`
    );
  }

  // Config
  if (fileExists(CONFIG_FILE)) {
    const content = fs.readFileSync(CONFIG_FILE, 'utf8');
    if (/multi_agent\s*=\s*true/.test(content)) {
      ok('multi_agent = true is set in config.toml');
    } else {
      warn('multi_agent not enabled in config.toml');
    }
  } else {
    warn('No config.toml found');
  }

  // Repo
  if (fileExists(REPO_DIR)) {
    ok(`Repository: ${c.dim}${REPO_DIR}${c.reset}`);
  }

  console.log('');
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Support flag-style commands for parity with superpowers-droid
  if (args.includes('--uninstall')) {
    let uMode = 'all';
    if (args.includes('--project')) uMode = 'project';
    else if (args.includes('--user') || args.includes('--global')) uMode = 'global';
    await uninstall(uMode);
    return;
  }
  if (args.includes('--status')) {
    status();
    return;
  }

  if (!command || command === '--help' || command === '-h') {
    console.log(`
${c.bold}superpowers-codex${c.reset} — structured agentic workflows for Codex CLI

${c.bold}usage:${c.reset}
  npx superpowers-codex install              interactive install
  npx superpowers-codex install --user       user-level (~/.agents/skills/)
  npx superpowers-codex install --project    project-level (.agents/skills/)
  npx superpowers-codex uninstall            remove all symlinks
  npx superpowers-codex uninstall --user     remove user-level only
  npx superpowers-codex uninstall --project  remove project-level only
  npx superpowers-codex status               show current install state

${c.bold}aliases:${c.reset}
  --global is accepted as an alias for --user

${c.bold}more info:${c.reset}
  https://github.com/yigitkonur/superpowers-codex
`);
    return;
  }

  switch (command) {
    case 'install': {
      let mode = 'global'; // default = user-level
      if (args.includes('--project')) {
        mode = 'project';
      } else if (args.includes('--user') || args.includes('--global')) {
        mode = 'global';
      } else {
        // Interactive: numbered choice UI
        console.log();
        console.log(`  ${c.cyan}→${c.reset} ${c.bold}1.${c.reset} user-level`);
        console.log(`     ${c.dim}available in all sessions (recommended)${c.reset}`);
        console.log(`    ${c.bold}2.${c.reset} project-level`);
        console.log(`     ${c.dim}only this project${c.reset}`);
        console.log();
        const answer = await ask('[1/2]');
        mode = answer === '2' || answer.toLowerCase().startsWith('p') ? 'project' : 'global';
      }
      await install(mode);
      break;
    }
    case 'uninstall':
    case 'remove': {
      let uMode = 'all';
      if (args.includes('--project')) {
        uMode = 'project';
      } else if (args.includes('--user') || args.includes('--global')) {
        uMode = 'global';
      }
      await uninstall(uMode);
      break;
    }
    case 'status':
      status();
      break;
    default:
      fail(`Unknown command: ${command}`);
      console.log('  Run with --help for usage.');
      process.exit(1);
  }
}

main().catch((err) => {
  fail(err.message);
  process.exit(1);
});
