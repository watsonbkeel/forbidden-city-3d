# Gate platform repair, second batch

Public baseline: 16e9e8224c1a4e3b0ed6b47793d5566ef05aeec2. The cumulative candidate preserves E45 and does not contain H17.

Eight exact base/cap pairs in four existing builders are in scope: Qianqing Gate's main platform, rear landing and connector; Middle Right Gate's lower platform, raised hall and north threshold; Zuoyi Gate and Youyi Gate platforms. The first R170 batch's thirty cases are unchanged.

The current public component sources were actually built before this patch. Every pair retained coincident upward and four upper-side faces. The unchanged CoveredPlatformSurface helper removes only the covered base top and clips only the upper side strip inside the real stone cap. The entire cap, lower sides and underside remain; original attribute prefixes survive and new intersections inherit interpolated UV/normal data. No physical descriptor, material, placement, stair/ramp, door or route is intentionally changed.

The four focused tests build current components and their real final material merges. They compare complete physical descriptor streams and the recorded non-target mesh/material/attribute state to the public baseline, preserve original target attribute prefixes, and check forty declared top/side plane witnesses before and after finish. These plane witnesses are not a claim that every sampled face is the first visible surface from a player camera. This is CPU geometry evidence, not a GPU flicker recording or full-zone/World acceptance.

The exact four source changes first restore the complete E45 runtime view, reconstructed from public16e9 and E45’s twelve exact deltas. E45 then restores public16e9 before the unchanged F47 and earlier historical chains. The two composition adapters are separately restored exactly. No source test depends on an unpublished Git object. Unknown files, mode/content drift and ambiguous inverse edits fail closed; the original public fingerprint is unchanged.

Native controller comparisons cover 10/60/144 Hz, walk/sprint and both directions for each of the four components: 48 comparisons and 33,641 complete updates, including two-second settling tails. Actual current and public-source components have identical complete replay outputs. Original river/moat configuration remains enabled in these new comparisons. These are component routes, not complete-region navigation or an all-triangle body-clearance claim.

Focused negative checks restore duplicate base skin, remove the cap, alter UVs and mutate an actual collider; all are rejected. Appended edge normals/UVs are checked against interpolation of the original vertices. Directly affected old Qianqing structural/material ownership, Middle Right, Zuoyi, Youyi and rail tests are retained without modifications.

No full zone, World, GPU recording, browser, build or CI has been run for this independent patch. The first R170 batch is preserved, not revalidated here. Local integration preserves the frozen E45 runtime, tools, workflow and card contracts. Exact cumulative CI and future public-parent mapping remain pending. This bug repair adds no attraction or restoration count.
