# R36 south precinct and evidence-led interiors

Approved 2026-10-21 02:07 UTC. Four-hour checkpoint: 06:07 UTC / 14:07 Beijing.
Baseline: R35 0d7bbf23c1d79b36170a36b27a988488554f1b9f. Independent development branch only; preserve R35, do not change main or Pages. Remote main observed at 47e7ca09e217ba209db5bed5008ae973ab978ea2, not the older historical main identity.

## Scope and ordering

1. Current real-world south precinct: Wumen to Taihe terrace, Inner Jinshui river and bridges, enclosing walls, gateways, Wenhua and Wuying courtyard groups and Wenyuange water interface.
2. Correct group envelopes versus individual hall footprints; retain asymmetry and connected paths. Official dimensions take priority; otherwise reversible, explicitly estimated parameters. A metre-based coordinate system alone does not establish surveyed accuracy.
3. Palace-specific interior composition, traceable to official photographs, panoramas and exhibition documentation. Separate dated exhibition evidence, historical original furnishings and unverified placements. No generic throne/furniture fill and no inference of placement from an isolated collection photograph.
4. Preserve 159-place/7-question registry, flight/Esc/disembark/map behaviour and unaffected routes. Do not begin the next phase without user confirmation.

## Verification

- Current-module tests for topology, bridge dimensions/orientation, group envelopes, water/collision compatibility and distinct interior composition.
- Historical R35 byte-bound fixtures remain frozen; changes must not be hidden by weakening them or claiming they verify new geometry.
- Run focused direct tests during development and consolidated build/regression at checkpoint. Expand checks where shared geometry or collisions change.
- Genuine rendered views, actual-input routes, GPU and phone checks are separate evidence; CPU tests never imply their completion.
- Deliver actual changed scope, source-linked assumptions, exact candidate identity, results and remaining gaps. Do not claim entire precinct is survey-accurate 1:1.

## Access observations

The restored local repository has installed locked dependencies (npm ci with /tmp cache). Vite starts at http://127.0.0.1:5173/; the supported cloud browser reported connection refused on this endpoint. No sandbox/security changes, file-URL workaround or public deployment was used. Current candidate visual acceptance remains unestablished.

At 2026-10-21 02:14:05 UTC, the supported cloud browser opened the unchanged public Pages URL. UI showed `Error creating WebGL context`; console identified GL_VENDOR=Disabled, GL_RENDERER=Disabled, Sandboxed=yes, BindToCurrentSequence failed. Loaded public bundle index-Cj2BI9jC.js is not identified as the R36 candidate. This confirms the cloud renderer capability blocker, not candidate visual quality. User informed at 02:14 UTC; independent implementation continues.

## Urgent interaction repair added at 03:20 UTC

User reported that dismounting retained helicopter-style interaction instead of normal walking/mouse look. Required behaviour: ordinary walking retains its prior controls; a non-modal boarding prompt appears only near the parked helicopter and disappears when moving away; boarding remains explicit. All successful dismount entry points must restore walking input and mouse control, not merely hide flight UI. Test keyboard/button/real Escape event ordering, rejected/delayed pointer lock, map/settings ownership, touch controls and repeated boarding.

The repair is isolated from the frozen south-scene regression in a separate worktree, then integrated only after targeted and independent checks. DOM/native-pointer-lock boundaries in unit harnesses must not be described as actual browser or physical-device acceptance.
