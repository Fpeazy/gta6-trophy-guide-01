// Leonida Ledger — entry program for gta6-trophy-guide-01 (Node 22, stdlib only).
//
// What it does, in order:
//   1. Takes the guide's own files — app/ (the offline guide) and
//      screenshots/ (3 or 4 renders of it in a browser) — from beside this
//      file and copies them into the output directory.
//   2. Writes /output/dossier.json with the vendored make.fun library, which
//      is the summary the judge reads: the screenshots, the first load's
//      files and bytes, and the guide's source. The library is left exactly
//      as the kit shipped it; the scorer rebuilds the dossier with its own
//      copy and the two must match byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for
// /output, e.g. `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.
// It is deterministic: two runs write the same bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

mkdirSync(outputDir, { recursive: true });
cpSync(appDir, join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's caps for this bounty (reference/gate.json): the text cap
// shapes the dossier's bytes; the others refuse an entry the scorer would
// refuse — more than 4 screenshots, one over 256 KiB, or app/ past 993
// files and directories / 48 MiB. Our app is 5 files and the screenshots
// are 4 JPEGs, well inside every cap.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
