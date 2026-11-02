# East-ear explicit entry — approved narrow design / implementation plan
Goal: actual Teleport selection faces the existing interactive door, not the central facade post.
Chosen by the integration owner: add source-bound dedicated entry profile, reuse original explicit approach checks. Rejected: moving map center (would move footprint); moving/removing post or door (unnecessary geometry change); general depth/width refactor (outside this defect).
Limits: historical text candidate, no claim of measured/current facade or public admission. Original center, dimensions, meshes, UV, 18 triangle owners, aliases and physics remain unchanged. Loaded OE map identity plus real source-owned facade/frame colliders must be resident; missing body cannot certify ground=0.
Plan (single author, review by Astra):
- [x] Save actual component/consumer failing assertions plus retained geometry baseline.
- [x] Add only FIT-derived profile metadata and a strictly validated Teleport branch; bad metadata fails closed.
- [x] Component checks: correct aperture, missing/mismatched profile/map/owner/zone, closed aperture, legacy navigation and aliases, exact original streams.
- [x] One normal World: real go, same-controller 30Hz direct entry/return; retain old central-post negative and closed wall negative. No old eight-route repeat.
- [x] Freeze source/tests/concise evidence pins; preserve original red under /tmp; unique integrator handles build/upload.
