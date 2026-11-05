# Explicit fitted geometry and retained junction

All measurements are reversible game fitting, not historic measurements.

- Main closed core: x[-239,-235.2], z[385,397], 3.8m depth by 12m length, three facade bays by one depth. Floor 2.0m, eave 5.9m, crown 7.3m. Facade faces project negative X.
- Main roof: x[-241.6,-234.7], z[382.5,397.7]. Rounded crown, two closed curved gable boards and lower hip skirts, yellow with green margins.
- East porch: x[-241.1,-239], z[383,397], width 2.1m. South porch: x[-239,-235.2], z[383,385]. Visible full-height stone support, actual floor contacts and non-rescue top walkables.
- Low landing: x[-240.8,-238.6], z[377.98,379.8], top .5m. Its .12m overlap joins retained Xishang's north platform at z378.1/y.5 without changing the retained source.
- Ten actual treads rise .15m/run .32m, width 2.2m, z379.8 to383. The actual high south porch receives the flight, turns and connects into the east porch. There is no stair to empty space.
- Low roof/rail members remain genuinely ordinary closed boxes through z380.35, preserving the retained Xishang high-contact domain. Beyond that, actual rising roof/rail geometry uses closed source triangles. Low post caps y3.69..3.81 and purlins y3.77..4.05 bridge posts/rafters to flat roof underside4.04 with real overlaps.
- Four visible ordinary-box east roof capitals bridge unchanged post/beam tops5.75 to the actual roof: x[-241.01,-240.83], depth.18 atz385.2/389/393/396.8, fromy5.73 to6.14 (first three) or6.02 (north hip skirt). Actual upward/downward visible roof rays verify contact without top protrusion. These are game-fit bearing cues, not surveyed historic joinery.
- Three asymmetric closed faceted rocks only at the south-stair side, x>=-238.5, z380.5..383.3. Their exact visible triangles provide collision/support; no bounding-box corner/top support or repeated east-base row.
- New geometry's theoretical west/east-navigation-side limit is x=-241.6. Float32 minimum is -241.6000061, bounded to .0001m tolerance. Retained bypass x<=-241.8 stays untouched. Actual final bounds are in COMPONENT-COST.json.

RETAINED-JOINT.json records exact actual-library matrices/vertices/index/bounds for the only two permitted retained overlaps: `xishang-platform-base`, `xishang-platform-paving`, both under `禊赏亭·官方形制局部拟合`, identity `place-ningshou-fadd286b97`. Validation compares names/roles, exact parent, identity, full matrix, every expected position/normal/UV/index, and precisely one .5m top walkable. Exactly one unique base and one unique paving are required. Both duplicate-base/missing-paving and duplicate-paving/missing-base substitutions reject, as do extra same-tag objects/contacts and altered/missing/duplicate retained surfaces. No arbitrary tag exemption exists.

Closed interior remains unreconstructed. Full source, every prior collider/walkable/navigation record and every old mesh remains unchanged. New floors have real visible support, not a rescue plane.
