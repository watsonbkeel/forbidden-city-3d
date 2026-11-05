# Synchronous build-step equivalence

Baseline: 5030d7a4171eb7c5fd13c7e7d5bce259255f18a9 (Yizhai cumulative candidate).

Run light checks:

```sh
node --test --test-concurrency=1 tests/r165-synchronous-build-steps/contract.test.mjs tests/r165-synchronous-build-steps/steps.test.mjs tests/r165-synchronous-build-steps/order.test.mjs tests/r165-synchronous-build-steps/source.test.mjs
```

Run real zone checks serially, never concurrently with another zone/build:

```sh
BUILD_STEPS_EVIDENCE_DIR=/existing/project/artifact/directory node --expose-gc --test --test-concurrency=1 tests/r165-synchronous-build-steps/production-zone.test.mjs
node --expose-gc --test --test-concurrency=1 tests/r165-yizhai-main-shell/production-zone.test.mjs
```

The first test compares frozen 5030 and current real west-six via actual ZoneManager, material library and CollisionManager. It verifies complete finished geometry, physical arrays, map/rooms/regions/architecture/roof, first/repeated query results, 32MiB cache refusal, cold queue rebuild and disposal. Clock results are observations from this Node machine, not a benchmark or proof of speedup. The second retains the actual NingShou cumulative geometry, twenty destinations and route/negative-control checks already delivered with Yizhai.

The build remains synchronous. The private generator is fully consumed before build() returns and cannot be obtained from an instance. No timer/Promise/automatic retry or resumable build option exists. The copied first-fault summary, existing F3 display, and load metrics stay unchanged. For local investigation, an existing builder exposes getBuildStepMetrics(): count, outcome, totalMs, failedStep, and at most eight slowest records. Labels are fixed phase enums and nonnegative integer indices. Gate/item indices refer to the original zone JSON array; static profile/hook indices map to docs/current-state/r165-synchronous-build-steps/STEP-MAP.json. No item labels, error text, scene resources or arbitrary source metadata are copied.

Each duration measures generator.next() until the next boundary, including small iteration/look-ahead overhead. It does not split the measured operation. Constructor work, later collision registration/load listeners, and first-query index work are outside these step measurements; existing load metrics and the real-zone test record those separately. The total includes observation overhead, but does not include ZoneBase constructor work. Dispose does not clear the numeric snapshot, and the WeakMap does not retain a builder by itself.

Red evidence: the old real build lacked observations. Three initial order tests used owned.add on the actual array and failed early in both old/new fixtures; corrected to owned.push(material), then explicit original error assertions prevent accidental early errors from passing. These fixture failures are not product regressions. The implementation's full original build statements are independently recovered byte-for-byte after removing only declared step boundaries and the private synchronous wrapper. Missing/repeated boundaries are rejected; unrelated drift stays visible.

No full World, browser, GPU, phone, Node20 or Mac temperature validation is represented by these tests. This change is instrumentation and ordered-build groundwork, not a fix for the user's unclassified Chuxiu crash or a reduction of the synchronous long task.
