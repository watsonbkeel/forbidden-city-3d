# e819576: 15 historical assertion failures — independent read-only classification

All 15 classified. No repository changes; no buildWorld/heavy scene run. These remain failed historical assertions, not converted into passing tests. Diagnostics reconstructed lightweight source captures and standalone GardenBuilder/Sishen sources. Physical/navigation equality below means serialized colliders, walkables, rooms, regions and mapItems, not GPU or universal movement acceptance.

| Failed assertion | Actual later difference outside original target | Commit scope evidence |
|---|---|---|
| changchun-front retention:4 | Only Yikun | e8195764 |
| chonghua-front retention:2 | Changchun + Yikun | 3987742a, e8195764 |
| cining-gate retention:8 | Only Wuying front source host | e7343af5 |
| east-well retention:6 | Later westWellProfile + sishenProfile survive east-only exclusion | 71a9d7a5, 7cef552a |
| east-well retention:7 | Two retained-tree low AABBs replaced with source-derived triangle colliders, west-well and Sishen | 71a9d7a5, 7cef552a |
| shouan-entry retention:10 | Only Wuying front source host | e7343af5 |
| shoukang-entry retention:5 | Only Wuying front source host | e7343af5 |
| tihe-front retention:2 | Tiyuan + Chonghua + Changchun + Yikun | b1763cba, 7898b74f, 3987742a, e8195764 |
| tiyuan-covers retention:2 | Chonghua + Changchun + Yikun | 7898b74f, 3987742a, e8195764 |
| west-well motion:3 | Historical all-height expanded census expects 1, now 76: precisely 75 Sishen source boxes intersect old census rectangle plus original retained tree | 7cef552a |
| west-well retention:6 | sishenProfile survives west-only exclusion | 7cef552a |
| west-well retention:7 | Sishen retained-tree source replaces old low AABB; west tree itself unchanged since accepted west-well checkpoint | 7cef552a |
| xianfu-front retention:2 | Tihe + Taiji + Tiyuan + Chonghua source hosts (own Xianfu target separately excluded by original test) | ddb9bc87, 208a7980, b1763cba, 7898b74f |
| yanshou retention:5 | Only Wuying front source host | e7343af5 |
| zhongcui-front retention:2 | Only Yonghe | 12184810 |

## Actual diff boundaries
Five facade replay captures compare original own host plus all non-target hosts. Every changed non-target host is listed above; all five physical/navigation arrays hash-identical in each capture.
Four outer-west historical captures reproduce each test's old module/input filters. Wuying at [219.5,0,-199.2] is the only differing host; all five physical/navigation arrays equal. Historical ZoneBase imports current dependencies, so this is specifically the later Wuying finalizer missing from the historical ZoneBase, not a claim that every intervening module was frozen.
Xianfu replay reproduces old RemainingResidentialHalls-only import replacement against current ZoneBase. Changed hosts are own Xianfu and exactly Tihe, Taiji, Tiyuan, Chonghua. All five physical/navigation arrays equal. Later Jingyang commit changes that shared module but is east-six, absent from this west-six zone comparison.

## Retained tree and motion: not silently waived
Standalone GardenBuilder comparisons against 8ad8c90, 1b5adc79 and 71a9d7a5 show all 34 tree instance matrix/color buffers equal and walkables equal.
Against east/west historical pre-west-tree baselines exactly two collider replacements occur:
* West old AABB [39.30381704764441,0,460.25214269561695]..[40.9038170476444,3,461.852142695617] -> west-well-retained-tree-trunk [37.96019744873047,-0.22959208488464355,458.3456726074219]..[43.31220245361328,11.376237869262695,463.634521484375].
* Sishen old AABB [24.13916223833827,0,460.05395289768956]..[25.639303567982044,3,461.5540942273333] -> sishen-retained-tree-trunk [23.576066970825195,-0.15575551986694336,459.5556335449219]..[26.7138671875,12.841852188110352,462.69915771484375].
Against accepted west-well checkpoint71a9d7a5 only Sishen replacement differs; west source hash stays 6b31d377b29f9d20a7e81b295472cf391ea79db4afb06340469b6c28584aad8a. WestWellTreeSource.js, WestWellSupport.js and WestWellPavilion.js have no diff from71a9d7a5 to e819576.
Independent Sishen-only fixture finds exactly75 real source boxes intersect west-well test's expanded X/Z rectangle (all heights). Thus observed76 is fully accounted by later source registrations, but census accounting alone does NOT establish movement safety.
Prior committed Sishen RECON evidence records final-Float3232/32 legal tree-neighbor oracle routes,32 local routes including both west-well tree bypasses, finite0.04m paving destination change, and full-World96-case comparison with80 identical/16 local paving differences,72 arrivals each and0 illegal starts. These are prior recorded checks, not freshly rerun World/GPU acceptance. Existing historical failures were already documented there.

## Raw independent diagnostics
* /tmp/retention-audit.json and /tmp/retention-audit.mjs — five facade source captures
* /tmp/outer-retention-audit.json and /tmp/outer-retention-audit.mjs — four outer-west captures
* /tmp/xianfu-retention-audit.json and /tmp/xianfu-retention-audit.mjs — Xianfu module replay
* /tmp/garden-source-audit.json and /tmp/garden-source-audit.mjs — full tree buffers and collider differences
* /tmp/westwell-sishen-census.json — exact75 source IDs/roles/bounds

Conclusion: all15 are attributable to historical single-target snapshot/census assumptions conflicting with later scoped checkpoint changes; no unexplained source/physics delta found by these diagnostics. Do not remove failures from totals or substitute this classification for fresh route/visual acceptance. Original garden assertions abort before later ground checks; those downstream original assertions are not claimed executed. Missing-output-directory and file-level failures are outside this15-item review and handled separately by main writer.

Raw JSON diagnostics are also preserved under reports/merge-candidate-e819576 by the sole writer; original /tmp scripts were reviewer tooling.
