#!/usr/bin/env bash
# Serial scoped validation. Expected aggregate reds are preserved, not hidden.
node scripts/major-pilots/chonghua-front/world-trace.mjs --parent > reports/major-pilots/chonghua-front/world-parent-final.log 2>&1
echo world-parent-final_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/world-parent-final.log
node scripts/major-pilots/chonghua-front/world-trace.mjs > reports/major-pilots/chonghua-front/world-candidate-final.log 2>&1
echo world-candidate-final_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/world-candidate-final.log
node --import ./scripts/major-pilots/chonghua-front/preserve-shared-reports.mjs --test --test-reporter=tap --test-concurrency=1 tests/r48-residential-*.test.mjs tests/r48-review-residential-central.test.mjs tests/west-six-current-passages.test.mjs > reports/major-pilots/chonghua-front/residential-final.log 2>&1
echo residential-final_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/residential-final.log
node --import ./scripts/major-pilots/chonghua-front/preserve-shared-reports.mjs --test --test-reporter=tap --test-concurrency=1 tests/r48-outer-navigation.test.mjs tests/r48-outer-neighbors.test.mjs tests/r48-outer-stairs.test.mjs > reports/major-pilots/chonghua-front/navigation-final.log 2>&1
echo navigation-final_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/navigation-final.log
node --import ./scripts/major-pilots/chonghua-front/preserve-shared-reports.mjs --test --test-reporter=tap --test-concurrency=1 tests/r40-east-facade*.test.mjs tests/r62-east-unknown-throne*.test.mjs tests/r62-east-throne-integration.test.mjs tests/r62-jingyang-rear-facade.test.mjs tests/r62-jingyang-rear-optimization.test.mjs > reports/major-pilots/chonghua-front/east-integration-final.log 2>&1
echo east-integration-final_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/east-integration-final.log
NODE_OPTIONS='--import ./scripts/major-pilots/chonghua-front/parent-retained-source.mjs --import ./scripts/major-pilots/chonghua-front/preserve-shared-reports.mjs' node --import ./scripts/major-pilots/chonghua-front/preserve-shared-reports.mjs --test --test-reporter=tap --test-concurrency=1 tests/r40-east-facade*.test.mjs tests/r62-east-unknown-throne*.test.mjs tests/r62-east-throne-integration.test.mjs tests/r62-jingyang-rear-facade.test.mjs tests/r62-jingyang-rear-optimization.test.mjs > reports/major-pilots/chonghua-front/east-integration-parent.log 2>&1
echo east-integration-parent_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/east-integration-parent.log
node --import ./scripts/major-pilots/chonghua-front/preserve-shared-reports.mjs --test --test-reporter=tap --test-concurrency=1 tests/major-pilots/changyin/contact.test.mjs tests/major-pilots/changyin/geometry.test.mjs tests/major-pilots/changyin/routes.test.mjs tests/major-pilots/jingqi/contact.test.mjs tests/major-pilots/jingqi/geometry.test.mjs tests/major-pilots/jingqi/routes.test.mjs tests/major-pilots/jiyun-lower-panels/contact.test.mjs tests/major-pilots/jiyun-lower-panels/dynamic.test.mjs tests/major-pilots/jiyun-lower-panels/geometry.test.mjs tests/major-pilots/jiyun-lower-panels/handoff-invariant.test.mjs tests/major-pilots/jiyun-lower-panels/lifecycle.test.mjs tests/major-pilots/jiyun-lower-panels/registration.test.mjs tests/major-pilots/jiyun-lower-panels/retention.test.mjs tests/major-pilots/jiyun-lower-panels/scope.test.mjs tests/major-pilots/jiyun-lower-panels/source.test.mjs tests/major-pilots/jiyun-rail/contact.test.mjs tests/major-pilots/jiyun-rail/dynamic.test.mjs tests/major-pilots/jiyun-rail/foot-contact.test.mjs tests/major-pilots/jiyun-rail/geometry.test.mjs tests/major-pilots/jiyun-rail/lifecycle.test.mjs tests/major-pilots/jiyun-rail/registration.test.mjs tests/major-pilots/jiyun-rail/retention.test.mjs tests/major-pilots/jiyun-rail/scope.test.mjs tests/major-pilots/jiyun-rail/source.test.mjs tests/major-pilots/xishang/dynamic.test.mjs tests/major-pilots/xishang/floor-ownership.test.mjs tests/major-pilots/xishang/geometry.test.mjs tests/major-pilots/xishang/ground-ownership.test.mjs tests/major-pilots/xishang/jump.test.mjs tests/major-pilots/xishang/registration.test.mjs tests/major-pilots/xishang/threshold.test.mjs tests/major-pilots/xishang/world-exit.test.mjs tests/r100-xishang-stone-rails.test.mjs tests/r104-roof-integration.test.mjs tests/r104-roof-prefix-equivalence.test.mjs tests/r104-roof-surface.test.mjs tests/r104-xiqing-motion.test.mjs tests/r65-pedestrian-controls.test.mjs tests/r91-terrain-vertical.test.mjs tests/r100-xishang-movement.test.mjs > reports/major-pilots/chonghua-front/shared-final.log 2>&1
echo shared-final_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/shared-final.log
node --import ./scripts/major-pilots/chonghua-front/preserve-shared-reports.mjs --test --test-reporter=tap --test-concurrency=1 tests/r33-chuxiu-household.test.mjs tests/r78-*.test.mjs > reports/major-pilots/chonghua-front/household-final.log 2>&1
echo household-final_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/household-final.log
node --import ./scripts/major-pilots/chonghua-front/preserve-shared-reports.mjs --test --test-concurrency=1 tests/current-state/*.test.mjs > reports/major-pilots/chonghua-front/current-state.log 2>&1
echo current-state_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/current-state.log
node --import ./scripts/major-pilots/chonghua-front/preserve-shared-reports.mjs --test --test-reporter=tap --test-concurrency=1 tests/r66-h-*.test.mjs > reports/major-pilots/chonghua-front/northwest-final.log 2>&1
echo northwest-final_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/northwest-final.log
NODE_OPTIONS='--import ./scripts/major-pilots/chonghua-front/parent-retained-source.mjs --import ./scripts/major-pilots/chonghua-front/preserve-shared-reports.mjs' node --test --test-reporter=tap --test-concurrency=1 tests/r66-h-*.test.mjs > reports/major-pilots/chonghua-front/northwest-parent.log 2>&1
echo northwest-parent_EXIT=$?
tail -9 reports/major-pilots/chonghua-front/northwest-parent.log
