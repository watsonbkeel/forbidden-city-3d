import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Explicit V9 exception to the V7/V8 whole-controller freeze. These are the
// complete approved FirstPerson additions, not a new baseline or a normalizer.
export const V9_INPUT_INSERTIONS = Object.freeze([
  { anchor: '    this.mobileRunning = false;\n',
    addition: '    this.runSessionGeneration = null;\n' },
  { anchor: '  stop() {\n',
    addition: '    // 取消尚未消费的输入，不改已经起跳后的竖直速度或重力。\n    this.jumpQueued = false;\n' },
  { anchor: '    if (this.isMobile && this.joystick && this.joystick.isActive()) {\n',
    addition: '      // 松手/取消后可能在同一帧前重新认领，不能等 RAF 观察到 inactive。\n' +
      '      if (this.runSessionGeneration !== this.joystick.sessionGeneration) {\n' +
      '        this.runSessionGeneration = this.joystick.sessionGeneration;\n' +
      '        this.runDirAngle = null;\n        this.runStartTime = 0;\n      }\n' },
  { anchor: '      // 只在水平面移动\n',
    addition: '      // PointerLockControls 读 local matrix；鼠标/触摸及本帧 Q/E 先更新的是 quaternion。\n' +
      '      this.camera.updateMatrix();\n' },
]);

export function expectedV9FirstPersonBytes(historical) {
  let source = historical.toString('utf8');
  for (const { anchor } of V9_INPUT_INSERTIONS) {
    assert.equal(source.split(anchor).length - 1, 1, `V9 insertion anchor must occur exactly once: ${anchor}`);
  }
  assert.equal(createHash('sha256').update(historical).digest('hex'),
    '3ddb86b1c396df65641fb2927a3b108e958fabafbf895b93ecd28ad5799de946',
    'V9 delta accepts only the unchanged historical V7/V8 controller bytes');
  for (const { anchor, addition } of V9_INPUT_INSERTIONS) source = source.replace(anchor, anchor + addition);
  return Buffer.from(source, 'utf8');
}

export function assertV9FirstPersonBytes(historical, current) {
  assert.deepEqual(current, expectedV9FirstPersonBytes(historical),
    'FirstPerson must be exactly the historical bytes plus the explicit V9 input delta');
}
