# R81 south moat: bounded engineering fit

The R80 northern/eastern/western water remains. Two southern arms extend the side strips to x=-100 and +100, keeping the central road dry. Five disjoint water rectangles and one 12-point contour jointly define water meshes, ground holes, banks, walking/NPC safety and flight water cells. The north strip owns corner squares and the south arms stop at the side-strip inner edges. Twelve separate vertical bank faces are axis aligned; no diagonal bounding box spans the dry passage.

The central half-width 100m is reversible ENGINEERING_FIT, not a survey, historic bridge width or new bridge. Water y=-0.5 and bed y=-1.5 inherit the model fit. No bridge, gate relocation, route relocation or global scale change is introduced. Initial view(0,-494), spawn(0,-470), helicopter home(18,-494) and rotor radius5.7 are retained.

## Radius and movement safety

Point validation computes exact Euclidean circle-to-rectangle clearance. Ordinary movement also computes minimum segment-to-rectangle distance for the swept circle. Endpoint-only substeps were found insufficient at a convex shore corner: a 0.19977m step with dry endpoints clipped water by approximately9mm. The new sweep rejects that direct segment. Existing axis sliding can still reach the target by a safe L-shaped detour; the regression audits all accepted segments rather than incorrectly requiring a different final point. NPC adapter segment checks use the same sweep, and static routine navigation retains the source moat list. Inner river behavior is not globally rewritten.

An explicitly invalid API position already in water remains fail-closed rather than automatically rescued. Normal named-map placement and helicopter exits retain their existing safe-target checks. No automatic water rescue is claimed.

## Retention and evidence

Seven exact runtime changes against frozen R80 are recorded in source-delta.json; all other runtime inputs, including main deployment/settings and R79 discovery assets, are retained. World collider/support/room/map-item coordinates are byte-equivalent under the existing snapshot. Flight height cells are identical; exactly2673 falsely marked central southern water cells clear, no new flight-water cells appear. The actual five water strips stay conservative no-landing regions.

Official-domain map pixels support topology only. The AMap-hosted image is third-party cartography referenced in a commented Visit tag, not a currently displayed official survey. See source-evidence.json for exact provenance. No map/photo texture is shipped.

GPU/browser/mobile appearance and water-edge readability remain unverified. CPU rays, geometry and physics do not prove visual acceptance.
