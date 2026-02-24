# Deferred Items — Phase 04

## Pre-existing build errors (out of scope for 04-02)

**Source:** `src/data/challenges/index.ts` — 3 Challenge objects missing required fields added in Phase 03 (tier, drillAnswer, drillAnswerScope, drillWrongOptions)

**Cause:** Plan 03-01 extended the Challenge type with new required drill fields, but the seed challenge data objects in `src/data/challenges/index.ts` were not updated to include those fields.

**Impact:** `tsc -b` (composite build) fails. `tsc --noEmit` passes. Dev server (`npm run dev`) works fine. Production build (`npm run build`) fails.

**Resolution:** Phase 05 content plan should update `src/data/challenges/index.ts` with `tier`, `drillAnswer`, `drillAnswerScope`, and `drillWrongOptions` for all 3 seed challenges.
