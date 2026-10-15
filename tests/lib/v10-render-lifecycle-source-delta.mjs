import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Two complete, finite source replacements. No whitespace/AST normalization,
// replacement hash, or exception for any other postprocessing behavior.
export const V10_RENDER_LIFECYCLE_DELTAS = Object.freeze([
  Object.freeze({
    before: '    // 重新初始化\n    this.dispose();\n    this.init(quality);\n',
    after: '    // 只重建后期处理；场景批次由场景变化或完整销毁负责释放。\n    this.disposePostProcessing();\n    this.init(quality);\n',
  }),
  Object.freeze({
    before: '  dispose() {\n    this.batchedBuilder.dispose();\n    if (this.composer) {\n',
    after: '  dispose() {\n    this.batchedBuilder.dispose();\n    this.disposePostProcessing();\n  }\n\n  disposePostProcessing() {\n    if (this.composer) {\n',
  }),
]);

export function restoreV9PostProcessingBytes(current) {
  let source = current.toString('utf8');
  for (const { before, after } of V10_RENDER_LIFECYCLE_DELTAS) {
    assert.equal(source.split(after).length - 1, 1,
      'Each exact V10 lifecycle replacement must occur exactly once');
    source = source.replace(after, before);
  }
  return Buffer.from(source, 'utf8');
}

export function assertV10PostProcessingBytes(current, historicalHash) {
  const restored = restoreV9PostProcessingBytes(current);
  assert.equal(createHash('sha256').update(restored).digest('hex'), historicalHash,
    'PostProcessing must equal the unchanged protected historical bytes plus only the two exact lifecycle replacements');
}
