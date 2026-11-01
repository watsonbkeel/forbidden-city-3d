#!/usr/bin/env bash
set -u
cd /workspace/scratch/02a8023d1a85/r158-arrow-integrate
E=/workspace/scratch/02a8023d1a85/r158-wuying-integration-evidence-0756
files=(tests/photo-fidelity/batches/r158-wuying-production/world.test.mjs tests/photo-fidelity/batches/r158-wenhua-gate-production/world.test.mjs tests/photo-fidelity/batches/r158-integration/cumulative-world.test.mjs tests/photo-fidelity/batches/r158-arrow-integration/cumulative-world.test.mjs tests/photo-fidelity/batches/taihe-instruments-world.test.mjs tests/photo-fidelity/batches/taihemen-facilities-production-world.test.mjs)
names=(raw-proof wenhua prior-four arrow instruments taihemen)
export WUYING_CUMULATIVE_PROOF_OUT="$E/world-raw-proof-0809.json" WENHUA_PRODUCTION_WORLD_OUT="$E/world-wenhua-0809.json" R158_CUMULATIVE_WORLD_OUT="$E/world-prior-four-0809.json" R158_ARROW_WORLD_OUT="$E/world-arrow-0809.json" TAIHE_INSTRUMENT_WORLD_OUT="$E/world-instruments-0809.json" R157_TAIHEMEN_C_WORLD_OUT="$E/world-taihemen-0809.json"
for i in "${!files[@]}"; do
 log="$E/world-${names[$i]}-0809.tap"; test ! -e "$log" || exit 2
 echo "START ${names[$i]}"
 python "$E/resource-runner.py" "$log" "$E/world-${names[$i]}-0809.resource.json" node --expose-gc --max-old-space-size=1024 --test --test-reporter=tap "${files[$i]}"
 status=$?; echo "TERMINAL ${names[$i]} EXIT=$status"; tail -10 "$log"; test "$status" = 0 || exit "$status"
done
