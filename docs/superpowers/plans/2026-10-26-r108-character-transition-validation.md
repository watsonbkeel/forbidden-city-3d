# R108 Character Transition Acceptance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Sole writer executes; independent reviewer verifies.

**Goal:** Establish cumulative first-submission and model-interest lifecycle evidence without rewriting correct characters.
**Architecture:** Existing production CharacterSystem/ZoneManager/Teleport, a QA-only optional ZoneManager constructor argument in the full-world fixture, no product mutation unless a new deterministic RED is established.
**Tech Stack:** Three.js, Node tests, existing actual CPU world and JSON loader compatibility.
**Spec:** ../specs/2026-10-26-r108-character-transition-validation.md

## Global Constraints
ReleaseR105; no main/Pages writes; same1ms preparation budget,108 logical actors,actual.5×1.7body; no new model/route/LOD thresholds; GPU/mobile NOT_RUN. No new requirement approval needed: root authorized sequential R106–115.

## Review Focus
- Cache actually enabled in newworld, baseline constructor ignores option without changing old behavior.
- Actual submitted model identities/count match visible stats and near dynamic bodies.
- Hidden/disable/teleport invalidation cannot resurrect old bindings/resources.
- Flight input uses aircraftXZ, not offset camera; synthetic view transition not mislabeled real dismount.
- Cold processes share identical inputs and all slow samples survive; no frame→device-seconds promise.

### Task1: Production-equivalent fixture and source contract
- [x] Add optional `zoneManagerOptions={}` to tests/lib/r52-world.mjs; forward only constructor, oldcallers unchanged. Test requestedcachepresence in actualworld; first run expectedfails before forwarding.
- [x] Record exact R105→candidate character/data/flight hashes; actual loaded scene/CM retained by fixture.
- [x] Commit test-only seam; no product paths.

### Task2: Actual lifecycle/boundary integration
- [x] Create scripts/r108-characters/transitions.mjs using actual fullworld/Teleport/CharacterSystem; low15/30/60, mapcachedreentry, 40/45/60/70latches, hidden/quality/daynight, controlledflightview→ground, occupiedplayer release.
- [x] Assert actual instances/count/no near invisiblebody/no missing-resource synchronous acquire; all108 logical IDs remain; dispose group/pool/body refs clean.
- [x] Preserve any RED before a minimal authorized repair; if no RED, do not invent runtime changes.

### Task3: Cold first-submission measurement and scoped review
- [x] Adapt existing shared fresh-process driver, same R105/R108 low30,600frames,5alternatingpairs; record allfirst IDs,steps/CPU/samplequantiles,sourcehash,notbrowserload.
- [x] Independent review actualmatrix/results and only necessary incremental scenarios; do not repeat unchanged whole-garden physics.
- [x] Add docs/current-state/r108 validation/requirements; R110 receives cumulative gates, no unnecessary3base perminor.

Estimated 20–30minutes, reserve R109 and R110 freeze/upload window. If new safety or persistent first-submission regression appears, report root promptly rather than label PASS.
