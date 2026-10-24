#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
cd "$ROOT"
mkdir -p reports/r71-m-stage
npm run build -- --base=/ > reports/r71-m-stage/build-root.log 2>&1
node scripts/package-production.mjs "$ROOT/../r71-m-production" > reports/r71-m-stage/package-root.json
npm run build -- --base=/forbidden-city-3d/ --outDir="$ROOT/../r71-project-path-check" > reports/r71-m-stage/build-project.log 2>&1
python scripts/r71-m-stage/verify-production.py
