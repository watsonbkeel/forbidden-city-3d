# Yongshou full south visual ensemble implementation plan
> Native singlewriter executing-plans; independent readonly review; source-guided continuous work authorized without repeated design prompts.
**Goal:** Coherent four-window/retained-open-door south finish, with exact unchanged physical/nav contract.
**Architecture:** dedicated atomic applyYongshouSouthVisual(kit,item,frame,profile) hook after named hall is built; no movement modules/data touched.
**Tech:** existing Three.js/Canvas/Node/Vite, no new assets or dependencies.
**Spec:** DESIGN.md.

## Review focus
Known window proportions not equal thirds; exact-target exclusion not neighbor leakage; fullphysics identity includingmetadata; atomic late allocation failure/disposal; finalmerge materials/texture/GPU costs. All dimensions/colour/pattern are reversiblefits. Old high physics remains unaccepted, not silently fixed.

### 1 Complete visual composition
Create src/scene/palace/special/YongshouSouthVisual.js, exact hook RemainingResidentialHalls.js. Interface applyYongshouSouthVisual(kit,item,f,p)->metadata.
- [x] Red missing visual composition, preserving exactly4frontwindowgroups/2existingopenleaves.
- [x] Guard canonicalhost/old9parts each+leafgeometry/pose/material/visible attributes; detached staged wholewindow replacements, source-backed widecenter/sidefields/upperlowergrid; doorfinish private only.
- [x] Green composition, oldenvelope, allcollideridentity/nav unchanged, finalmerge/private materials; guard rejection/latefailure lifecycle.

### 2 ActualWorld and retention
Tests under tests/major-pilots/yongshou-front; parent module imported fromcb455649 for exactcomparison.
- [x] Wholewest-six non-target source/material/metadata and allphysics/nav exactequal.
- [x] Actual south/north portals and front court10/60 walk/run/jump bothdirections plus.3/.5;96 parent trace probes preserve old blocked through-route/invalid side starts (not successful through traversal).
- [x] Independent readonly review with explicit visual-only vs unrepairedphysics boundary.

### 3 Serial honest checkpoint
- [x] Full specialized/residential/shared161/navigation32, parentfailure replay asneeded; no single-file result masquerading asgroup.
- [x] Threebasecompile in memory, texture/mesh/collidercost and fingerprint, olddirtyreportSHA preserved.
- [x] Fixblocking reviewfindings redgreen then frozenRC. Scoped localcommit; no publish or mainchange.

## Evidence updates before final RC
- First complete specialized11/11; legacy navigation32/32.
- Initial actualWorld96 hashes/outcomes exactly equal parent, but only24 arrived/32 invalid starts. Do not reinterpret these as96 valid passages. Separate legal portal/court tests plus .3/.5 kinematic paths passed.
- Peer review's metadata/leaf writable descriptor and geometry drawing groups/index semantics now red-green4/4. Atomicity bounded to validated rejection and detached-build failures, not adversarial commit/dispose callbacks.
- Wholepanel retained band-UV mapping must be fixed/tested with private texture transform after current sharedgroup, then frozen-source suites rerun.

Final frozen RC: specialized13/13, shared161/161, navigation32/32, residential184/195 identical11 actual-parent failures, compile3/3. Source3333af93cb54eea1abc05b8782c6ac6549cb6ca5f5765e8e316ee8c6d204f5a6. Bounded visual checkpoint only; no merge/deploy/fullproject acceptance.
