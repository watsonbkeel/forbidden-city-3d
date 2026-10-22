# R52 finial pole follow-up

Only the index triples with exactly zero triangle area are removed from the ten-segment LatheGeometry tip. Every positive-area face remains in its original order. Position, normal and UV arrays are byte-identical; local bounds and visible closed top remain unchanged. Exact terrace colliders, walkables and the two removed support records match the previously frozen JSON artifact.

Red: `node --test --test-name-pattern='finial pole' tests/r52-wuying-moon-terrace.test.mjs` failed against cbc88db: the unfiltered index still contained the ten redundant pole triangles. Green after the change: the same explicit test passes, including centre/offset down-rays against the real cap.

Verification:
- Wuying R52 + R37 suites: 31/31 pass.
- Original, unmodified R48 `武英殿 new source details are finite nondegenerate and dispose once`: pass with its original area > 1e-10 assertion.
- Original, unmodified R36 `wuying: dated exhibit identity ... bounded budget`: pass with original < 150,000 threshold. All three Wuying-profile halls in this B-only tree total 142,734 triangles.
- 80 finials × 10 deleted zero-area faces = 800 fewer triangles. No visible surface simplification. The integrator's reported A+B count of 149,518 therefore predicts 148,718; that combined value still requires its actual unified-tree recount.
- `git diff --check`: pass.
