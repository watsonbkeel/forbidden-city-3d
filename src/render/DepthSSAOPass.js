import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

// 复用主场景深度，用相邻像素重建视空间法线，避免法线 pass 重绘场景及阴影。
export class DepthSSAOPass extends SSAOPass {
  constructor(scene, camera, width, height) {
    super(scene, camera, width, height);
    this.ssaoMaterial.fragmentShader = this.ssaoMaterial.fragmentShader.replace(
      'return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );',
      `vec2 pixel = 1.0 / resolution;
      float depth = getDepth(screenPosition);
      vec3 center = getViewPosition(screenPosition, depth, getViewZ(depth));
      float dl = getDepth(screenPosition - vec2(pixel.x, 0.0));
      float dr = getDepth(screenPosition + vec2(pixel.x, 0.0));
      float db = getDepth(screenPosition - vec2(0.0, pixel.y));
      float dt = getDepth(screenPosition + vec2(0.0, pixel.y));
      vec3 left = getViewPosition(screenPosition - vec2(pixel.x, 0.0), dl, getViewZ(dl));
      vec3 right = getViewPosition(screenPosition + vec2(pixel.x, 0.0), dr, getViewZ(dr));
      vec3 bottom = getViewPosition(screenPosition - vec2(0.0, pixel.y), db, getViewZ(db));
      vec3 top = getViewPosition(screenPosition + vec2(0.0, pixel.y), dt, getViewZ(dt));
      vec3 dx = abs(left.z - center.z) < abs(right.z - center.z) ? center - left : right - center;
      vec3 dy = abs(bottom.z - center.z) < abs(top.z - center.z) ? center - bottom : top - center;
      return normalize(cross(dx, dy));`
    );
  }

  overrideVisibility() {}
  restoreVisibility() {}
  renderOverride() {}

  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    this.ssaoMaterial.uniforms.tDepth.value = readBuffer.depthTexture;
    this.depthRenderMaterial.uniforms.tDepth.value = readBuffer.depthTexture;
    super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
  }
}
