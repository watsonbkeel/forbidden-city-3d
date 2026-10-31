# Next shared-entry scope — proposal only, no code/hook

Prerequisites: isolated contact graph must first pass independent review. Current original592 sources incl Collision/FirstPerson remain exact48a. Ground entry/exit and air release still unimplemented; no claim all16 original routes can pass.

Minimal Collision-only candidate entry, FirstPerson unchanged:
- At getValidPosition start invalidate any old call-local handoff. An unregistered CM takes O(1) unchanged old path. Inside each actual tryMove, call candidate grounded step at the current accepted exact feet; default/outside uses old branches, explicit refusal does not fall through to implicit ground. Airborne is explicitly unhandled and keeps original airborne collision path, never creates a handoff.
- Only after successful real substep update candidate exact feet/valid camera/ground and pending result. Failed diagonal or failed X/Z attempt publishes nothing. Every accepted outside/foreign branch clears candidate pending state; if final accepted pose is inside, retain only that pose and actual accepted path identity. Do not use lastFurnitureStepFeet as a substitute ID.
- resolveFurnitureVertical first delegates to candidate vertical stage only when explicitly registered/active. It consumes the pending handoff once at exact final XZ, same grounded original-frame feet and source identity, with revalidation. The feet change comes from already swept actual substeps, not a new downward unswept snap. Any stale/mismatched active token is an explicit diagnostic refusal, not false accepted contact or implicit zero-floor fallback.
- Zero velocity means no getValidPosition call. Vertical stage therefore separately reauthenticates a stationary pose against the real same support/footprint/body. Exact supported stationary pose can remain; deleted/invalid owner fails closed. Partial/unsupported cases must be explicitly unresolved (no claim of a physical anti-fall wall or gravity/release implementation).
- Jump/airborne clears handoff and cannot receive grounded adhesion or reset jump velocity. Landing remains old behavior until separately certified; do not call it candidate acceptance.

TDD before touching shared Collision:
1. Real cm.getValidPosition follows authored uphill/downhill per accepted .25 substeps; isolated vertical call consumes exact final pending result once, no reuse at another position/frame.
2. Failed diagonal and actual X/Z slide sequence; last accepted outside clears; no accepted move cannot synthesize contact from stale token.
3. Real stationary vertical evaluation, invalid/removal, active unsupported; jumping clears.
4. Unbound and genuinely outside managers: original return values/state and ordinary contact/jump/NPC/water trajectories byte/number equivalent to SHA-locked48a CM via explicit before/after driver, no mocks of physical functions.
5. Preserve every prior strict16 route RED and new current originals. Candidate test-ground/entry/exit requires its own visible/live authentication before claiming routes from zero floor.

Open design detail: explicit unresolved vertical result vs throw for unsupported edge. Do not implement a silent floating hold and call it real edge physics. Initial hook tests may restrict to complete certified branch interiors and retain fail-closed diagnostics at incomplete boundaries. Production installation remains forbidden until those semantics and regressions pass review.

## Accepted review refinements18:10
- For this incomplete isolated stage, unsupported/partial stationary vertical or stale/mismatched pending state throws an explicit diagnostic. Never return a truthy partial object (FirstPerson consumes all state fields); never hold suspended state forever or return null into implicit floor recovery. This is a bounded diagnostic refusal, not physical edge/release behavior.
- Any *accepted* legacy/outside branch terminates this call's candidate chain and clears pending. The same call cannot resume authority after reentry; only a later new call can start a complete authenticated chain. A failed outside/diagonal attempt must not invalidate an otherwise valid actual accepted chain.
- Registration validation currently scans rows per body; do not claim World performance. A future per-validation mesh->rows index can preserve duplicates/identity semantics without cross-call cache, but must be a separate measured/negative-tested change.
- Original Collision/FirstPerson Git bytes and SHA/blob identities were copied before any shared edit. This is a two-file predecessor fixture, not a complete historical dependency archive.
