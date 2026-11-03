# Task1 independent spec + quality review

Reviewed: d9038f4c..e7bf6a70 (product 4a9985ce; later evidence-only commits). Read brief, author report, complete diff package/source/test files and design. Read-only review; no product/main/remote edits and no frozen evidence overwritten.

## Decisions
- **Spec compliance: PASS with one Minor literal naming exception below.** The Task1 functional/source/physics/resource gates are met. Do not describe this as zero exceptions to the stricter “all newly allocated materials have the prefix” wording until M1 is resolved.
- **Task quality: PASS for this staged, local original397/H43 partial.** No Critical or Important findings; no Task1 integration blocker. Normal hook/release, independent cumulative normal-path QA, browser/GPU/mobile/full streaming and whole-object/whole-release acceptance are outside this result.

## Findings
### Critical: none
### Important: none
### Minor M1 — unused staged CourtKit defaults lack the new-material prefix
`src/scene/palace/special/YinghuaStelePavilion.js:34,70` constructs a full CourtKit and transfers all its owned materials. `src/scene/palace/kit.js:50-59` supplies four private but unused `kit_ridge`, `kit_gold`, `kit_lacquer`, `kit_floor_flat` materials. These do not match the literal “all new materials r163_yinghua_stele_” constraint. Independent `/tmp/r163-yinghua-stele-2114/reviewer-material-probe.json` confirms all four are unused and all four **actually visible** materials have the requested prefix. This is not shared-material modification or old mesh merge pollution. Minimal clean-up: rename these private defaults with the prefix or release/remove their unused ownership safely, without disposing the cached/shared floor texture. No old kit source change is needed.

### Minor M2 — dense test/source formatting raises maintenance cost
`component.test.mjs:7-14`, `routes.test.mjs:30` and builder `:16,67` pack numerous invariants into individual lines. Existing checks are substantive, but later failures and narrow reviews would be easier to diagnose with multiline named helpers. Non-blocking; do not churn functional code merely for this review.

## Evidence and coverage
- New-file-only diff: builder, matching tests, selected author evidence; no old src/data/physics/landscape/maps/rooms edits. `git diff d9038f4c e7bf6a70 --check` clean.
- Exact host gate/hall tuples and no-extra-field comparison at builder `:8-16`; duplicate source and WeakSet checks; mutable arrays/root/kit and unchanged transform/matrix validation before staged allocation/attachment. Tests `component.test.mjs:9,13` cover ordinary wrong/frozen/transformed/tampered cases and preexisting identity.
- Geometry `:41-54`: one stele plus seat, eight fit columns, open square layout, exact 2.6 m N/S openings, low slab, coarse convergent roof/finial. Bounds enforced at `:65-66`. Identity/name/fit/unknown/exclusion limits at `:67` do not borrow hall roof specs or invent inscriptions.
- Native owners `:56-64` derive the actual transformed triangle coordinates; platform is its exact visible box and exact `rescue:false` top. No artificial ramps or whole-pavilion air box. Component `:8` compares each owner to its actual visible mesh triangles.
- Private visible materials `:37,44` preserve shared library material/texture handles. Staging catch `:69`, pre-attachment material failure protection `:39-40`, and component `:10-12,14` cover finish/direct disposal and allocation failures. M1 concerns unused defaults, not a visible resource ownership failure.
- Did not rerun already preserved same-code 10/10 suite. Independently read final log, validated all 18 SHA256SUMS entries, and parsed complete raw route archives. Local: 16/16 arrivals, 1,356 movement frames, peak feet-ground 0.1172777764 m; four blocked negatives ×180 frames; deleting stele/base owners yields arrival in 28 frames. Resident author-injected world: 16/16 arrivals, 5,870 movement frames, zero old triangle-envelope hits; full-route peaks 0.466..0.8494444444 m explicitly retained, not falsely claimed ≤.3 m. Local all-frame clear checks and slab contact assertions are present at `routes.test.mjs:23`; native start-ground checks and global local-subsection limit at `:30`. These are real FirstPerson controller replay through existing physical waypoint driver, not scripted positional teleportation.

## Personal source / CPU image inspection
Personally viewed `/tmp/r163-yinghua-beiting-preflight-2044/8418.jpg`, `8419.jpg`, `/tmp/r163-beiting-source-2054/beiting-plan-detail.png` and both author `front.png` / `oblique.png` in the evidence directory. The plan supports a square open enclosure, one transverse central rectangular stone feature and four clearly drawn inner posts; photos support red open framing, low rails/open access and a yellow converging upturned-eave silhouette with finial. They do not establish the implementation's exact eight-column count or dimensions.

Both actual-geometry CPU views visibly retain those broad relationships. The model is plainly a coarse approximation: roof is faceted/simplified, finial generic, rail and stone details simplified, and the CPU colors/lighting are diagnostic. Front shows one central dark stele on one base and open portals; oblique shows depth, low perimeter rails and side circulation. That agrees with the author's carefully limited coarse fit claim, not a photoreal or measured reconstruction. Exact source ratio/details cannot be certified from these dark/occluded photos. No unsupported demand for invented ornament is warranted. Image hashes match the manifest and author report.

## Handoff
Proceed to controller-owned normal integration and independent cumulative checks; do not substitute author injection for those. Resolve M1 before claiming literal all-allocation prefix compliance. No other Task1 blocker identified.
