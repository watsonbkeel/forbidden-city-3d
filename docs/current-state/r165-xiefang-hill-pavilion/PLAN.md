# 撷芳亭有限岩台与山顶方亭 Implementation Plan

> Single implementer executes in the existing isolated linked worktree; independent read-only review gates final publication. User requested continuous regional development and delegated design decisions that preserve the real Forbidden City impression. This is not a Blender or generated-asset workflow.

**Goal:** Add the missing source-identified 撷芳亭 main silhouette and safe fitted access south of 抑斋, preserving the cumulative garden.

**Architecture:** One independent `XiefangHillPavilion.js` component, one exact NingShou-only synchronous hook 141. Reuse proven native Three.js solid/contact conventions without altering shared physics, renderer, map or teleport code.

**Tech Stack:** Existing Three.js 0.162 / CourtKit / TriangleSupport and real FirstPersonController route tests. No dependencies or generated assets.

**Spec:** Official page and 1983.jpg show an elevated square pavilion, green tiles with yellow eaves/ridges, red posts, hanging frieze, white-stone bench balustrade and a rock hill with ascending path. The source places it southeast in the first court, south of Yizhai; model east is negative X. Coordinates, dimensions and access shape below are implementation fits, not historical survey or current visitor admission.

## Approaches and chosen scope

1. A ground pavilion would omit the source-defining rock setting and is rejected.
2. A bounded fitted rock support, raised square pavilion and one safe side staircase are chosen as a meaningful independent increment.
3. Full winding rock paths, cave/planting, courtyard walls and detailed carving need more evidence and are excluded, not fabricated.

Existing current raw/contact/box+ramp scan found no recorded occupants in x[-272,-262.5], z[352,362.5], y[.001,10.5]. That scan is not route acceptance. Candidate center (-267.3,357.3), platform 4.2 m square / 1.8 m high, posts 3.6 m span, eave 6.1 m, roof half-width 2.65 m, 12 x .15 m side steps at .32 m tread. Proposed reserve x[-272.2,-263.8], z[352.5,361.5], y[.001,8.5]. All these values are game fitting decisions.

## Global constraints

- Start from remote d4c40891e8082038d949b69aa94651a5a1478fee; keep that branch and main unchanged.
- Preserve every old runtime/data byte except the exact import/hook/call. No new teleport or map item.
- Allocate-owned-before-fill, atomically append after success; never dispose borrowed materials on failure.
- Single heavy real-zone check at a time, no World or claim of GPU/browser/mobile validation.
- Existing three failing bounded assertions remain reported, not relaxed.

## Review focus

- Full-width connected landing must include the staircase outer edge. Verify offsets and low-frame-rate descending turns.
- Preserve Yizhai approach z362.7 and x-260.5 bypass, Juting-to-Yizhai and Lutai old connections unchanged.
- Native controller must ascend/descend and escape specified high starts continuously without resetting position.
- White stone balustrades, raised rock setting and red posts distinguish this pavilion from Songxiu; no invented inscription.
- Resource faults, duplicate execution, finish/dispose/re-registration must preserve the old host.

## Tasks

- [x] Write and observe missing-component/hook red test; freeze d4c4 source and current zone baseline.
- [x] Implement source-supported bounded component with fitted solid stairs and full-width landing; prove finite closed geometry and contact parity.
- [x] Add native route/offset/high/jump/negative/lifecycle tests, keep all prior routes intact.
- [x] Prove actual NingShou old objects/data/roof/landings remain exact and new routes pass; run bounded cumulative tests and independent review.
- [x] Update J21 partial evidence without whole-object acceptance; complete clean local build and local HTTP identity. Prior Songxiu closeout and remote publication/readback are excluded from this local increment.

## Execution closeout boundary

Final separate independent review passed with only a deferredP3 long-line maintainability note. This local increment excludes upload/publication and changes to old Songxiu documentation; those clauses in the last plan step remain separate closeout work. Local implementation, final curved-source tests, J21 evidence, local build/HTTP identity and rollback-preserving local commits are this increment's deliverable. See EXECUTION-LEDGER.md for all rulings and observed red/green evidence.
