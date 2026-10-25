# R82 Fubi arch and sunken basin

## Implemented fit

The official bridge photograph clearly shows a single stone arch, a visible stone ring and water continuing below the pavilion. The old model's solid8.4×8.4×0.9 block and water at+0.3 hid this relationship. The replacement is a closed extruded stone solid with two side piers, a segmented elliptical intrados, a0.3m top thickness at the crown and independently closed shallow voussoir faces at each mouth. It is not a dark panel. The pool bed and four bank solids extend down to−1.25; the water surface is−0.45. Banks terminate at ground0 under the unchanged outer rim.

The arch width3.2, crown0.6, spring−0.45, levels and east-west bore are PHOTO_INFORMED_MODEL_FIT_NOT_SURVEY. The source photo does not establish world azimuth; this orientation connects the two sides of the existing model pool. Upper architecture, columns, roof, rails, seats, floor0.9 and porch0.5 are preserved rather than reinterpreted in this batch. No inference that retained upper details are exact is made.

## One pool opening, real visible void

FubiArchPool supplies the14.5×9.5 inner opening to Environment and GardenBuilder. The Environment shape has a real hole. Garden grass, pebble rectangles and affected flowerbed pieces use local rectangle subtraction; original path/bed metadata and tree sampling remain unchanged. Lower side-edge meshes that would cap the arch are replaced by the same arch solid while their body guards remain byte-identical. All other pavilion meshes, Chengrui, cross pavilions, ornaments and rockery are unchanged.

No underwater walking route is added. Existing pool exclusion boxes, all garden walkables and all world collider/support/room/map-item coordinates remain exact. The top is still fully supported. Flight water cells are identical; only two cells inside this pool drop from former water-surface height0.301 to0, with conservative no-landing still set.

## Alternatives not used

A dark arch decal would not create a real hole. A broad garden-ground replacement or copying this fit to Chengrui would enlarge scope and lose source-specific differences. Removing pool guards to allow swimming or bridge crawling is not authorized by this visual correction. The selected local fit avoids all three.

## Limits

Neither photograph provides exact dimensions, construction joints below water or pool elevations. Geometry/rays and CPU controller tests do not constitute GPU appearance, mobile performance or full manual-route acceptance. Stage5 northeast corner shape and972/961m layout calibration remain pending; this phase4 batch does not close them. No real photo pixel is embedded as a runtime texture.
