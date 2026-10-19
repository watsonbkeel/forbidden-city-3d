# R15 Beijing day cycle: sources, model, and integration contract

Research date: 2026-10-18. This note describes the pure `BeijingDayCycle.js` module, not a claim that a complete rendered scene has passed visual acceptance.

## Solar source and limits

The numerical source is NOAA Global Monitoring Division's [General Solar Position Calculations](https://gml.noaa.gov/grad/solcalc/solareqns.PDF), a two-page primary reference. The module implements its fractional-year equation, equation-of-time and declination series, east-positive longitude/time-zone correction, and solar hour angle. The azimuth calculation uses an equivalent `atan2` form to preserve the east/west quadrant. Seconds and milliseconds are retained instead of rounding to an hour. Gregorian leap years use 366 days.

This is a compact annual approximation, not NOAA's full Meeus-based web calculator or a high-precision ephemeris. NOAA's [calculation details](https://gml.noaa.gov/grad/solcalc/calcdetails.html) distinguish theoretical calculations from observations affected by atmospheric conditions, and currently say that the web calculator is no longer actively maintained. Its quoted minute-level sunrise/sunset accuracy is **not** a validated accuracy claim for this module.

The returned elevation is the geometric solar centre. It omits atmospheric refraction, the apparent solar radius, terrain/building obstruction, weather, aerosol variation, and local horizon height. The `-0.833°` onset in the illustrative direct-light response borrows the conventional sunrise offset described by NOAA; it does not convert the returned elevation into an apparent elevation or compute an observed sunrise time. No promises are made for astronomical, surveying, safety, historical, or legal use.

The annual approximation is intended for present-day seasonal presentation. It is not a long-term orbital model. Its year-length change can introduce a tiny numerical difference at a leap/common-year boundary; one-second continuity checks explicitly include that boundary. No arbitrary fixed 06:00/18:00 switch is used.

## Location and civil time

- Fixed input: latitude **39.916° N**, longitude **116.397° E**.
- These are deliberately labelled **approximate scene coordinates**, not a verified survey control point or an assertion about a coordinate datum. Small site-coordinate differences have far less visual consequence than the atmospheric/annual-model limitations above.
- Beijing civil time is fixed at UTC+8. The input is an actual `Date` instant, and the module uses an offset plus UTC calendar getters. It never uses the host's local time-zone getters, locale parser, system DST rules, or a network time service.
- The current device time, a selected demonstration time, and clock progression must be supplied by the caller. The module never silently reads the clock.
- An invalid `Date`, non-`Date` input, or a date whose UTC+8 shift exceeds JavaScript's representable range fails explicitly. It does not emit NaN or replace invalid input with the current time.

## Public API and direction convention

Exports:

1. `BEIJING_SITE`: frozen coordinate/UTC-offset metadata, including `coordinatesAreApproximate: true`.
2. `getBeijingTime(date)`: `year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond`, `dayOfYear`, `daysInYear`, `minutesOfDay`, `utcOffsetMinutes`, `dateLabel` (`YYYY-MM-DD` for modern dates), and `timeLabel` (`HH:mm:ss`).
3. `compassSunDirection(azimuthDegrees, elevationDegrees)`: plain unit-vector object `{ x, y, z }`.
4. `calculateBeijingSun(date)`: `azimuthDegrees`, `elevationDegrees`, `hourAngleDegrees`, `declinationDegrees`, `equationOfTimeMinutes`, and `direction`.
5. `getBeijingDayCycle(date)`: `{ timestampMs, beijingTime, sun, phase, lighting }`.

Compass azimuth is clockwise from north. World **+X is west**, **+Z is north**, and **+Y is up**. The vector points **from the scene toward the sun**; incoming rays point in the opposite direction. At the horizon: north `(0,0,1)`, east `(-1,0,0)`, south `(0,0,-1)`, west `(1,0,0)`.

`phase` is a descriptive UI label only: `night` below -6° elevation; `day` at or above 8°; otherwise `sunrise` before solar noon and `sunset` after it. This deliberately broad sunrise/sunset band is an interface convention, not an astronomical event definition. Rendering must use the continuous numeric lighting fields, never toggle lighting on a phase-label change.

## Rendering response is illustrative

All palettes, brightness values, twilight widths, and night visibility floors are art direction. They are **not measured sky radiance, real Palace Museum fixture brightness, historical lamp data, or a lunar simulation**. Sunrise and sunset share a symmetric elevation-based response.

`lighting` contains:

- Linear RGB arrays: `skyTop`, `skyBottom`, `fogColor`, `sunColor`, `hemisphereSkyColor`, `hemisphereGroundColor`, `fillColor`.
- Scalar controls: `sunIntensity`, `hemisphereIntensity`, `fillIntensity`, `environmentIntensity`, `exposure`, `daylight`, `twilight`.

The authored swatches are sRGB; the module decodes them to **linear RGB once**. Returned arrays work directly with `THREE.Color.fromArray` or default-space `setRGB`. Do not apply a second sRGB-to-linear conversion. Linear interpolation and smoothstep responses keep the colors and intensities continuous.

Suggested day/night ranges are sun 0–1.4, hemisphere 0.11–0.5, fill 0.035–0.25, IBL multiplier 0.08–0.6, and exposure 0.9–1.0. The modest nonzero night ambient/fill provides legibility, not simulated moonlight. Direct sunlight becomes exactly zero at geometric elevation -0.833° and below. The module does not introduce lamp geometry or emissive architectural materials.

The integrating environment must apply consistent sky/fog/light/IBL state and dispose any superseded GPU environment resources. Returning an `environmentIntensity` value does not itself recolor or regenerate a PMREM. Do not regenerate a PMREM every animation frame. This pure module owns no renderer, textures, GPU resources, timers, event handlers, or packages.

## Historical lamps: bounded evidence only

The Palace Museum's [22 January 2019 exhibition report](https://www.dpm.org.cn/show/248565.html) describes reconstructed pairs of tall sky lanterns and longevity lanterns installed by Qianqing Palace on 21 January for its New Year exhibition. It describes their historic seasonal installation and removal schedule and says that erecting them stopped in 1840. This supports a **seasonal historical/exhibition reconstruction**, not a present-day year-round installation.

The Museum's [report on the reconstruction objects' charity auction](https://www.dpm.org.cn/classify_detail/248991.html) repeats that historic cessation and identifies the objects as reconstructions associated with the New Year exhibition. These two 2019 documents do **not** establish the current 2026 nightly lighting scheme, present-day permanent lantern inventory, exact lamp photometry, or permission to treat exhibition decorations as permanent architecture.

The official articles were first checked through indexed full-text results after the search tool's direct page requests timed out. A subsequent direct read of the Museum's own exhibit pages and image server succeeded; the photographs listed below were actually viewed. No secondary image or tour photograph is used to infer a current lamp placement. This module itself adds no lamp geometry and makes no claim that such tall lamps are permanently present.

### Optional festival demonstration: data-only arrangement proposal

Suggested explicit label: **清宫节庆灯光演示（参考2019年复原；位置与亮度示意）**. This optional presentation is separate from the current-date solar clock. Enabling it does not assert that a present-day October night is a historical festival night. No additional module, scene object, or geometry is implemented in this subtask.

Official visual references actually viewed:

1. [Frontal Qianqing exterior photograph](https://img.dpm.org.cn/Uploads/Picture/2019/12/25/s5e02cb6d0d0af.jpg), linked as 乾清宫外景 from the Museum's [exhibition gallery](https://www.dpm.org.cn/subject_hesui/huantian.html). All four structures and the central causeway are visible.
2. [Oblique Qianqing exterior photograph](https://img.dpm.org.cn/Uploads/Picture/2019/12/20/s5dfca18d33e1a.jpg), from the same official gallery. The raised terrace and courtyard-grade sky-lantern bases are distinguishable.
3. [Close frontal view of the longevity-lantern pair](https://img.dpm.org.cn/Uploads/Picture/2020/01/06/s5e12a778223da.jpg), linked from the official [万寿灯 exhibit description](https://www.dpm.org.cn/subject_hesui/qifu/251669.html).
4. [Side view of one sky lantern](https://img.dpm.org.cn/Uploads/Picture/2020/01/06/s5e12a7e92986f.jpg), linked from the official [天灯 exhibit description](https://www.dpm.org.cn/subject_hesui/qifu/251670.html).

Bounded placement data, combining these viewed images with the exhibit descriptions:

- **万寿灯 / longevity lanterns:** one east/west pair **on the raised front terrace**, closely flanking the main entrance/causeway axis. In the frontal image the elaborate banner-covered structures sit inside the broad building/terrace width, leaving the central approach open. Each has a pavilion-like top, a central decorated pole, outward supports and hanging long vertical elements. The 2019 reconstruction's published total height is **10.9 m**, pillar height **7.6 m**, and overall stated diameter **5 m**; those dimensions describe the reconstruction, not a new survey.
- **天灯 / sky lanterns:** one east/west pair **at courtyard grade below the terrace**, much farther laterally outboard than the longevity pair, near the terrace's outer left/right flanks and beyond its side-stair areas. The viewed shape is a tall slender pole with a small top pavilion/finial, projecting dragon-form hanging-lamp support, and four conspicuous diagonal props. The official exhibit description says the pole is nearly **14 m** tall. The [2019 reconstruction specification](https://www.dpm.org.cn/classify_detail/248991.html) gives **13.9 m total height**, **10.8 m pillar height**, and **0.6 m stated diameter**; that diameter must not be mistaken for the complete footprint of its broad diagonal props. It is not a modern street-light or a broad cylindrical lantern tower.
- Looking north toward Qianqing Palace, **image-left is west (+X)** and **image-right is east (-X)**. Both pairs are south of the palace facade. The upper pair occupies the front terrace; the lower pair is not a same-width continuation of that pair and is not on the central causeway.
- **Unknown registration:** exact centre-to-axis offsets, north/south offsets, base elevations, base diameters, ground contours, lamp orientations, and attachment dimensions have not been measured. The photographs are perspective views, not an orthorectified plan. Do not convert their screen-space ratios into claimed metre coordinates. Place against verified scene terrace/courtyard surfaces only after a separate model-registration check, retain the schematic label, and keep paths/stairs unobstructed.

Historical lighting differs between the two types. The Museum's [万寿灯 description](https://www.dpm.org.cn/subject_hesui/qifu/251669.html) says it carried eight strings of eight lamps on specified festival days (New Year's Eve, first-month days 1, 11, and 14–16), with inscribed banners on other days. The [天灯 description](https://www.dpm.org.cn/subject_hesui/qifu/251670.html) says its lamps were lit nightly during the seasonal interval from twelfth-month day 24 to second-month day 3. A banner-covered daytime reconstruction is not evidence that those banners themselves emitted light. A visibly illuminated demonstration should identify its selected festival-night interpretation; any glow radius, emissive color, bulb count simplification, light power, flicker, or falloff remains illustrative and unmeasured.

## Focused verification

Run: `node --test tests/current-state/r15-beijing-day-cycle.test.mjs`.

The focused suite was written first and failed with the missing-module assertion, then passed all 13 tests after implementation. It covers:

- UTC+8 midnight/year rollover, leap day, and Gregorian century cases;
- identical serialized output in UTC, Los Angeles, Shanghai, and Auckland host time zones;
- cardinal direction mapping, normalized vectors, morning east/afternoon west;
- broad independent seasonal sanity checks near both equinoxes and solstices;
- summer/winter differences at the same 06:00 civil time;
- midnight direct sunlight off and reduced sky/ambient/fill/IBL values;
- distinct sunrise/day/sunset/night labels;
- finite and bounded values at every hour in 2024 and 2026 (17,544 samples);
- one-second sky/light/vector continuity around minute samples on seasonal, leap-day, and year-boundary dates;
- deterministic repeated calls, unmodified input Dates, independent output objects, and explicit invalid-input rejection.

These checks validate numerical and API behaviour. They do not replace integrated browser screenshots, render/resource checks, movement regression checks, or the owner's release acceptance run.

## First ordinary-image finding and bounded adjustment (15:37 UTC)

The first9d39ed3 ordinary native page completed151s with no resource/application
error. Native boarding, ascent to9.9m, follow/overhead/pilot and21.6m forward
movement while map-open were observed. M-open/close events actually worked;
a later screenshot captured the map reopened, so it is not a map-toggle defect.
The night image was too dark for navigation and expanded tools overlapped.
The subsequent candidate increases only the explicitly illustrative night
ambient/fill/radiance response, leaving sunlight zero, exposure unchanged and
daytime endpoints unchanged. Tool panels share flow layout and exclusive
`details` opening. New actual pixels are required before acceptance.

## Optional two sky-lamp interpretation

Official primary text: https://www.dpm.org.cn/subject_hesui/qifu/251670.html
Two sky lamps stood below Qianqing Palace's terrace during the New Year season;
the practice stopped in1840. The2019 reconstruction is historical exhibition
evidence, not proof of permanent present-day lighting. The text describes tall
carved poles, small roofed tops, dragon brackets, hanging lamps, four timber
braces and four bronze attendants. This candidate simplifies the silhouette;
carved dragons and attendants are not claimed reconstructed.

The published13.9m total is retained. The two lower-court X±37/Z284.5 positions,
small shapes, colors and light levels are approximate registrations from the
official frontal photograph, not surveyed coordinates. They are an explicit
optional demonstration, off by default. Two warm nonshadow point lights are
limited to36m; walking and aircraft obstacles switch together and activation
is refused when a walker or parked/flying aircraft occupies the fixture.

The two upper-terrace longevity lamps are not silently fabricated: their5m
reported spread cannot presently be registered against the inherited
Qianqing roof/terrace without an apparent eave conflict. This remains a source/
registration gap; it is not solved by moving the real building or shrinking
those lamps. The lower pair can be delivered independently with this limit.
