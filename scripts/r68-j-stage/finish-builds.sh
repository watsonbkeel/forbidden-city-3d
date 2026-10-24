set -eu
for name in 碧螺亭 遂初堂 倦勤斋; do R68_PREVIEW_SET=previews-final node scripts/r68-j-stage/export-preview.mjs "$name" final; done
node --test --test-reporter=tap --test-name-pattern='real production library|actual finish return' tests/r48-ningshou-real-materials.test.mjs > reports/r68-j-stage/current-material-merge.tap
npm run build -- --base=/ > reports/r68-j-stage/build-root.log 2>&1
node scripts/package-production.mjs /workspace/scratch/02a8023d1a85/r68-j-production > reports/r68-j-stage/package-root.json
npm run build -- --base=/forbidden-city-3d/ --outDir=/workspace/scratch/02a8023d1a85/r68-project-path-check > reports/r68-j-stage/build-project.log 2>&1
python scripts/r68-j-stage/verify-production.py
