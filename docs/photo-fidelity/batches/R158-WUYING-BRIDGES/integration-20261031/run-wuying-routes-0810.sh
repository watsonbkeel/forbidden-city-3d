#!/usr/bin/env bash
set -u
cd /workspace/scratch/02a8023d1a85/r158-arrow-integrate
E=/workspace/scratch/02a8023d1a85/r158-wuying-integration-evidence-0756
files=(scripts/photo-fidelity/batches/r157-a37/wuying-bridge-routes.test.mjs scripts/photo-fidelity/batches/r157-a37/wuying-near-rail-routes.test.mjs scripts/photo-fidelity/batches/r157-a37/wuying-body-press.test.mjs scripts/photo-fidelity/batches/r157-a37/wuying-bridge-high-drop.test.mjs scripts/photo-fidelity/batches/r158-wuying-bridges/world-crown-recovery.test.mjs)
names=(central18 near36 body18 drop54 crown42)
export WUYING_NEW_EVIDENCE_DIR="$E"
for i in "${!files[@]}"; do
 log="$E/world-${names[$i]}-0810.tap"; test ! -e "$log" || exit 2
 export EVIDENCE_OUT="$E/world-${names[$i]}-0810.json"; test ! -e "$EVIDENCE_OUT" || exit 2
 echo "START ${names[$i]}"
 python "$E/resource-runner.py" "$log" "$E/world-${names[$i]}-0810.resource.json" node --expose-gc --max-old-space-size=1024 --import "$E/output-only-redirect.mjs" --test --test-reporter=tap "${files[$i]}"
 status=$?; echo "TERMINAL ${names[$i]} EXIT=$status"; tail -10 "$log"; test "$status" = 0 || exit "$status"
done
