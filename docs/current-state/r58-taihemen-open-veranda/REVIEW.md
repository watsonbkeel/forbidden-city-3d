# Independent review, 2026-10-22 UTC

Disposition: approved for the bounded south-veranda scope, no unresolved findings. Reviewer read production helpers, exact in-memory hookup, tests and source mapping; viewed both external official source photos and all three CPU comparison sheets; ran only the named focused test command.

Two issues found and resolved:

1. Baseline portability after owner integration. The original fixture imported the live builder as its baseline, so an already-hooked owner tree would contaminate before/after comparisons. The fixture now reverses only its exact three hook changes into an independent baseline source, then imports baseline and candidate separately. A regression test covers reversible/idempotent hookup.
2. Existing-W visual assertions ignored object/material visibility and checked only collision floor support. The consumer now filters rays by mesh/ancestor/material visibility and sends seven downward rendered-support probes. Four negative mutations reject removed platform+paving, hidden lattice, hidden ancestor and hidden material. The source-retained slab caps are 0.02/0.03 m over the 3.44 m support datum; tolerance is explicitly bounded to 0.04 m. Removing only stone_slab is not a valid missing-support fixture because a real sumeru_band platform top remains; the final fixture removes both.

Final independent command: `node --test tests/r58-taihemen-*.test.mjs`, 20 passed, 0 failed. No production geometry blocker found in scope. Four depth bays / column occupancy remain BLOCKED_SOURCE, and full-hall/browser acceptance remains pending.
