import * as THREE from 'three';
import { Environment } from './src/scene/Environment.js';
import { PalaceBuilder } from './src/scene/PalaceBuilder.js';
import { PALACE_LAYOUT } from './src/scene/Layout.js';
import { FirstPersonControls } from './src/controls/FirstPerson.js';
import { CollisionManager } from './src/utils/Collision.js';
import { PostProcessing } from './src/render/PostProcessing.js';
import { ShadowSetup } from './src/render/ShadowSetup.js';
import { TextureLibrary } from './src/utils/TextureLibrary.js';
import { Enclosure } from './src/scene/Enclosure.js';
import { GardenBuilder } from './src/scene/GardenBuilder.js';
import { ZoneManager } from './src/scene/zones/ZoneManager.js';
import { InteriorLoader } from './src/scene/interior/InteriorLoader.js';
import { ZONES } from './data/zones/index.js';
import { Ambience } from './src/audio/Ambience.js';
import { Minimap } from './src/ui/Minimap.js';
import { Teleport } from './src/ui/Teleport.js';
import { SettingsMenu } from './src/ui/SettingsMenu.js';
import { SettingsTourSession } from './src/ui/SettingsTourSession.js';
import { MapTourSession } from './src/ui/MapTourSession.js';
import { hasShortcutModifier, isTextEntryTarget } from './src/controls/InputTargets.js';
import { PerfHUD } from './src/ui/PerfHUD.js';
import { LAYOUT, PERFORMANCE, TELEPORT } from './src/config/constants.js';
import { INITIAL_VIEW_POSITION } from './src/config/initialView.js';
import { createPalaceFlightEnvelope, FLIGHT_BOUNDS } from './src/scene/flight/FlightEnvelope.js';
import { FlightTour } from './src/scene/flight/FlightTour.js';
import { HistoricalSkyLamps } from './src/scene/sky/HistoricalSkyLamps.js';
import { DayNightPanel } from './src/ui/DayNightPanel.js';
import { HelpPanel } from './src/ui/HelpPanel.js';
import { modelFidelityFor } from './src/ui/ModelFidelity.js';

/**
 * 故宫 3D 虚拟游览主程序
 */

class ForbiddenCityApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.postProcessing = null;
    this.collisionManager = null;
    
    this.currentQuality = 'high';
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    this.lastLocation = null;
    this.lastShadowUpdate = 0;
    this.shadowObjects = [];
    this.disposed = false;
    this._animate = this.animate.bind(this);
    this._onResize = this.onResize.bind(this);
    
    // 加载管理
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onProgress = (url, loaded, total) => {
      const progress = (loaded / total) * 100;
      this.updateLoadingProgress(progress, url);
    };
    this.loadingManager.onLoad = () => {
      this.onLoadComplete();
    };
  }
  
  /**
   * 初始化
   */
  async init() {
    // 显示加载界面
    this.showLoading();
    
    // 尺寸监听必须在加载前注册：之前放在加载完成后，手机在加载过程中转横屏，
    // 画布会停留在竖屏尺寸，横屏时只占左半边、右边黑屏。
    // 微信 / iOS 转屏时 resize 可能不触发或触发时尺寸还没更新，所以再加 orientationchange、
    // visualViewport 两路兜底，并在转屏后延迟复查；动画循环里也会每帧比对尺寸。
    this._onOrientationChange = () => {
      this.onResize();
      clearTimeout(this._resizeTimer1);
      clearTimeout(this._resizeTimer2);
      this._resizeTimer1 = setTimeout(this._onResize, 200);
      this._resizeTimer2 = setTimeout(this._onResize, 600);
    };
    window.addEventListener('resize', this._onResize);
    window.addEventListener('orientationchange', this._onOrientationChange);
    window.visualViewport?.addEventListener('resize', this._onResize);
    
    // 说明：本项目的纹理（Canvas）和几何体都是程序化同步生成的，不经过任何 Loader，
    // LoadingManager 不会自动收到进度，onLoad 也不会触发（之前加载界面卡在 0% 的根因）。
    // 这里把每个构建步骤手动登记到 LoadingManager：先全部 itemStart，每完成一步 itemEnd，
    // 这样 onProgress 能正常推进进度条，最后一步完成时 onLoad 自动触发并关闭加载界面。
    const quality = this.isMobile ? 'low' : 'high';
    const steps = [
      ['渲染器', () => {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.shadowSetup = new ShadowSetup(this.renderer);
        this.shadowSetup.init(quality);
      }],
      ['材质贴图', async () => {
        // 手机用 512 档贴图，桌面用 1024 档；加载失败的贴图自动回退为程序化贴图
        const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
        this.library = new TextureLibrary({
          quality: this.isMobile ? 'sd' : 'hd',
          anisotropy: Math.min(maxAniso, this.isMobile ? 2 : 8),
        });
        const stepIndex = steps.findIndex(([name]) => name === '材质贴图');
        await this.library.load((done, total) => {
          const progress = ((stepIndex + done / Math.max(total, 1)) / steps.length) * 100;
          this.updateLoadingProgress(progress, `材质贴图 ${done}/${total}`);
        });
      }],
      ['天空与光照', () => {
        this.environment = new Environment(this.scene, this.renderer, this.library);
        this.environment.init();
        this.environment.setQuality(quality === 'high');
      }],
      ['宫殿建筑', () => {
        this.palaceBuilder = new PalaceBuilder(this.scene, this.library);
        this.palaceBuilder.buildAll(PALACE_LAYOUT);
      }],
      ['宫墙与庑房', () => {
        this.enclosure = new Enclosure(this.scene, this.library).build();
      }],
      ['御花园', () => {
        const garden = PALACE_LAYOUT.find(item => item.type === 'garden');
        this.garden = new GardenBuilder(this.scene, this.library).build(garden);
        // 静态场景（中轴/宫墙/御花园）进入阴影 LOD 列表；分区网格由 ZoneManager 回调增删
        this.scene.traverse(object => {
          if (object.isMesh) this.shadowObjects.push(object);
        });
      }],
      ['东西六宫与两路宫殿', () => {
        // 碰撞管理器先建：ZoneManager 加载区时要往里注册带 tag 的碰撞体
        this.collisionManager = new CollisionManager();
        this.zoneManager = new ZoneManager();
        this.zoneManager.onLoad = (_id, group) => group.traverse(o => { if (o.isMesh) this.shadowObjects.push(o); });
        this.zoneManager.onUnload = (_id, group) => {
          const gone = new Set();
          group.traverse(o => { if (o.isMesh) gone.add(o); });
          this.shadowObjects = this.shadowObjects.filter(o => !gone.has(o));
        };
        ZONES.forEach(zone => this.zoneManager.register(zone));
        const start = INITIAL_VIEW_POSITION;
        this.zoneManager.init(this.scene, this.library, this.collisionManager, { x: start.x, z: start.z });
      }],
      ['碰撞检测', () => {
        this.collisionManager.addColliders(this.palaceBuilder.getColliders());
        this.collisionManager.addWalkables(this.palaceBuilder.getWalkables());
        this.collisionManager.addColliders(this.enclosure.getColliders());
        this.collisionManager.addColliders(this.garden.getColliders());
        this.collisionManager.addWalkables(this.garden.getWalkables());
        // 分区的 colliders/walkables 由 ZoneManager 带 tag 注册/移除；regions 启动时已覆盖全部分区
        this.collisionManager.setRegions(this.zoneManager.getRegions());
        // 所有可进入房间（世界坐标，含门/掩体/刷怪点），后续玩法从这里取
        this.rooms = this.zoneManager.getRooms();
        // S 档内景：按距离流式加载 GLB（失败回退 B 档）
        // base：部署到子路径（如 GitHub Pages /forbidden-city-3d/）时，模型与 draco/basis 解码器都要带前缀；根路径部署时为 ''
        const base = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');
        this.interiors = new InteriorLoader(this.scene, this.collisionManager, { renderer: this.renderer, base });
      }],
      ['控制器', () => {
        this.controls = new FirstPersonControls(this.camera, document.body, this.collisionManager);
        const start = INITIAL_VIEW_POSITION;
        this.controls.setPosition(start.x, start.y, start.z);
        // 相机默认朝向 -Z（背对故宫），出生时转身面向北边的午门
        this.controls.lookAt(0, LAYOUT.WUMEN_Z);
        this.bindWelcomeOverlay();
      }],
      ['后期处理', () => {
        this.postProcessing = new PostProcessing(this.renderer, this.scene, this.camera);
        this.postProcessing.init(quality);
        this.currentQuality = quality;
      }],
      ['飞行净空', () => {
        this.flightEnvelope = createPalaceFlightEnvelope({palaceBuilder:this.palaceBuilder,
          enclosure:this.enclosure,garden:this.garden,zoneManager:this.zoneManager,layout:PALACE_LAYOUT});
      }],
      ['界面', () => {
        this.ambience = new Ambience();
        this.createUI();
        this.historicalLamps = new HistoricalSkyLamps({scene:this.scene,collisionManager:this.collisionManager,envelope:this.flightEnvelope,playerPosition:()=>this.camera.position,flightState:()=>this.flight?.state});
        this.dayNightPanel = new DayNightPanel(this.environment,this.historicalLamps);
        this.flight = new FlightTour({scene:this.scene,camera:this.camera,controls:this.controls,
          collisionManager:this.collisionManager,zoneManager:this.zoneManager,envelope:this.flightEnvelope,
          isPaused:()=>this.settingsTourSession?.paused === true,
          onModeChange:occupied=>{
            this.interiors.setSuspended(occupied);
            if(!occupied){this.controls.setMapOpen(this.minimap.visible);this.controls.setFreeMove(this.minimap.visible);}
            const welcome=document.getElementById('welcome-overlay');
            if(welcome)welcome.style.display=occupied||this.isMobile||this.minimap.visible||this.controls.isLocked()?'none':'flex';
          }});
        this.bindAudioStart();
        this.perfHUD = new PerfHUD(this.renderer, {
          zoneProvider: () => ({
            current: this.zoneManager?.getCurrentId() ?? '-',
            loaded: this.zoneManager?.getLoadedIds() ?? []
          })
        });
      }],
    ];
    
    steps.forEach(([name]) => this.loadingManager.itemStart(name));
    
    try {
      for (const [name, run] of steps) {
        await run();
        this.loadingManager.itemEnd(name);
        // 让出一帧，让浏览器把进度条刷新到屏幕上
        await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
        if (this.disposed) return;
      }
    } catch (err) {
      this.showLoadingError(err);
      throw err;
    }
    
    // 加载期间可能已经转过屏，进入渲染前按当前窗口尺寸校正一次
    this.onResize();
    
    // 开始动画循环
    this.animate();
    
    console.log('故宫 3D 初始化完成');
  }
  
  /**
   * 桌面端欢迎遮罩：加载完成后显示，点击锁定鼠标后隐藏，按 ESC 解锁后重新显示
   */
  bindWelcomeOverlay() {
    if (this.isMobile) return;
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) return;
    this._onLock = () => { overlay.style.display = 'none'; };
    this._onUnlock = () => { overlay.style.display = this.minimap?.visible || this.settingsMenu?.visible || this.flight?.occupied ? 'none' : 'flex'; };
    this.controls.controls.addEventListener('lock', this._onLock);
    this.controls.controls.addEventListener('unlock', this._onUnlock);
  }
  
  /**
   * 初始化出错时，在加载界面上直接显示错误，避免一直卡在进度条
   */
  showLoadingError(err) {
    const progressText = document.getElementById('progress-text');
    if (progressText) {
      progressText.style.color = '#ff6b6b';
      progressText.textContent = `加载失败：${err && err.message ? err.message : err}（详情见控制台）`;
    }
  }
  
  /**
   * 创建场景
   */
  createScene() {
    this.scene = new THREE.Scene();
  }
  
  /**
   * 创建相机
   */
  createCamera() {
    // 70° 视场更接近人眼观感；远裁剪面 2500 米：真实米制下宫城南北 961 m，从午门外要能看到神武门与天际线远景环
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      2500
    );
    const start = INITIAL_VIEW_POSITION;
    this.camera.position.set(start.x, start.y, start.z);
  }
  
  /**
   * 创建渲染器
   */
  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobile,
      powerPreference: 'high-performance',
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(this.getPixelRatio(this.isMobile ? 'low' : 'high'));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // 电影感色调映射：高光不过曝、红墙黄瓦饱和度自然
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.7; // 降低曝光，避免天空过亮
    
    // 画布必须放进 #scene-container 里：
    // 之前直接 append 到 body 末尾，而 #scene-container 已占满 100% 视口，
    // 画布被挤到可视区域下方（body overflow:hidden），所以加载完是一片黑屏
    const canvas = this.renderer.domElement;
    canvas.id = 'scene-canvas';
    const container = document.getElementById('scene-container') || document.body;
    container.appendChild(canvas);
  }
  
  /**
   * 创建 UI
   */
  createUI() {
    // 位置信息面板
    this.locationPanel = document.createElement('div');
    this.locationPanel.id = 'location-panel';
    this.locationPanel.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      padding: 15px 20px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border-radius: 8px;
      font-size: 16px;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(this.locationPanel);
    
    // Compact help is recoverable; it never takes ownership of movement.
    this.helpPanel = new HelpPanel({isMobile:this.isMobile,anchor:this.locationPanel});
    
    // 小地图（按 M 键显示/隐藏）
    // 移动端额外常驻右上角预览，点击展开全图
    this.teleport = new Teleport(this.controls, this.zoneManager, this.collisionManager);
    this._onTeleportKey = event => {
      if (event.defaultPrevented || event.repeat || hasShortcutModifier(event) || isTextEntryTarget(event.target)) return;
      const index = Number(event.key) - 1;
      if (/^[1-8]$/.test(event.key) && (!this.flight || this.flight.allowWalkingTeleport())) this.teleport.go(TELEPORT.POINTS[index].target);
    };
    window.addEventListener('keydown', this._onTeleportKey);
    this.mapTourSession = new MapTourSession({
      controls: this.controls,
      welcomeOverlay: document.getElementById('welcome-overlay'),
      getSettingsSession: () => this.settingsTourSession,
    });
    this.minimap = new Minimap({ worldBounds:FLIGHT_BOUNDS, items: this.zoneManager.getMapItems(), preview: this.isMobile, hasTeleportTarget: name => this.teleport.targets.has(name), onTeleport: name => { return !this.flight || this.flight.allowWalkingTeleport() ? this.teleport.go(name) : false; }, onToggle: visible => {
      this.settingsMenu?.setMapMode(visible, this.minimap.container);
      if(this.flight?.occupied){
        this.controls.setMapOpen(visible);
        this.settingsTourSession?.mapChanged(visible);
        if(visible)this.controls.unlock();
      }else this.mapTourSession.setVisible(visible);
    } });
    
    // 设置菜单（按 ESC 显示）
    this.settingsTourSession = new SettingsTourSession({
      controls: this.controls,
      isMobile: this.isMobile,
      minimap: this.minimap,
      welcomeOverlay: document.getElementById('welcome-overlay'),
    });
    this.settingsMenu = new SettingsMenu(document.body);
    this.settingsMenu.init({
      initialQuality: this.currentQuality,
      initialSound: true,
      onOpen: () => { this.flight?.clearInput(); this.settingsTourSession.open(); },
      onResume: () => {
        // Flight resumes only through its explicit operations click. Do not
        // request a competing pointer lock from the generic settings dialog.
        if(this.flight?.occupied)this.settingsTourSession.previousLocked=false;
        this.settingsTourSession.resume();
        if(this.flight?.occupied){
          this.flight.openOperations('settings');
          const welcome=document.getElementById('welcome-overlay');if(welcome)welcome.style.display='none';
        }
      },
      onQualityChange: (quality) => {
        this.toggleQuality(quality);
      },
      onSoundToggle: (enabled) => {
        if (!enabled) {
          this.ambience.setMuted(true);
        } else {
          this.ambience.start();
          this.ambience.setMuted(false);
        }
      },
    });
    
    // 绑定 ESC 键打开设置菜单
    this._onKeyDown = (event) => {
      if (event.code === 'Escape' && !event.repeat) {
        event.preventDefault();
        this.settingsMenu.toggle();
      }
    };
    window.addEventListener('keydown', this._onKeyDown);
  }

  /** 浏览器要求用户手势后才能启动音频：桌面锁定鼠标时、移动端首次触摸时启动 */
  bindAudioStart() {
    this._startAudio = () => this.ambience?.start();
    this.controls.controls.addEventListener('lock', this._startAudio);
    window.addEventListener('touchstart', this._startAudio, { passive: true });
    window.addEventListener('pointerdown', this._startAudio);
  }

  /** 是否位于某座门楼的门洞内（用于音效混响） */
  isInGatePassage(position) {
    return PALACE_LAYOUT.some(item => item.type === 'gate' &&
      Math.abs(position.x - item.position.x) < item.dimensions.width * 0.075 &&
      Math.abs(position.z - item.position.z) < item.dimensions.depth / 2);
  }
  
  /**
   * 切换画质
   */
  getPixelRatio(quality) {
    const cap = quality === 'low' ? 1 : (this.isMobile ? PERFORMANCE.MOBILE_MAX_PIXEL_RATIO : 2);
    return Math.min(window.devicePixelRatio || 1, cap);
  }

  toggleQuality(quality = this.currentQuality === 'high' ? 'low' : 'high') {
    // The menu supplies the chosen value. Do not invert it a second time.
    // No-argument calls still toggle for keyboard/testing callers.
    if (quality !== 'high' && quality !== 'low') throw new Error(`Unsupported quality: ${quality}`);
    this.currentQuality = quality;
    
    // 更新渲染设置
    this.renderer.setPixelRatio(this.getPixelRatio(this.currentQuality));
    this.postProcessing.setQuality(this.currentQuality);
    this.environment.setQuality(this.currentQuality === 'high');
    this.shadowSetup.setQuality(this.currentQuality);
    this.lastShadowUpdate = 0;
    if (this.settingsMenu) {
      this.settingsMenu.currentQuality = this.currentQuality;
      this.settingsMenu.updateQualityButton();
    }
  }
  
  /**
   * 更新位置信息
   */
  updateLocationInfo() {
    const position = this.flight?.occupied ? this.flight.position : this.controls.getPosition();
    const location = this.collisionManager.getCurrentLocation(position);
    const zone = ZONES.find(item => item.id === this.zoneManager.getCurrentId())?.name ?? '宫城';
    const label = this.flight?.occupied ? `虚拟飞行 · ${Math.round(position.y)}m · ${zone}` : `${zone} › ${location}`;
    if (label === this.lastLocation) return;
    this.lastLocation = label;
    this.locationPanel.replaceChildren();
    const heading = document.createElement('strong');
    heading.textContent = '当前位置';
    this.locationPanel.append(heading, document.createElement('br'), document.createTextNode(label));
    const fidelity = !this.flight?.occupied && modelFidelityFor(location);
    if (fidelity) {
      const status = document.createElement('small');status.className = 'model-status';
      status.textContent = fidelity.short;this.locationPanel.appendChild(status);
    }
    this.helpPanel?.placeBelow(this.locationPanel);
  }
  
  /**
   * 显示加载界面
   */
  showLoading() {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.style.display = 'flex';
    }
  }
  
  /**
   * 更新加载进度
   */
  updateLoadingProgress(progress, stepName = '') {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    if (progressText) {
      const suffix = stepName ? (stepName.includes('/') ? `（${stepName}）` : `（${stepName}已完成）`) : '';
      progressText.textContent = `加载中... ${Math.round(progress)}%${suffix}`;
    }
  }
  
  /**
   * 加载完成
   */
  onLoadComplete() {
    this.loadingTimeout = setTimeout(() => {
      if (this.disposed) return;
      const loading = document.getElementById('loading-screen');
      if (loading) {
        loading.style.display = 'none';
      }
      
      // 移动端自动开始，桌面端显示欢迎遮罩，点击后锁定鼠标开始游览
      if (this.isMobile) {
        console.log('移动端自动开始');
      } else {
        const overlay = document.getElementById('welcome-overlay');
        if (overlay && !this.controls.controls.isLocked && !this.minimap?.visible && !this.settingsMenu?.visible) {
          overlay.style.display = 'flex';
        }
        console.log('点击屏幕开始游览');
      }
    }, 500);
  }
  
  /**
   * 窗口大小调整
   */
  getViewportSize() {
    // 以布局视口为准；部分安卓 WebView 转屏后 innerWidth 更新滞后，取 documentElement 兜底
    const width = Math.max(1, Math.round(window.innerWidth || document.documentElement.clientWidth));
    const height = Math.max(1, Math.round(window.innerHeight || document.documentElement.clientHeight));
    return { width, height };
  }
  
  onResize() {
    if (this.disposed || !this.camera || !this.renderer) return;
    const { width, height } = this.getViewportSize();
    this._lastSize = `${width}x${height}`;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setPixelRatio(this.getPixelRatio(this.currentQuality));
    this.renderer.setSize(width, height);
    this.postProcessing?.onResize(width, height);
  }
  
  /**
   * 动画循环
   */
  animate() {
    if (this.disposed) return;
    this.animationFrame = requestAnimationFrame(this._animate);
    
    const now = performance.now();
    const dt = Math.min((now - (this.lastFrameTime ?? now)) / 1000, 0.1);
    this.lastFrameTime = now;
    
    // 兜底：任何原因漏掉 resize 事件（微信/iOS 转屏）时，发现尺寸变了就立即校正
    const { width, height } = this.getViewportSize();
    if (this._lastSize !== `${width}x${height}`) this.onResize();

    // 更新控制器（含走路镜头起伏；motion = { speed, sprint, footstep }）
    if (this.flight?.occupied) this.controls.prevTime = now;
    else if (this.settingsTourSession) this.settingsTourSession.updateControls();
    else this.controls.update();
    this.flight?.update(dt, now);
    const motion = this.controls.motion ?? { speed: 0, sprint: false, footstep: false };
    
    // 更新位置信息
    this.updateLocationInfo();
    
    this.environment.update(this.camera, dt);
    this.dayNightPanel?.update();
    this.historicalLamps?.update(this.environment.dayCycle.lighting.daylight);
    this.palaceBuilder.update?.(dt);
    this.enclosure.update(dt);
    this.garden.update(dt);
    this.interiors?.update(this.camera.position);
    this.zoneManager.update(this.flight?.occupied ? this.flight.position : this.camera.position);
    this.ambience.update({
      dt,
      speed: motion.speed,
      sprint: motion.sprint,
      footstep: motion.footstep,
      inTunnel: this.isInGatePassage(this.camera.position),
    });
    this.minimap?.update(this.camera, this.flight?.getMapMarker());
    if (now - this.lastShadowUpdate >= 250) {
      const distance = this.currentQuality === 'high' ? PERFORMANCE.LOD_DISTANCE_LOW : PERFORMANCE.LOD_DISTANCE_HIGH;
      this.shadowSetup.updateShadowLOD(this.camera, this.shadowObjects, distance);
      this.lastShadowUpdate = now;
    }
    this.postProcessing.render();
    this.perfHUD?.update(now);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.animationFrame);
    this.flight?.dispose();
    this.dayNightPanel?.dispose();
    this.historicalLamps?.dispose();
    clearTimeout(this.loadingTimeout);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onOrientationChange);
    window.visualViewport?.removeEventListener('resize', this._onResize);
    clearTimeout(this._resizeTimer1);
    clearTimeout(this._resizeTimer2);
    window.removeEventListener('touchstart', this._startAudio);
    window.removeEventListener('pointerdown', this._startAudio);
    if (this.controls) {
      this.controls.controls.removeEventListener('lock', this._onLock);
      this.controls.controls.removeEventListener('unlock', this._onUnlock);
      this.controls.controls.removeEventListener('lock', this._startAudio);
      this.controls.dispose();
    }
    this.ambience?.dispose();
    this.perfHUD?.dispose();
    this.minimap?.dispose();
    this.teleport?.dispose();
    window.removeEventListener('keydown', this._onTeleportKey);
    this.postProcessing?.dispose();
    this.palaceBuilder?.dispose();
    this.enclosure?.dispose();
    this.garden?.dispose();
    this.interiors?.dispose();
    this.zoneManager?.dispose();
    this.environment?.dispose();
    // 贴图库拥有共享材质与贴图，必须在所有使用方移除后最后释放
    this.library?.dispose();
    this.collisionManager?.clear();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.helpPanel?.dispose();
    document.getElementById('location-panel')?.remove();
    this.settingsMenu?.dispose();
    this.minimap?.dispose();
    this.teleport?.dispose();
    window.removeEventListener('keydown', this._onTeleportKey);
    if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown);
    this.shadowObjects.length = 0;
  }
}

// 本地开发暴露实例用于回归测试；生产页面不增加调试入口。
const app = new ForbiddenCityApp();
if (import.meta.env?.DEV) window.__forbiddenCityApp = app;
// 性能读数只读钩子（tests/perf.cjs 使用）：返回最近一个完整帧的快照副本
if (import.meta.env?.DEV) window.__perf = () => app.perfHUD?.snapshot() ?? null;
app.init().catch(error => console.error('故宫 3D 初始化失败', error));
if (import.meta.hot) import.meta.hot.dispose(() => app.dispose());
