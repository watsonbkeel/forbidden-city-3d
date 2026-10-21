# Continuous courtyard route regression and bounded correction

The first complete R48 checkpoint exposed a real regression, not a stale snapshot. In the existing R34 full-axis route with the Chuxiu excursion, six of twelve travel modes failed near world (93.26, 356.49). Both B and S scene states failed. A short straight route did not reproduce the continuous-turn failure.

The cause was Yongshou rear hall's source-supported change from seven generic bays to five. The generic column formula increased its fitted top radius from 0.262 m to 0.34 m. The new rear posts left approximately 1 cm of player-center tolerance beside the retained northern courtyard route. The actual tapered post bottoms protruded farther than their old collision boxes.

Only this hall's twelve front/rear posts retain the prior fitted 0.262 m top radius and 0.2751 m bottom radius. Their twelve colliders conservatively contain those real bottoms. All five-bay axes, roof, walls and original route points remain unchanged. This is a modeling clearance fit, not a historical measurement.

Verification after the actual product correction:
- Original R34 B/S continuous route suite: 98/98 passed, without changing movement, route points or tolerances.
- Exact physical post/collider bounds and original beam contact: passed.
- All eleven other residential profiles retain their previous geometry/navigation signatures exactly.
- Independent residential/central review plus targeted post checks: 130/130 passed.
- Residential, runtime landing and authorized-scope regression: 152/152 passed.

The original failed checkpoint is retained. These results do not replace the final complete-version regression or WebGL/native-phone visual acceptance.
