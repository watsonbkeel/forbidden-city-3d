# R123 final current-state failure classification (read-only)

Runtime3cf before=after; writer source checkpoint `e4b52868481556f8d22f8b5ed01019e643d2ad52`.

Independent Counter comparison of the original TAP files confirms unchanged1289tests, R1201094PASS/195FAIL → R1231076PASS/213FAIL: **18 added failures, zero removed**.

The actual execution mechanisms are **17 + 1**, not16 + 2:

1. **17 historical fixture build errors**: all16`R62 baseline: compound24/47` cases plus`R62 baseline: old isolated Lijing start...` fail before traversal with explicit`Unsupported hall structure: chuxiu-rear-wing`. Stack traces enter the dynamically imported frozen historical`ZoneBase.buildHallBaseline` data-URL module. The decoded frozen source hash is the expected`b0016f34fa817b8986fc889e526ff89a0871dfa242e1ff7158c675d080582587`; it contains no new rear-wing dispatcher, while the fixture loads the current appended zone catalog. This is a real historical mixed-fixture schema incompatibility, not a source-hash guard and not the current production dispatcher failing.
2. **One current-candidate assertion**: `R63 candidate: old isolated Lijing start...` expects`arrived=false`, but obtains`true`. The approved main-frame relocation removes that old north-wall obstruction. This assertion describes an intentionally obsolete obstruction, not a newly blocked route.

The current production`ZoneBase.buildHallBaseline` explicitly dispatches the rear-wing structure to its dedicated builder. The18new failures contain no new current-production TypeError. This classification does **not** turn the213failures into passes or claim the repository is all-green.

No old tests, expected values, source-reversal helpers or product files were modified. `review.py/json/log` preserve independent extraction, full named classification, sanitized stack excerpts (original large data-URL raw remains in the TAP), and all input hashes. Separate fresh R1238/8/current-ready evidence is writer evidence and not re-run here.
