import {buildDuanmenBackdrop} from './palace/special/DuanmenBackdrop.js';
import { palaceWaterGroundPaths } from './palace/special/SouthWaterSystem.js';
import * as THREE from 'three';
import { COLORS, LAYOUT } from '../config/constants.js';
import { PALACE_LAYOUT } from './Layout.js';
import { innerJinshuiRoadGap } from './palace/special/InnerJinshui.js';
import { YANXI_RUIN_GROUND_CUTOUT } from './palace/special/YanxiRuin.js';
import { createSky, getSunPosition, updateSkyUniforms } from './sky/SkySetup.js';
import { createSkylineRing } from './sky/Skyline.js';
import { getBeijingDayCycle } from './sky/BeijingDayCycle.js';
import {householdLightingPolicy} from './sky/HouseholdLightingPolicy.js';
import { nightTourLighting } from './sky/NightTourLighting.js';

/**
 * 环境设置：天空、地面、雾效、光照
 */

export class Environment {
  constructor(scene, renderer, library) {
    this.scene = scene;
    this.renderer = renderer;
    this.library = library;
    this.objects = [];
    this.borrowedMaterials = new Set();
    this.initialized = false;
    // Initial placeholders are replaced by the date-derived Beijing sun in init.
    // World +X west, +Z north; the vector points from target toward the light.
    this.shadowOffset = new THREE.Vector3(100, 200, -100);
    this.sunPosition = getSunPosition(145, 28); // 降低太阳仰角，避免直射视野
    this.previewDate = null;
    this.lastClockUpdate = -Infinity;
  }

  addObject(object) {
    // Capture borrowing when registered, so teardown order does not depend on
    // whether TextureLibrary has already cleared its ownership cache.
    object.traverse(node => {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) if (this.library.owns?.(material)) this.borrowedMaterials.add(material);
    });
    this.objects.push(object);
    this.scene.add(object);
    return object;
  }
  
  /**
   * 初始化环境
   */
  init() {
    if (this.initialized) return;
    this.setupSky();
    this.setupSkyline();
    this.setupGround();
    this.setupDuanmenBackdrop();
    this.setupFog();
    this.setupLights();
    this.applyDayCycle(new Date(), true);
    this.setupIBL();
    this.initialized = true;
  }
  
  /**
   * 设置天空（Preetham 天空模型）
   */
  setupDuanmenBackdrop() {
    this.duanmenBackdrop = this.addObject(buildDuanmenBackdrop(this.library));
  }

  setDuanmenVisible(enabled) {
    if (this.duanmenBackdrop) this.duanmenBackdrop.visible = enabled === true;
  }

  setupSky() {
    const sky = createSky();
    updateSkyUniforms(sky, this.sunPosition);
    sky.frustumCulled = false;
    this.sky = this.addObject(sky);
  }
  
  /**
   * 设置远山天际线环带
   */
  setupSkyline() {
    const ring = createSkylineRing(this.library);
    this.skylineRing = this.addObject(ring);
  }
  
  /**
   * 设置地面（ground_brick 贴图，带河道孔洞）+ 中轴御道（stone_slab）
   */
  setupGround() {
    // 主地面：XY 平面旋转到 XZ（shape y = 世界 −z），河道用孔而非被完整地面遮住
    // 范围覆盖宫城 + 筒子河 + 街面：世界 x ±600、z −650 ~ +800
    const GX = 600, GZ0 = -650, GZ1 = 800;
    const shape = new THREE.Shape();
    shape.moveTo(-GX, -GZ1);
    shape.lineTo(GX, -GZ1);
    shape.lineTo(GX, -GZ0);
    shape.lineTo(-GX, -GZ0);
    shape.closePath();
    const rivers = PALACE_LAYOUT.filter(item => item.type === 'river');
    for (const river of rivers) shape.holes.push(...palaceWaterGroundPaths(river));
    // Permanent dry-pool opening matches the dedicated current-state ruin.
    // It is protected by physical guards; it does not create an entry route.
    const cut = YANXI_RUIN_GROUND_CUTOUT, poolHole = new THREE.Path();
    for (const [i,[x,z]] of [[cut.x-cut.w/2,cut.z-cut.d/2],[cut.x-cut.w/2,cut.z+cut.d/2],[cut.x+cut.w/2,cut.z+cut.d/2],[cut.x+cut.w/2,cut.z-cut.d/2]].entries()) poolHole[i?'lineTo':'moveTo'](x,-z);
    poolHole.closePath();shape.holes.push(poolHole);

    const groundGeometry = new THREE.ShapeGeometry(shape);
    const tileSize = this.library.tileSize('ground_brick');
    const uv = groundGeometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) / tileSize, uv.getY(i) / tileSize);
    }
    
    const groundMaterial = this.library.material('ground_brick', { roughness: 0.88, metalness: 0 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.addObject(ground);
    
    // 中轴御道（stone_slab，沿 z 轴从场景南界（午门外）到神武门）
    const roadWidth = 8;
    const roadZ0 = LAYOUT.BOUNDARY.minZ;
    const roadZ1 = LAYOUT.SHENWU_Z;
    const roadTileSize = this.library.tileSize('stone_slab');
    const roadMaterial = this.library.material('stone_slab', { roughness: 0.75, metalness: 0 });
    const gaps = rivers.map(r => innerJinshuiRoadGap(r, roadWidth / 2)).filter(Boolean).sort((a,b) => a.minZ - b.minZ);
    const spans = [];let cursor = roadZ0;
    for (const gap of gaps) {
      if (gap.minZ > cursor) spans.push([cursor, Math.min(gap.minZ, roadZ1)]);
      cursor = Math.max(cursor, gap.maxZ);
    }
    if (cursor < roadZ1) spans.push([cursor, roadZ1]);
    for (const [z0,z1] of spans) {
      if (z1 <= z0) continue;
      const length = z1-z0, geometry = new THREE.PlaneGeometry(roadWidth,length),uv=geometry.attributes.uv;
      for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*roadWidth/roadTileSize,uv.getY(i)*length/roadTileSize);
      const road = new THREE.Mesh(geometry,roadMaterial);road.rotation.x=-Math.PI/2;
      road.position.set(0,.01,(z0+z1)/2);road.receiveShadow=true;this.addObject(road);
    }
  }
  
  /**
   * 设置雾效（暖色调，与天空呼应）
   */
  setupFog() {
    // 金黄偏暖的雾色，与下午阳光呼应
    this.scene.fog = new THREE.FogExp2(0xd4c4a8, 0.00065);
  }
  
  /**
   * 设置光照（暖色太阳 + 半球光 + 填充光）
   */
  setupLights() {
    // 半球光（环境光）
    const hemiLight = new THREE.HemisphereLight(
      0xfff4e6, // 天空色：暖白偏金
      0x8a8272, // 地面色：暖灰
      0.5
    );
    hemiLight.position.set(0, 50, 0);
    this.addObject(hemiLight);
    this.hemiLight = hemiLight;
    
    // 方向光（太阳）：金黄偏橙的暖色调
    const dirLight = new THREE.DirectionalLight(0xfff5e1, 1.4);
    dirLight.position.copy(dirLight.target.position).add(this.shadowOffset);
    dirLight.castShadow = true;
    
    // 阴影配置
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    dirLight.shadow.camera.top = 120;
    dirLight.shadow.camera.bottom = -120;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    
    this.addObject(dirLight);
    this.addObject(dirLight.target);
    
    // 辅助光源（填充暗部，略带蓝调平衡暖色）
    const fillLight = new THREE.DirectionalLight(0xd8e8ff, 0.25);
    fillLight.position.set(-50, 50, -50);
    this.addObject(fillLight);
    this.fillLight = fillLight;
    const moonLight=new THREE.DirectionalLight(0xb9d4ff,0);
    moonLight.name='virtual-night-tour-moon-fill';moonLight.position.set(-180,240,120);
    moonLight.castShadow=false;moonLight.userData.virtualTourAid=true;
    this.moonLight=this.addObject(moonLight);
    
    this.dirLight = dirLight;

    // Virtual night-tour interpretation on the four EXISTING stone-lantern
    // housings, not a claim that these fixtures are illuminated at the museum.
    // One draw call, no new point lights/shadows or collision/flight geometry.
    const garden = PALACE_LAYOUT.find(item => item.type === 'garden');
    const hall = garden.elements.find(item => item.name === '钦安殿');
    const hz = garden.position.z + hall.position.z;
    const glow = new THREE.InstancedMesh(
      new THREE.BoxGeometry(.556, .40, .556),
      new THREE.MeshBasicMaterial({color: 0xffca7a, toneMapped: false, transparent: true}), 4
    );
    glow.name = 'virtual-night-garden-lamp-faces';
    glow.userData.virtualTourLighting = true;
    let index = 0;
    for (const z of [hz - 30, hz - 22]) for (const sign of [-1, 1]) {
      glow.setMatrixAt(index++, new THREE.Matrix4().makeTranslation(garden.position.x + sign * 3.3, 2, z));
    }
    glow.instanceMatrix.needsUpdate = true;
    glow.visible = false;
    this.nightLampGlow = this.addObject(glow);
  }
  
  /**
   * 设置 IBL（PMREM 环境贴图）
   */
  setupIBL() {
    // A dedicated sky-only bake prevents traversing/re-rendering the entire
    // palace whenever the time changes. Reuse one generator and dispose the
    // previous render target; no unbounded environment-map accumulation.
    this.iblScene = new THREE.Scene();
    this.iblSky = new THREE.Mesh(this.sky.geometry, this.sky.material.clone());
    this.iblScene.add(this.iblSky);
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.refreshIBL();
  }

  refreshIBL() {
    if (!this.pmrem) return;
    // Three r162 does not consume Scene.environmentIntensity. Scale the
    // independent bake radiance, leaving displayed sky and all asset materials
    // untouched. The .6 daylight reference retains the old effective day gain.
    const gain = this.dayCycle.lighting.environmentIntensity / .6;
    for (const key of ['topColor', 'bottomColor']) {
      this.iblSky.material.uniforms[key].value.copy(this.sky.material.uniforms[key].value).multiplyScalar(gain);
    }
    const next = this.pmrem.fromScene(this.iblScene, 0, .1, 2500);
    const previous = this.envTarget;
    this.envTarget = next;
    this.envMap = next.texture;
    this.scene.environment = next.texture;
    previous?.dispose();
    this.iblKey = this.currentIBLKey;
    this.lastIBLUpdate = performance.now();
  }

  /** Beijing civil time; preview is explicit and never changes the device clock. */
  setTimePreview(date = null) {
    if (date !== null && (!(date instanceof Date) || !Number.isFinite(date.getTime()))) throw Error('Invalid time preview');
    this.previewDate = date === null ? null : new Date(date.getTime());
    this.applyDayCycle(this.previewDate ?? new Date(), true);
  }

  applyDayCycle(date, refresh = false) {
    const state = getBeijingDayCycle(date), l = state.lighting;
    const tour=this.nightTourLighting=nightTourLighting(l.daylight);
    this.dayCycle = state;
    this.sky.material.uniforms.topColor.value.fromArray(l.skyTop);
    this.sky.material.uniforms.bottomColor.value.fromArray(l.skyBottom);
    this.scene.fog?.color.fromArray(l.fogColor);
    this.hemiLight.color.fromArray(l.hemisphereSkyColor);
    this.hemiLight.groundColor.fromArray(l.hemisphereGroundColor);
    this.hemiLight.intensity = l.hemisphereIntensity+tour.hemisphereBoost;
    this.fillLight.color.fromArray(l.fillColor);
    this.fillLight.intensity = l.fillIntensity+tour.fillBoost;
    this.moonLight.intensity=tour.moonIntensity;
    // Warm broad fill reaches axis facades and paving everywhere; the cool
    // retained sky separates this readable virtual night from daylight.
    const exteriorGain=Math.max(1-l.daylight,householdLightingPolicy(l.daylight,state.beijingTime).gain);
    this.nightLampGlow.visible = exteriorGain > 0;
    this.nightLampGlow.material.opacity = exteriorGain;
    this.dirLight.color.fromArray(l.sunColor);
    this.dirLight.intensity = l.sunIntensity;
    this.dirLight.castShadow = state.sun.elevationDegrees > 0;
    this.shadowOffset.set(state.sun.direction.x, state.sun.direction.y, state.sun.direction.z).multiplyScalar(260);
    this.dirLight.position.copy(this.dirLight.target.position).add(this.shadowOffset);
    // Exposure stays at the renderer's established value. Readable night
    // ambient light is an explicit tour aid, not measured lunar illumination.
    this.currentIBLKey = `${Math.round(l.daylight * 8)}:${Math.round(l.twilight * 5)}`;
    if (refresh || (this.currentIBLKey !== this.iblKey && performance.now() - (this.lastIBLUpdate ?? -Infinity) >= 30000)) this.refreshIBL();
  }
  
  /**
   * 调整光照质量（移动端降低阴影分辨率）
   */
  setQuality(isHighQuality) {
    if (!this.dirLight) return;
    const radius = isHighQuality ? 120 : 60;
    Object.assign(this.dirLight.shadow.camera, { left: -radius, right: radius, top: radius, bottom: -radius });
    this.dirLight.shadow.camera.updateProjectionMatrix();
    const size = isHighQuality ? 2048 : 512;
    if (this.dirLight.shadow.mapSize.width === size) return;
    
    if (isHighQuality) {
      this.dirLight.shadow.mapSize.width = 2048;
      this.dirLight.shadow.mapSize.height = 2048;
    } else {
      this.dirLight.shadow.mapSize.width = 512;
      this.dirLight.shadow.mapSize.height = 512;
    }
    
    // 需要重新创建阴影贴图
    if (this.dirLight.shadow.map) {
      this.dirLight.shadow.map.dispose();
      this.dirLight.shadow.map = null;
    }
    this.dirLight.shadow.needsUpdate = true;
  }

  update(camera, dt) {
    const now = performance.now();
    if (now - this.lastClockUpdate >= 1000) {
      this.lastClockUpdate = now;
      this.applyDayCycle(this.previewDate ?? new Date());
    }
    // 天空随观察者移动，光源与投影中心覆盖当前位置而非仅覆盖场景原点。
    this.sky.position.copy(camera.position);
    this.skylineRing.position.set(camera.position.x, this.skylineRing.position.y, camera.position.z);
    this.dirLight.target.position.set(camera.position.x, 0, camera.position.z);
    this.dirLight.position.copy(this.dirLight.target.position).add(this.shadowOffset);
  }

  dispose() {
    const geometries = new Set(), materials = new Set(), shadows = new Set();
    for (const object of this.objects) {
      object.traverse(node => {
        if (node.geometry) geometries.add(node.geometry);
        for (const material of node.userData?.ownedMaterials ?? []) {
          if (!this.borrowedMaterials.has(material) && !this.library.owns?.(material)) materials.add(material);
        }
        const slots = Array.isArray(node.material) ? node.material : [node.material];
        for (const material of slots) if (material && !this.borrowedMaterials.has(material) && !this.library.owns?.(material)) materials.add(material);
        if (node.shadow) shadows.add(node.shadow);
        // InstancedMesh owns GPU instance buffers separately from geometry.
        if (node.isInstancedMesh) node.dispose();
      });
      object.removeFromParent();
    }
    // The IBL sky borrows displayed-sky geometry but owns its cloned material.
    if (this.iblSky?.material) materials.add(this.iblSky.material);
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const shadow of shadows) shadow.dispose();
    this.objects.length = 0;
    this.borrowedMaterials.clear();
    this.initialized = false;
    this.lastClockUpdate = -Infinity;
    this.scene.fog = null;
    // Render-target disposal owns the IBL texture; do not dispose it twice.
    // Skyline/ground maps are borrowed library textures, never ours to release.
    this.envTarget?.dispose();
    this.pmrem?.dispose();
    this.iblSky = null;
    this.iblScene?.clear();
    this.envTarget = null;
    this.pmrem = null;
    this.envMap = null;
    this.scene.environment = null;
  }
}
