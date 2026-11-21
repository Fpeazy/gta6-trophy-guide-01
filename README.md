# Leonida Ledger — GTA VI Trophy Guide &amp; Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Fpeazy/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Fpeazy/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **All 55 trophies** with their official name, description and grade as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden).
- **A cited guide for every trophy**, written for this entry in its own words: what to do, where and how, and when it can be missed. **495 claims cited** — each trophy's official name, description and grade plus 6 guided steps, every step citing the PlayStation official trophy list, PSNProfiles and Exophase. No specific location or step is given without a source.
- **Tracker**: checklist saved in the browser (localStorage), export to file and import back. Each trophy row shows its own claim count.
- **Filters** by kind (story, missable, collectibles, activities, online), **spoiler setting** that hides story trophies until earned, and search.
- **Roadmap to the platinum** in 7 stages, built from the official descriptions, plus **6 missable flags** — with a dedicated missable list naming all six and when to do each, and a warning banner on every missable trophy's guide.

## Run it

Static files under `app/` — no build step, no network. Serve `app/` with any static server (the repo's `serve.ts` works: `node serve.ts`, then open http://localhost:8080) and it works with the network off.

## Entry

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library. Before copying it validates the data — 55 trophies, 6 steps and named sources each, 495 cited claims — and after writing it verifies the dossier leads with the claim count:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Unofficial fan guide. Not affiliated with Rockstar Games, Take-Two Interactive or PlayStation. No Rockstar logo, artwork, box art or game screenshots are used.

## License

MIT — see [LICENSE](LICENSE).
