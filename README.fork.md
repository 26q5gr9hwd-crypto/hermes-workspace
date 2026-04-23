# hermes-workspace (dangpt fork)

Opinionated fork of [outsourc-e/hermes-workspace](https://github.com/outsourc-e/hermes-workspace),
maintained as the foundation for the self-hosted Hermes dashboard/gateway at `clip.dangpt.ru`.

## Why a fork?

- **Local patches need a home.** We ship small fixes (tool-call rendering, terminal lag, MCP
  route wiring) faster than upstream merges, and rebasing a patch stack on every pull produced
  drift and occasional build breakage.
- **Controlled updates.** Upstream auto-updates were triggering OOM rebuilds on the VPS. The
  fork lets us decide when to merge upstream and rebuild.
- **Runway for custom work.** Planned additions include STT backend integration, streaming
  robustness fixes, and gateway payload adjustments — kept out of upstream until stable.

## Relationship to upstream

- `upstream` remote: `outsourc-e/hermes-workspace` (read-only, periodically merged)
- `origin` remote (this repo): `26q5gr9hwd-crypto/hermes-workspace` (source of truth for the VPS)
- `main` on this fork = upstream/main + the small local fixes listed below.

## Current deltas vs. upstream/main

| Commit | Summary |
|--------|---------|
| `d044b03` | fix(mcp): route `/api/mcp/servers` + `/api/mcp/reload` through `dashboardFetch` |
| `a83d341` | fix(terminal): reduce echo lag (FLUSH_MS 80→16ms) and always show tab close button |
| `c369838` | fix(terminal): raise keystroke rate limit (10/min was blocking typing) |

## Merging upstream

```bash
git fetch upstream
git merge upstream/main      # resolve conflicts, run pnpm build locally
git push origin main
```

The VPS `hermes-workspace-update.timer` pulls from this fork (`origin`), so no rebuild fires
until a commit lands on `main` here.

## 30-day checkpoint

This fork is under evaluation. See the "CLIP-FORK-1" review in Notion for the decision
criteria: shipped deltas, upstream velocity, build stability, and whether Open WebUI /
nesquena would be a better daily driver.
