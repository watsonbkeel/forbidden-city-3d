# Non-evidence mixed target run
`connected-37363-r125-3freq.json/log` used `invalid-mixed-graph-driver.mjs`:
old R125 world but current FurnitureMotion/EnvironmentWitness module graph. Private
WeakMap source identity therefore failed and stopped old main stairs. This is
INVALID_HARNESS, not evidence of an inherited product failure and not a baseline
comparison. It is retained, not silently overwritten. `*-r125-single-graph.json`
uses final d266 driver, dynamically loads every product/controller/waypoint module
from the same explicit sourceRoot on BOTH sides, and completes all9 old routes.
