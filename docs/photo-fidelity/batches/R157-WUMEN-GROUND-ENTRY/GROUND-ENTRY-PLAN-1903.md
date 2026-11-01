# Bounded Visible-Ground Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:executing-plans, single authorized writer, task-by-task TDD; independent reviewer gates each bounded component. No extra subagents.

**Goal:** Authenticate one real local ground entity and use two fixed subsets of its actual top for zero-height ramp entry/return, without filling elevated gaps.

**Architecture:** Existing 14-piece geometry and FirstPerson remain unchanged. Add optional ground authority to the explicit opt-in registration; the graph may then consume two immutable top-face patches after authenticating the one whole visible ground owner. All support and body queries use the actual CM.

**Tech Stack:** Existing Three.js, Node node:test, JS ES modules; no dependencies.

**Spec:** GROUND-ENTRY-DESIGN-1902.md (corrected fixture counts); predecessor1856 retained. Parent approved bounded approach; independent design review supports limited TDD. Implementation remains subject to review.

## Global Constraints
- No World/PalaceBuilder registration, coordinate migration, invisible floor, parent gold update or main change.
- Current rig-only fixture + real ground = +1 mesh, +1 ordinary collider, +1 box walkable. Two authority patches add zero CM rows.
- .5 radius, <=.25 substeps, exact XZ boundaries; only existing floating arithmetic height tolerance.
- Existing ground geometry220x.25x80, top0; approach subsets X=entry X, Z=[entry.maxZ,entry.maxZ+2]. Engineering-only dimensions.
- Preserve original strict0/16, internal traverse/stop rounds, index REDs and source versions. New runs are successor evidence, not overwritten results.

## Review Focus
- Whole ground accidentally fills a high missing neck: direct negative queries and full route mutation, Task3/4.
- Ground removal shrinks domain to implicit zero: opted-in fixed scope/lifecycle negative, Task2/3.
- Shader/instance/attribute channels escape source authentication: common render parity and ground mutations, Task2.
- First fixture adds actual physics but report claims zero delta: exact mesh/CM count and original-rig preservation, Task1/4.
- Stopping or direction-dependent contact appears green only because of test control overrides: same input-only braking and every-frame support/velocity assertions, Task4.

### Task1: fixed witness/patch data and real fixture accounting
Files: create src/controls/WumenJointGround.js (initial fixed data/reference only); create tests/photo-fidelity/batches/wumen-joint-layout/ground-witness.test.mjs. Existing test-ground.mjs geometry remains byte-identical.
Interfaces: export WUMEN_JOINT_GROUND_FIT with one ground identity/bounds and two frozen approach records (height0, ordinary axis x y0=y1=0 representation), scope LOCAL_TEST_GROUND_NOT_ENVIRONMENT_WORLD_ACCEPTANCE. Inputs are existing WUMEN_JOINT_ASCENT_FIT, not caller-provided extents.
- [ ] Write tests requiring real existing ground source, both exact patches/zero overlap/real shared edges, containment and dense finite immutable fields; assert baseline rig count then exactly +1 collider/+1 walkable and no patch CM rows.
- [ ] Run this file, preserve genuine missing-interface RED.
- [ ] Implement fixed contract/reference, no controller/registration changes.
- [ ] Run positive and mutation tests; save source freeze and review before consuming geometry.

### Task2: real whole-ground authentication and opt-in lifecycle
Files: create src/controls/WumenJointOrdinarySurface.js; extend WumenJointGround.js; modify WumenJointAscentContact.js; add ground-authentication.test.mjs.
Interfaces: common assertWumenJointOrdinarySurface(mesh,name) returns canonical material state plus ancestor/parent identity; move existing ordinary mesh/ancestor/material policy without weakening it. Ground validateWumenJointTestGround(cm,owner,prior,index) returns identity only after full canonical Box geometry/index/attributes/groups/bounds and actual body/flat support checks. It is not independently capable of registering authority.
Contact registerWumenJointAscentOwners(cm,owners,options={}) accepts only optional groundOwner. Existing two-argument callers retain no-ground behavior. Ground authentication completes before binding publication; generation changes on re-registration. Validated public binding exposes fixed ground patch IDs only when configured, not mutable source caller arrays.
- [ ] Add RED: no-ground calls cannot authorize north start; malformed optional owner and all ground missing/duplicate/moved/hidden/matrix/instance/shader/attribute/material/physical semantic mutations reject. Registered owner/source replacement and stationary deletion reject; raw arrays remain unchanged.
- [ ] Run original owner12 + index5 before refactor as baseline; preserve outputs.
- [ ] Extract common mesh/material policy, keep all current render execution and data-descriptor checks; no change to existing ramp geometry expectations/body proxies. Independently create ground canonical BoxGeometry, never record candidate arrays as a new gold.
- [ ] Implement explicit ground live record/flat rescue:false registration validation using the same invocation-local body index. No new CM rows inside authorization. Lock source references, record identities/tags/shape and complete geometry data.
- [ ] Re-run owner/index/ground suites, all historical counterexamples and generation tests; obtain independent review. No Motion change yet.

### Task3: qualified approach branch in actual small steps
Files: modify WumenJointAscentMotion.js only as needed; create ground-entry-step.test.mjs. Collision/FirstPerson/Handoff stay unchanged unless a demonstrated red requires a separately reviewed delta.
Interfaces: tryWumenJointGroundStep existing signature. Fixed domain includes optional approach patches based on registered scope, never on surviving mesh bounds. After validation, `live` includes only two qualified patches, never the whole ground rectangle. Existing adjacency/height/coverage/piecewise sweep applies unchanged.
- [ ] RED: north full footprint at zero, both-direction seam travel, stationary approach; opted-in missing ground must not return OUTSIDE/null. Radius/actor/outside legacy contract preserved.
- [ ] RED: remove neck/receiver, shift ground/support, offset entryedge by positive gap; high and low queries reject. Whole ground below cannot supply high-gap footprint or rescued height. Window edge partial support remains explicit diagnostic, not an invented barrier.
- [ ] Implement bounded graph/domain inclusion using authenticated patch IDs and fixed coordinates. Do not alter air/release or mixed legacy accepted-chain semantics.
- [ ] Run step negatives plus old connected/ground/shared/generation tests and original 920 A/B; independent audit of source and real CM outcomes.

### Task4: ground-entry full rig successor, stop and controls retention
Files: new ground-entry-player.test.mjs and driver/helper as needed under existing wumen-joint-layout test directory; existing original diagnosis scripts unchanged.
- [ ] Derive successor from exact1841 input-only stop driver; instantiate/register the existing ground (+1/+1/+1), add north start/end e.maxZ+1 and optional ground binding. Keep original intermediate waypoints and all raw frame/stop assertions. Save derivation diff and driver SHA.
- [ ] Run before ground authority as RED, then candidate16 east/west x up/down x10/60 x walk/run. Require terminal distance<=.12, one second stopped, zero real velocities, all-frame onSupport/groundY/feet/air and full .5 support, raw bodies clear. No per-frame teleport/velocity reset.
- [ ] Run same driver with ground missing/wrong owner and with neck removed as hard failures, not module-load failures; preserve exact failed state/frames.
- [ ] Run all local tests, unchanged 55 legacy controls and 920 A/B serially. Freeze source/QA, independently audit traces, counts and fixture delta. Report arbitrary window release/World/real entrance still unknown.
- [ ] Only after independent limited approval, archive exact reports/RED/GREEN/input bindings and request/save a separate bounded checkpoint. No source installation or whole-object completion claim.

## Self-review / stop conditions
Every spec requirement maps to Tasks1–4. The standard render-policy extraction is an explicit review boundary, not a hidden refactor. If a known outside behavior changes, a real ground source cannot be fully authenticated, or a high gap passes via the ground, stop before route acceptance; do not enlarge window/gap tolerance or change clock/radius. Unknown actual architecture remains outside this experiment.
