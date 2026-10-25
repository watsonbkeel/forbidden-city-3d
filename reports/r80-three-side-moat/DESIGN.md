# Bounded R80 three-side moat

The existing Layout defines a rectangular exterior belt centered at(-0.4,88.9), width940.5, depth1147.5 and river width52. Those model values are retained, not reclassified as measured dimensions. North water spans x[-470.65,469.85],z[610.65,662.65]. East spans x[-470.65,-418.65],z[-484.85,610.65]; west spans x[417.85,469.85],same z. The north strip owns both corner squares, so the three surfaces have no overlapping area.

The same profile supplies one eight-vertex U-shaped hole for the environment ground. A single contour avoids touching/intersecting rectangle holes. Water y=-0.5 is inherited model fit; bed y=-1.5 and bank tops y=0 are explicit reversible visual fitting, not official elevation evidence. Six separate axis-aligned bank faces leave both southern ends open. No bridge, end cap, enclosure wall, public river access route or global layout correction is invented.

The Environment owns generated geometry, water material and a double-sided bank material clone; borrowed stone material/textures remain library-owned. All objects are removed and resources released exactly once through the existing lifecycle. Environment objects do not enter the flight obstacle grid; the existing four-side conservative water mask remains unchanged byte-for-byte, including its southern strip crossing the initial spawn. The map discloses that mismatch rather than silently relaxing landing rules.

Walking remains within x[-400,400],z[-500,560]; all three rendered strips lie outside those walking bounds. Therefore no additional colliders, invisible supports, walkable water, NPC diversion or gate closure is introduced. Existing starting ground and the central road remain dry and visible.

Alternatives rejected: full rectangular rendering would place water across spawn without a verified bridge; independently cut strip holes can share edges and produce invalid triangulation; changing city alignment or the four-side flight mask would expand this bounded visual repair into navigation redesign.

Source hierarchy: actual viewed official open-area illustration map3.jpg supplies general palace context. The other actual viewed image is an AMap third-party basemap hosted on the official domain and referenced by a commented tag in cached Visit.html. It corroborates moat topology, not detailed bank construction, current visitor routing, surveying or elevation. Source URLs and hashes are in source-evidence.json. Neither is called a real bank-detail photograph.
