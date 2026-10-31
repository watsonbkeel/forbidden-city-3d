# Roof numerical gate: 2103 revised proposal, source-role knots and explicit deltas

Status: proposed method only; no candidate generated or implementation approved.

Actual capture2056 confirms original pavilion highest vertex28.00175666809082, wing25.98995761871338; original main roof remains separate/non-target. Formula audit2041 explains underlying engineering layers. All numbers are component-local, wing input base is parent-local while recorded bounds include parent Y12.3.

## Coupling that must not be hidden
Keeping old eaveY/rise while increasing half-depth changes the normalized wall-axis t=halfBodyDepth/halfEaveDepth. The same profile polynomial would then meet the wall at a different Y. A list of frozen maximum/minimum Y values alone cannot prove preserved fan/rafter bearing.

## Proposed bounded construction (requires numerical validation)
- Preserve named structural anchors and the no-lift base section at corresponding parameters: ridge, roof-footprint intersection, eave, lower/upper fan, mounting prisms and bracket heights. This is NOT preservation of every old actual surface Y: corner-lift fields and fixed-radius regenerated tubes can change local Y; their full actual deltas must be measured, enumerated and reviewed. New horizontal coverage is an explicitly proposed fit, not source measured eaves.
- For each roof layer independently, register old/new horizontal beam-bearing/roof-footprint and eave boundaries. Use a monotone horizontal parameter map with explicit knots at ridge, roof-footprint bearing edge and eave. The bearing knot must be an actual common tile AND soffit sampling row; analytic intersection alone is insufficient. Preserve base-section Y at corresponding knots, with lift/tube derived changes explicitly separate. Validate monotonicity, positive faces, actual wall-axis contact and layer gap. Do not reuse old normalized t on a new footprint without this map.
- Roof tile/rafter surfaces are generated with the remapped horizontal coordinates, original vertical thickness convention, newly computed normals and deliberate UV world-length policy. This is a geometry/UV delta, not byte-preserved old surfaces.
- Ridge/hip tubes must be regenerated from mapped centreline points with old tube radii/segments, not transform already merged tubes; finial and independent decorative geometry retain old dimensions and only move by approved translation. Low-detail and actual ornament inventory locked.
- Fan/prism/painted-band horizontal boundaries must use the identical mapped wall-axis knots. No independent guessed slab or invisible ceiling may cover a mismatch.
- Neither a whole Group scale nor direct merged mesh scaling is permitted. Exposing a role-resolved intermediate generator or isolated scoped generator would itself require TDD and exact non-target A/B before any runtime use.

## Numerical stopping conditions
Before implementation, each pavilion/wing needs complete old/new horizontal knots, old vertical anchors and expected contact equalities. If non-square own-page widths/depths cannot use this scheme without inversion, changed corner contact or unintended thickness, stop and request an explicit alternate Y/profile delta. Keeping old Y is engineering compatibility, not verified historic height or roof form.

Pending: candidate knots and physical contact numbers; role-resolved roof primitive inventory; full new roof actual mesh checks. This note does not close the numerical gate.

## Mandatory role and topology distinctions (Astra REVIEW-2102)
- Original pavilion half column axis=5.5; opaque red-wall skin=4.7; facade center=4.8/front skin4.9; main beam outer edge=5.7 and RoofBuilder footprint=5.7. These are different roles. New footprint is proposed axis half+0.2, NOT the axis itself. Old wing axis39.4x13 vs roof footprint39.8x13.4 has the same explicit0.2 offset on each side.
- Upper-layer inset and footprint are separately named, not silently substituted for lower columns. Lower inset, overhang, bracket/fan, upper mounting, upper overhang and beam skin must all have old/new entries.
- Actual tile/soffit common knot edges are mandatory geometry; validate triangle-plane intersections at the bearing boundary, not a sparse ray through a convenient vertex.
- Existing pavilion apex grid produces zero-area triangles. New topology must explicitly omit those degenerates and record count/index delta; no promise that the old triangle list is retained. Full normals/UV/index/material/matrix baseline must be separately captured before entity tests;2056 only bounds/positions.
- Normal recomputation, UV world-length policy and nonzero closed-surface checks must include side/end caps, material groups and drawRange. Tube cross-sections stay old radius rather than old world Y; report actual changed Y with same centreline-anchor contract. No named maximum alone substitutes for full vertex delta.

This revision supersedes only the proposal wording;2057 and its8-file freeze remain unmodified. Source/runtime still unchanged. Specific numerical knots are next; no default RoofBuilder resizing is authorized.
