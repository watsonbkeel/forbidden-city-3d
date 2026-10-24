#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
cd "$ROOT"
mkdir -p reports/r70-l-stage
npm run build -- --base=/ > reports/r70-l-stage/build-root.log 2>&1
node scripts/package-production.mjs "$ROOT/../r70-l-production" > reports/r70-l-stage/package-root.json
npm run build -- --base=/forbidden-city-3d/ --outDir="$ROOT/../r70-project-path-check" > reports/r70-l-stage/build-project.log 2>&1
python scripts/r70-l-stage/verify-production.py
