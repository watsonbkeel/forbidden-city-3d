# Unchanged batch world-matrix writes

This change is a successor to remote 0b746683, whose exact tree is local 75d0634b. Preserve that candidate and main. Reduce redundant matrix texture writes without changing scene membership, geometry, material, shadows, visibility, movement, or defaults.

Use one per-entry snapshot of the last successfully submitted complete world matrix. The first frame and each rebuilt batch have no valid snapshot and must submit. Subsequent frames skip only an exactly unchanged matrix. Parent and child transforms must remain current because collection, matrix-world updates and signature invalidation stay unchanged. Snapshot after a successful write, never before it. Non-finite or signed-zero edge cases must not silently change the submitted payload. Dispose/rebuild retires snapshots together with their batch entries.

Alternative: reading back the batch matrix requires repeated copies or dependence on private Three texture storage. Whole-scene list/signature caching has a substantially larger invalidation surface and is explicitly out of scope. The per-entry approach was selected in the implementation request; its ownership assumptions and behavioral equivalence remain review gates.

Acceptance: a failing unchanged-frame test before implementation; exact matrix payload and native culling/shadow behavior retained for transforms, rebuilds, visibility, geometry/material changes and disposal; fault controls catch stale-transform and first-write mutations; independent review, focused regressions and a clean Pages-base build. No full World or browser permission bypass. CPU tests establish fewer writes, not GPU correctness, frame-rate gains, power savings or Mac temperature reduction. Stop inclusion if rendering correctness cannot be bounded.
