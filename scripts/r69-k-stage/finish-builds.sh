#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
cd "$ROOT"
mkdir -p reports/r69-k-stage
npm run build -- --base=/ > reports/r69-k-stage/build-root.log 2>&1
node scripts/package-production.mjs "$ROOT/../r69-k-production" > reports/r69-k-stage/package-root.json
npm run build -- --base=/forbidden-city-3d/ --outDir="$ROOT/../r69-project-path-check" > reports/r69-k-stage/build-project.log 2>&1
python scripts/r69-k-stage/verify-production.py
