# Roof numerical gate: preserve section anchors, not merely defaults

Status: proposed method only; no candidate generated or implementation approved.

Actual capture2056 confirms original pavilion highest vertex28.00175666809082, wing25.98995761871338; original main roof remains separate/non-target. Formula audit2041 explains underlying engineering layers. All numbers are component-local, wing input base is parent-local while recorded bounds include parent Y12.3.

## Coupling that must not be hidden
Keeping old eaveY/rise while increasing half-depth changes the normalized wall-axis t=halfBodyDepth/halfEaveDepth. The same profile polynomial would then meet the wall at a different Y. A list of frozen maximum/minimum Y values alone cannot prove preserved fan/rafter bearing.

## Proposed bounded construction (requires numerical validation)
- Preserve all old vertical section samples and named anchors: ridge, body-axis intersection, eave, lower/upper fan, mounting prisms, bracket heights and finial. New horizontal coverage is an explicitly proposed fit, not source measured eaves.
- For each roof layer independently, register old/new horizontal wall-axis and eave boundaries. Use a monotone horizontal parameter map with explicit knots at ridge, wall axis and eave; keep the same old Y values at the mapped section samples. Validate monotonicity, positive faces, actual wall-axis contact and layer gap. Do not reuse old normalized t on a new footprint without this map.
- Roof tile/rafter surfaces are generated with the remapped horizontal coordinates, original vertical thickness convention, newly computed normals and deliberate UV world-length policy. This is a geometry/UV delta, not byte-preserved old surfaces.
- Ridge/hip tubes must be regenerated from mapped centreline points with old tube radii/segments, not transform already merged tubes; finial and independent decorative geometry retain old dimensions and only move by approved translation. Low-detail and actual ornament inventory locked.
- Fan/prism/painted-band horizontal boundaries must use the identical mapped wall-axis knots. No independent guessed slab or invisible ceiling may cover a mismatch.
- Neither a whole Group scale nor direct merged mesh scaling is permitted. Exposing a role-resolved intermediate generator or isolated scoped generator would itself require TDD and exact non-target A/B before any runtime use.

## Numerical stopping conditions
Before implementation, each pavilion/wing needs complete old/new horizontal knots, old vertical anchors and expected contact equalities. If non-square own-page widths/depths cannot use this scheme without inversion, changed corner contact or unintended thickness, stop and request an explicit alternate Y/profile delta. Keeping old Y is engineering compatibility, not verified historic height or roof form.

Pending: candidate knots and physical contact numbers; role-resolved roof primitive inventory; full new roof actual mesh checks. This note does not close the numerical gate.
