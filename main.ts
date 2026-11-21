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

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

// Fail loudly before copying anything if the guide's own data is not
// exactly what the bounty asks for: 55 trophies, each with a name and a
// guide. A corrupt or short trophies.json would otherwise ship a guide
// that claims 55 trophies and delivers fewer — the judge reads the
// dossier, not the source, so this is the last place the count can be
// caught before the entry is sealed.
const trophyData = JSON.parse(readFileSync(join(appDir, 'data', 'trophies.json'), 'utf8'));
const trophies = trophyData?.trophies;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  throw new Error(
    `trophies.json must hold exactly 55 trophies, got ${Array.isArray(trophies) ? trophies.length : 'no trophies array'}`,
  );
}
for (const trophy of trophies) {
  if (typeof trophy?.name !== 'string' || trophy.name.trim() === '') {
    throw new Error(`trophy ${JSON.stringify(trophy?.id ?? trophy)} has no name`);
  }
  if (typeof trophy?.guide !== 'string' || trophy.guide.trim() === '') {
    throw new Error(`trophy ${JSON.stringify(trophy.name)} has no guide`);
  }
}

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

// Verify the write landed as a real dossier: it must parse, carry the
// dossier schema, hold the guide's text, and list exactly one image per
// screenshot actually copied. A truncated or empty dossier would
// otherwise pass silently and be scored as a broken guide.
const written = JSON.parse(readFileSync(join(outputDir, 'dossier.json'), 'utf8'));
const shotCount = readdirSync(join(outputDir, 'screenshots')).length;
if (written?.schema !== 'makefun/dossier/v1') {
  throw new Error(`dossier.json has unexpected schema: ${JSON.stringify(written?.schema)}`);
}
if (typeof written?.text !== 'string' || written.text.length === 0) {
  throw new Error('dossier.json holds no guide text');
}
if (!Array.isArray(written?.images) || written.images.length !== shotCount) {
  throw new Error(
    `dossier.json lists ${Array.isArray(written?.images) ? written.images.length : 'no'} images for ${shotCount} screenshots`,
  );
}
