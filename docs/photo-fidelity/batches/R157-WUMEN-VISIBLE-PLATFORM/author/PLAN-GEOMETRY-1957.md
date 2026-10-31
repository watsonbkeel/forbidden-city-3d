# Visible platform geometry implementation plan
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans; single writer, separate Astra gate.
**Goal:** Construct a real visible isolated U-platform with12 slopes and all five actual apertures, not a new runtime installer.
**Architecture:** One offline builder consumes the reviewed fixed platform fit and an original captured gate. It generates new partitioned masonry/slab/rails and clones retained door/north-head/canopy objects without mutating the original. New physics is generated only from the returned candidate objects. Ordinary rows and support boxes share exact authored cell bounds; arch/leaf triangles derive actual cloned geometry.
**Tech Stack:** existingThree and node:test.
**Spec:** GEOMETRY-STAGE-SPEC.md, ASSEMBLY-NUMERIC-DRAFT.md; parent19:57 authorized this isolated stage.
## Global constraints
Keep600src unchanged; no source installation, no FirstPerson/Collision changes. No receiver test blocks; no copying original Ascent support. Use the unchanged12 nonreceiver slope primitives. Five north heads move−4.1m only; other five door/leaf/stud/face/canopy local data retained. No route/build/GPU acceptance from component tests.
## Review focus
- Actual arch void vs merely decorative north face: body ray/CM probes through all five and nearby solid controls.
- Coplanar slab/old floor over recess: full candidate body/support set excludes cuts; old input remains unchanged.
- Visible rail and safety-proxy openings: same interval construction; flag virtual height separately. Only retained main-terrace rails refitted, no new claimed wing rail inventory.
- Clone mutation/lifecycle: original all objects/geometry/physics unchanged; dispose candidate unique geometries once, borrowed original/library materials not disposed.
- Geometry validity: nonindexed old meshes, finite normals, zeroarea cells, smallFloat32 differences; never use bbox as substitute for actual face assertions.

### Task2: Actual geometry and physical rows
Create `scripts/photo-fidelity/batches/wumen-joint-layout/visible-platform.mjs`.
Test `tests/photo-fidelity/batches/wumen-joint-layout/visible-platform.test.mjs`.
Interfaces: `buildWumenJointVisiblePlatform(capture)` → `{group,cells,slopes,colliders,walkables,retained,rails,contract,dispose}`. `capture` is the current real component fixture (not World); function does not call an installer. Rootlocalidentity. Borrow materials, own new/cloned geometries.
- [ ] Write tests before builder: explicit missing-builder assertion RED, no syntax/import-error surrogate.
- [ ] Validate U cells / cut disjointness and independent sampledcoverage; every actual slab/topbox matches authoredcell bounds; no receiverpiece nodes.
- [ ] Check actual5 door groups, northcap/lining/jamb cloning withZ−4.1, cap69/64,32face meshes; original capture record digest unchanged.
- [ ] Check real passable5 north/side channels with retained crown/arches, solidjamb negatives and every support/raw collider source mapping.
- [ ] Check rails actualfootprint disjoint12cuts, pairedXZ and declaredheight policy; no crossing retainedoldrails remain.
- [ ] Implement only this builder; reject malformed/nonoriginalcapture before allocations, cleanup onerror. No production code changes.
- [ ] Run newcomponent tests plusfit5+originalLower19/leaf12/portal10; preserve exact firstfailure/fix evidence.
- [ ] Freeze candidate code/tests and run complete-face CPU view separately only after component geometrypasses. Submit independent reviewer; Task3platformauth/FP is not included.
