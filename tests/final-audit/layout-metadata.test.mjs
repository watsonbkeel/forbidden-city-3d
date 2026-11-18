import test from 'node:test';
import assert from 'node:assert/strict';
import {getBuildingData} from '../../src/scene/Layout.js';

// Palace Museum roof typology; metadata must describe the generated halls.
// https://www.dpm.org.cn/explore/building/236464.html
// https://www.dpm.org.cn/explore/building/236434.html
for (const [name, roof, layers] of [['中和殿', 'pavilion', 1], ['保和殿', 'xieshan', 2]]) {
  test(name + ' exports the documented roof form and eave count', () => {
    const {roofType, roofLayers} = getBuildingData(name).features;
    assert.deepEqual([roofType, roofLayers], [roof, layers]);
  });
}
