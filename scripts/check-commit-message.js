#!/usr/bin/env node
'use strict';

// Checks commit messages against the convention in CONTRIBUTING.md
// (Conventional Commits, with the types and scopes of this repository).
//
//   node scripts/check-commit-message.js <file>        # a commit-msg hook
//   node scripts/check-commit-message.js --range A..B  # every commit in a range
//   node scripts/check-commit-message.js --subject "feat(player): ..."

const fs = require('fs');
const { execFileSync } = require('child_process');

const TYPES = ['feat', 'fix', 'docs', 'model', 'test', 'refactor', 'perf', 'style', 'build', 'ci', 'chore', 'revert'];
const SCOPES = ['spec', 'lib', 'cli', 'physics', 'drop', 'player', 'i18n', 'site', 'samples', 'gallery', 'llm', 'python', 'deps', 'release', 'contributing'];
const MAX = 72;

// Returns the problems with one subject line, or an empty list.
function check(subject) {
  if (/^(Merge|Revert|fixup!|squash!) /.test(subject)) return [];
  const m = subject.match(/^([a-z]+)(?:\(([a-z0-9-]+)\))?(!)?: (.+)$/);
  if (!m) return ['does not match "<type>(<scope>): <summary>"'];
  const [, type, scope, , summary] = m;
  const problems = [];
  if (!TYPES.includes(type)) problems.push(`unknown type "${type}" (${TYPES.join(', ')})`);
  if (scope && !SCOPES.includes(scope)) problems.push(`unknown scope "${scope}" (${SCOPES.join(', ')})`);
  if (/^[A-Z][a-z]/.test(summary)) problems.push('summary starts with a capital letter');
  if (/\.$/.test(summary)) problems.push('summary ends with a period');
  if (subject.length > MAX) problems.push(`subject is ${subject.length} characters long (at most ${MAX})`);
  return problems;
}

function report(list) {
  let failed = false;
  for (const { subject, where } of list) {
    const problems = check(subject);
    if (!problems.length) continue;
    failed = true;
    console.error(`✗ ${where ? `${where}: ` : ''}"${subject}"`);
    for (const p of problems) console.error(`    ${p}`);
  }
  if (failed) console.error('\nSee "Commit messages" in CONTRIBUTING.md.');
  return failed ? 1 : 0;
}

if (require.main === module) {
  const [flag, value] = process.argv.slice(2);
  let list;
  if (flag === '--range') {
    const out = execFileSync('git', ['log', '--format=%h %s', value], { encoding: 'utf8' }).trim();
    list = out ? out.split('\n').map((l) => ({ where: l.slice(0, l.indexOf(' ')), subject: l.slice(l.indexOf(' ') + 1) })) : [];
  } else if (flag === '--subject') {
    list = [{ subject: value }];
  } else if (flag) {
    const subject = fs.readFileSync(flag, 'utf8').split('\n').find((l) => l.trim() && !l.startsWith('#')) || '';
    list = [{ subject }];
  } else {
    console.error('usage: check-commit-message.js <file> | --range A..B | --subject "<subject>"');
    process.exit(2);
  }
  process.exit(report(list));
}

module.exports = { check, TYPES, SCOPES };
