import * as THREE from 'three';
import { attachTourTool, detachTourTool } from '../../ui/TourTools.js';
import { PLAYER, LAYOUT } from '../../config/constants.js';
import { hasShortcutModifier, isTextEntryTarget } from '../../controls/InputTargets.js';
import { createHelicopterModel } from './HelicopterModel.js';
import { FlightState, LANDING_CHOICES } from './FlightState.js';

const TAG='virtual-tour-helicopter';
const VIEWS=['pilot','follow','overhead'];
const LABELS={pilot:'驾驶员',follow:'跟随',overhead:'俯瞰'};
const MOTION_KEYS=new Set(['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyQ','KeyE','Space','KeyC']);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
/** Owns only the virtual vehicle/input/camera while boarded. Walking physics,
 * architectural collision, global camera FOV, and map projection stay intact. */
export class FlightTour {
  constructor({scene,camera,controls,collisionManager,zoneManager,envelope,isPaused=()=>false,onModeChange=()=>{}}){
    Object.assign(this,{scene,camera,controls,cm:collisionManager,zoneManager,envelope,isPaused,onModeChange});
    this.state=new FlightState(envelope);this.model=createHelicopterModel();this.scene.add(this.model.group);
    this.keys=new Set();this.pointers=new Map();this.view='follow';this.lookYaw=0;this.lookPitch=0;this.active=true;this.disposed=false;
    this.operationsOpen=false;this.resumePending=false;this.hasFlown=false;this.walkingControlNeeded=false;this.walkingHandoff=false;this.flightUnlockPending=false;this.walkingControlAttempt=0;this.resumeLockAttempt=0;
    this.listeners=[];this.lastUI=-Infinity;this.landings=LANDING_CHOICES.filter(p=>envelope.safeGround(p.x,p.z,this.state.rules.radius));
    if(this.model.bounds.horizontalRadius>this.state.rules.radius)throw Error('Aircraft exceeds collision envelope');
    this.buildUI();this.bindInputs();this.syncModel();this.registerParkedCollision();this.updateUI();
  }
  get occupied(){return this.state.occupied;}
  get position(){return this.state.position;}
  listen(target,type,fn,options){target.addEventListener(type,fn,options);this.listeners.push(()=>target.removeEventListener(type,fn,options));}
  showStatus(text){this.state.status=text;this.status.textContent=text;}
  canBoard(){const p=this.controls.camera.position,s=this.position;return !this.occupied&&this.state.grounded&&Math.hypot(p.x-s.x,p.z-s.z)<8&&Math.abs((p.y-PLAYER.HEIGHT)-s.y)<.7;}
  clearInput(){this.keys.clear();this.pointers.clear();this.lookPointer=null;}
  canExit(){return this.occupied&&this.state.grounded&&this.state.speed<=.1;}
  focusOperations(){(this.canExit()?this.boardButton:this.resumeButton)?.focus();}
  openOperations(reason='escape'){
    if(!this.occupied||this.isPaused())return false;
    const wasOpen=this.operationsOpen;
    if(wasOpen){this.clearInput();if(!this.panel.contains(document.activeElement))this.focusOperations();return true;}
    clearTimeout(this.resumeTimer);this.operationsOpen=true;this.resumePending=false;this.operationsReason=reason;
    this.clearInput();this.controls.stop();this.controls.jumpQueued=false;
    // Arcade pause freezes instantly; speed is the previous frame's delta,
    // not inertia. A grounded aircraft is now stationary even on contact frame.
    if(this.state.grounded)this.state.speed=0;
    this.pauseMessage=reason==='landed'?'已安全停稳，可点击“下飞机”步行游览。':'飞行已暂停，机体保持当前位置；选好操作后点击“返回游戏”。';
    this.updateUI(true);
    // Native Escape may emit only pointerlockchange. Never rely on the stale
    // PointerLockControls.isLocked flag inside its lock/unlock dispatch.
    if(!wasOpen&&document.pointerLockElement===this.controls.domElement){this.flightUnlockPending=true;this.controls.unlock();}
    if(!wasOpen)this.focusOperations();
    return true;
  }
  releaseControlFocus(){
    const active=globalThis.document?.activeElement;
    if(this.panel?.contains(active)||this.boardingPrompt?.contains(active)||active===this.walkingResumeButton)active?.blur?.();
  }
  closeOperations(){
    clearTimeout(this.resumeTimer);this.resumeLockAttempt++;this.operationsOpen=false;this.resumePending=false;
    this.clearInput();this.controls.stop();this.controls.jumpQueued=false;
    this.controls.prevTime=performance.now();this.releaseControlFocus();this.updateUI(true);
  }
  resumeOperations(){
    if(!this.occupied||!this.operationsOpen||this.isPaused()||this.resumePending)return false;
    this.clearInput();this.controls.stop();this.controls.jumpQueued=false;
    // A map remains a non-modal navigation aid. Only this operations panel
    // owns a pause; map-open flight and touch flight do not need pointer lock.
    if(this.controls.isMobile||this.controls.mapOpen){this.closeOperations();return true;}
    this.resumePending=true;this.pauseMessage='正在恢复鼠标控制；若浏览器未响应，请再次点击“返回游戏”。';this.updateUI();
    const attempt=++this.resumeLockAttempt;
    const failed=()=>{if(!this.disposed&&attempt===this.resumeLockAttempt)this.onPointerLockError();};
    this.resumeTimer=setTimeout(failed,3000);
    try{this.controls.lock()?.catch?.(failed);}catch{failed();}
    return true;
  }
  // Called only by an explicit dismount/retry, never by entering proximity.
  // The state is already walking even when a browser refuses or delays lock.
  requestWalkingControl(){
    if(this.disposed||this.occupied||this.controls.isMobile||this.controls.mapOpen||this.isPaused()||!this.controls.domElement)return false;
    if(document.pointerLockElement===this.controls.domElement){this.walkingControlNeeded=false;if(!this.flightUnlockPending)this.walkingHandoff=false;this.updateUI();return true;}
    const attempt=++this.walkingControlAttempt;
    this.walkingControlNeeded=true;this.updateUI();
    const failed=()=>{
      if(this.disposed||this.occupied||attempt!==this.walkingControlAttempt)return;
      this.walkingControlNeeded=document.pointerLockElement!==this.controls.domElement;this.updateUI();
    };
    try{this.controls.lock()?.catch?.(failed);}catch{failed();}
    return true;
  }
  onPointerLockError(){
    if(!this.occupied||!this.operationsOpen)return;
    clearTimeout(this.resumeTimer);this.resumePending=false;this.pauseMessage='鼠标控制未恢复，飞行仍暂停。请点击“返回游戏”重试。';this.updateUI();
  }
  board(){
    if(this.isPaused()||!this.canBoard()){this.showStatus('请步行靠近午门外或停靠处的直升机');return false;}
    if(!this.state.board())return false;
    this.walkingControlNeeded=false;this.walkingHandoff=false;this.walkingControlAttempt++;this.resumeLockAttempt++;this.releaseControlFocus();
    this.savedLookLocked=this.controls.lookLocked;this.savedHeadBob=this.controls.headBobEnabled;
    this.controls.stop();this.controls.headBobEnabled=false;this.controls.lookLocked=true;
    this.cm.removeByTag(TAG);this.clearInput();this.lookYaw=0;this.lookPitch=0;this.hasFlown=false;this.operationsOpen=false;this.resumePending=false;
    this.walkingUI=[this.controls.joystick?.base,this.controls.lookLockButton,this.controls.jumpButton,document.getElementById('help-panel')].filter(Boolean).map(el=>[el,el.style.display]);
    this.walkingUI.forEach(([el])=>el.style.display='none');
    this.onModeChange(true);this.updateCamera();this.updateUI(true);return true;
  }
  exit(){
    if(this.isPaused()||!this.canExit()){this.showStatus('请先在净空足够的地面停稳再下机');return false;}
    this.zoneManager.ensureLoadedAt(this.position.x,this.position.z);
    const y=this.state.yaw,c=Math.cos(y),s=Math.sin(y),b=LAYOUT.BOUNDARY;
    const parked=this.parkedBoxes();
    let exit=null;
    const exits=[...this.model.exitOffsets,...this.model.exitOffsets.map(p=>new THREE.Vector3(p.x*2,0,p.z))];
    for(const local of exits){
      const x=this.position.x+local.x*c+local.z*s,z=this.position.z-local.x*s+local.z*c;
      if(x<b.minX+.6||x>b.maxX-.6||z<b.minZ+.6||z>b.maxZ-.6)continue;
      const feet=this.cm.getGroundHeight(x,z,0,PLAYER.STEP_UP),eye=new THREE.Vector3(x,feet+PLAYER.HEIGHT,z);
      const body=new THREE.Box3(new THREE.Vector3(x-.5,feet+.35,z-.5),new THREE.Vector3(x+.5,eye.y-.05,z+.5));
      if(feet===0&&!parked.some(box=>box.intersectsBox(body))&&!this.cm.checkCollision(eye,.5)&&this.envelope.safeGround(x,z,.5)){exit=eye;break;}
    }
    if(!exit){this.showStatus('两侧下机处受阻，请换一处开阔地');return false;}
    if(!this.state.exit(performance.now()))return false;
    clearTimeout(this.resumeTimer);this.resumeLockAttempt++;this.operationsOpen=false;this.resumePending=false;this.hasFlown=false;
    this.clearInput();this.controls.stop();this.controls.jumpQueued=false;this.controls.lookLocked=this.savedLookLocked;this.controls.headBobEnabled=this.savedHeadBob;
    this.camera.up.set(0,1,0);
    this.controls.setPosition(exit.x,exit.y,exit.z);this.controls.lookAt(this.position.x,this.position.z);
    this.controls.prevTime=performance.now();
    this.walkingUI?.forEach(([el,display])=>el.style.display=display);
    // Only an already-requested, not-yet-delivered flight unlock belongs to
    // this handoff. Future ordinary walking Esc/map unlocks remain ordinary.
    this.walkingHandoff=this.flightUnlockPending;
    this.releaseControlFocus();this.registerParkedCollision();this.onModeChange(false);this.updateUI(true);
    this.requestWalkingControl();return true;
  }
  toggleBoard(){
    if(this.occupied)return this.exit();
    if(!this.board())return false;
    // A click/H while unlocked is also a user gesture. Keep flight paused until
    // its real lock succeeds; touch and map-open flight need no pointer lock.
    if(!this.controls.isMobile&&!this.controls.mapOpen&&document.pointerLockElement!==this.controls.domElement){this.openOperations('boarding');this.resumeOperations();}
    return true;
  }
  setView(view){if(!VIEWS.includes(view))return false;this.view=view;this.lookYaw=0;this.lookPitch=0;this.updateUI(true);return true;}
  requestLanding(){const point=this.landings.find(p=>p.id===this.landingSelect.value);if(!this.state.landAt(point))this.showStatus('该停靠点当前无法确认净空');this.clearInput();}
  allowWalkingTeleport(){if(!this.occupied)return true;this.showStatus('飞行中请先降落下机，再使用地点传送');return false;}
  registerParkedCollision(){
    this.cm.removeByTag(TAG);if(this.occupied)return;
    for(const box of this.parkedBoxes())this.cm.addCollider(box,TAG);
  }
  parkedBoxes(){
    const matrix=new THREE.Matrix4().makeRotationY(this.state.yaw);matrix.setPosition(this.position.x,this.position.y,this.position.z);
    // Parked cabin/skids/tail are real pedestrian obstacles; the rotor disk is
    // above walking head height, not a fake wall blocking approach to the door.
    const boxes=[[-1.3,.4,-2.1,1.3,2.8,2.25],[-.45,1.1,-5.6,.45,2.4,-2.1]];
    return boxes.map(a=>new THREE.Box3(new THREE.Vector3(...a.slice(0,3)),new THREE.Vector3(...a.slice(3))).applyMatrix4(matrix));
  }
  bindInputs(){
    this.listen(window,'keydown',e=>{
      if(this.operationsOpen&&!this.isPaused()&&e.code==='Tab'){
        const items=[...this.panel.querySelectorAll('button, select')].filter(el=>!el.disabled&&!el.hidden);
        const i=items.indexOf(document.activeElement),next=e.shiftKey?(i<=0?items.length-1:i-1):(i+1)%items.length;
        if(items.length){e.preventDefault();e.stopImmediatePropagation();items[next].focus();}return;
      }
      if(e.code==='Escape'&&this.occupied&&!this.isPaused()){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)this.openOperations();return;}
      if(e.repeat&&['KeyH','KeyF','KeyV','KeyL','KeyT'].includes(e.code))return;
      if(hasShortcutModifier(e)||isTextEntryTarget(e.target)||this.isPaused())return;
      if(e.code==='KeyH'&&(this.occupied||this.canBoard())){e.preventDefault();e.stopImmediatePropagation();this.toggleBoard();return;}
      if(!this.occupied)return;
      if(e.code==='Space'&&e.target?.closest?.('button, a, summary, [role="button"]'))return;
      if(this.operationsOpen&&MOTION_KEYS.has(e.code)){e.preventDefault();e.stopImmediatePropagation();return;}
      if(MOTION_KEYS.has(e.code)){if(e.repeat&&!this.keys.has(e.code))return;e.preventDefault();e.stopImmediatePropagation();this.keys.add(e.code);this.state.takeOver();return;}
      const action={KeyF:()=>this.state.startTour(),KeyV:()=>this.setView(VIEWS[(VIEWS.indexOf(this.view)+1)%VIEWS.length]),KeyT:()=>this.state.hover(),KeyL:()=>this.requestLanding()}[e.code];
      if(action){e.preventDefault();e.stopImmediatePropagation();this.clearInput();action();}
    },true);
    this.listen(window,'keyup',e=>{const owned=this.keys.delete(e.code);if(this.occupied&&owned&&MOTION_KEYS.has(e.code)){e.preventDefault();e.stopImmediatePropagation();}},true);
    this.listen(document,'pointerlockchange',()=>{
      if(this.controls.isMobile)return;
      const locked=document.pointerLockElement===this.controls.domElement;
      if(!locked)this.flightUnlockPending=false;
      if(!this.occupied){
        // A delayed flight/exit lock may arrive after the map or settings took
        // ownership. Never recapture the pointer over either interface.
        if(locked&&(this.controls.mapOpen||this.isPaused())){this.controls.unlock();return;}
        if(locked){this.walkingControlNeeded=false;if(!this.flightUnlockPending)this.walkingHandoff=false;this.releaseControlFocus();}
        else if(this.walkingHandoff){this.walkingControlNeeded=true;this.walkingHandoff=false;}
        this.updateUI();return;
      }
      if(locked){
        if(this.isPaused()){clearTimeout(this.resumeTimer);this.resumePending=false;this.controls.unlock();return;}
        if(this.operationsOpen&&this.resumePending)this.closeOperations();
        if(this.operationsOpen||this.controls.mapOpen)this.controls.unlock();
      }else if(!this.controls.mapOpen&&!this.isPaused())this.openOperations();
    });
    this.listen(document,'focusin',e=>{if(isTextEntryTarget(e.target))this.clearInput();if(this.operationsOpen&&!this.isPaused()&&!this.panel.contains(e.target))this.focusOperations();});
    this.listen(document,'pointerlockerror',()=>this.onPointerLockError());
    this.listen(window,'blur',()=>{this.active=false;this.clearInput();});
    this.listen(window,'focus',()=>{this.active=true;this.clearInput();});
    this.listen(document,'visibilitychange',()=>{this.active=!document.hidden;this.clearInput();});
    this.listen(document,'mousemove',e=>{
      if(!this.occupied||!this.controls.controls.isLocked||this.isPaused()||this.operationsOpen)return;
      e.stopImmediatePropagation();this.lookYaw-=e.movementX*.002;this.lookPitch=clamp(this.lookPitch-e.movementY*.002,-1.15,1.15);
    },true);
    this.listen(document,'pointerdown',e=>{
      if(!this.occupied||e.pointerType!=='touch'||this.isPaused()||this.operationsOpen||e.target.tagName!=='CANVAS'||e.target.closest('#minimap, #minimap-preview'))return;
      this.lookPointer={id:e.pointerId,x:e.clientX,y:e.clientY};e.target.setPointerCapture?.(e.pointerId);
    });
    this.listen(document,'pointermove',e=>{
      const p=this.lookPointer;if(!this.occupied||!p||p.id!==e.pointerId)return;
      this.lookYaw-=(e.clientX-p.x)*.004;this.lookPitch=clamp(this.lookPitch-(e.clientY-p.y)*.004,-1.15,1.15);p.x=e.clientX;p.y=e.clientY;
    });
    for(const event of['pointerup','pointercancel','lostpointercapture'])this.listen(document,event,e=>{this.pointers.delete(e.pointerId);if(this.lookPointer?.id===e.pointerId)this.lookPointer=null;});
  }
  axes(){
    const k=this.keys,pressed=(...codes)=>codes.some(code=>k.has(code));
    const a={forward:Number(pressed('KeyW','ArrowUp'))-Number(pressed('KeyS','ArrowDown')),right:Number(pressed('KeyD','ArrowRight'))-Number(pressed('KeyA','ArrowLeft')),vertical:Number(k.has('Space'))-Number(k.has('KeyC')),yaw:Number(k.has('KeyQ'))-Number(k.has('KeyE'))};
    for(const {axis,value}of this.pointers.values())a[axis]=clamp(a[axis]+value,-1,1);return a;
  }
  update(dt,now){
    if(this.disposed)return;
    const paused=this.isPaused()||!this.active||this.operationsOpen;
    if(paused)this.clearInput();
    const p=this.controls.camera.position,home=this.state.home;
    const canRecycle=Math.hypot(p.x-home.x,p.z-home.z)>8;
    if(this.occupied&&!this.state.grounded)this.hasFlown=true;
    const event=this.occupied&&paused?null:this.state.update(paused?0:dt,now,paused?{}:this.axes(),canRecycle);
    if(this.occupied&&!paused&&this.hasFlown&&this.canExit()){
      this.hasFlown=false;this.openOperations('landed');
    }
    if(event==='recycled')this.registerParkedCollision();
    this.syncModel();this.model.update(paused?0:dt,this.state.rpm);
    if(this.occupied){this.controls.prevTime=now;Object.assign(this.controls.motion,{speed:0,sprint:false,footstep:false});this.updateCamera();}
    if(now-this.lastUI>150){this.lastUI=now;this.updateUI();}
  }
  syncModel(){this.model.group.position.set(this.position.x,this.position.y,this.position.z);this.model.group.rotation.y=this.state.yaw;}
  updateCamera(){
    const p=this.position,y=this.state.yaw,angle=y+this.lookYaw;
    this.camera.up.set(0,1,0);
    if(this.view==='pilot'){
      const anchor=this.model.cockpitAnchor.clone().applyAxisAngle(new THREE.Vector3(0,1,0),y);
      this.camera.position.set(p.x+anchor.x,p.y+anchor.y,p.z+anchor.z);
      const c=Math.cos(this.lookPitch);this.camera.lookAt(this.camera.position.x+Math.sin(angle)*c,this.camera.position.y+Math.sin(this.lookPitch),this.camera.position.z+Math.cos(angle)*c);
    }else if(this.view==='overhead'){
      this.camera.position.set(p.x,p.y+38,p.z);this.camera.up.set(0,0,1);this.camera.lookAt(p.x,p.y,p.z);
    }else{
      const elevation=clamp(.4-this.lookPitch,.12,1.2),d=17*Math.cos(elevation),dy=17*Math.sin(elevation);
      const b=this.envelope.bounds;
      const x=clamp(p.x-Math.sin(angle)*d,b.minX+.31,b.maxX-.31),z=clamp(p.z-Math.cos(angle)*d,b.minZ+.31,b.maxZ-.31);
      const minY=this.envelope.minimumY(x,z,.3)+1;
      this.camera.position.set(x,Math.max(p.y+dy+1.8,minY),z);this.camera.lookAt(p.x,p.y+1.8,p.z);
    }
  }
  buildUI(){
    this.style=document.createElement('style');this.style.textContent=`
      #flight-operations-backdrop{position:fixed;inset:0;background:#07131b66;z-index:9001;pointer-events:auto}
      #flight-operations-backdrop[hidden]{display:none}
      body.flight-operations-open #tour-tools{z-index:9002!important;visibility:visible!important;top:50%!important;left:50%;right:auto!important;transform:translate(-50%,-50%);max-height:calc(100dvh - 32px)!important;max-width:min(440px,calc(100vw - 28px));pointer-events:auto}
      body.flight-operations-open #tour-tools> :not(#flight-panel){display:none}
      body.flight-operations-open #flight-panel{max-width:420px;padding:16px;background:#152932}
      body.flight-operations-open #flight-panel summary{pointer-events:none;font-size:17px}
      #flight-panel[hidden],#flight-boarding[hidden],#flight-walking-resume[hidden],#flight-panel [hidden]{display:none!important}
      #flight-boarding{color:#fff7df;background:#17242be8;border:1px solid #9eacac88;border-radius:10px;padding:8px;font:13px/1.45 system-ui}
      #flight-boarding button,#flight-walking-resume{min-height:44px;padding:8px 12px;border:1px solid #d5c28e;border-radius:8px;background:#263d43;color:#fff7df;font:inherit;cursor:pointer}
      #flight-boarding button:focus-visible,#flight-walking-resume:focus-visible{outline:3px solid #ffd572}
      #flight-walking-resume{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9001;max-width:calc(100vw - 32px);font:14px/1.5 system-ui}
      #flight-pause-notice{border-left:3px solid #ffd572;padding:8px;background:#ffd57214}
      #flight-panel [data-action=resume]{background:#85651d;border-color:#f6cf6b;font-weight:bold;min-height:44px}
      body.flight-tour-active::before{display:none!important}
      @media(max-width:600px) and (orientation:portrait){body.flight-tour-active>#structural-preview-button{bottom:calc(116px + env(safe-area-inset-bottom,0px))}}
      #flight-panel{position:relative;flex-shrink:0;color:#fff7df;font:13px/1.45 system-ui;max-width:min(310px,calc(100vw - 28px));background:#17242be8;border:1px solid #9eacac88;border-radius:12px;padding:10px;box-shadow:0 3px 14px #0005}
      #flight-panel summary{cursor:pointer;min-height:32px;display:flex;align-items:center;gap:8px}#flight-panel button,#flight-panel select{font:inherit;min-height:38px;border:1px solid #83938b;border-radius:6px;background:#263d43;color:#fff;padding:5px 8px}#flight-panel button:focus-visible,#flight-panel select:focus-visible{outline:3px solid #ffd572}#flight-panel button:disabled{opacity:.5}#flight-panel .flight-row{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0}#flight-panel p{margin:6px 0}#flight-status{max-width:280px}#flight-panel .flight-note{color:#ced6d5;font-size:11px}#flight-panel select{max-width:100%}
      #flight-touch{position:fixed;bottom:calc(12px + env(safe-area-inset-bottom));left:12px;right:12px;display:flex;justify-content:space-between;pointer-events:none;z-index:1300}#flight-touch[hidden]{display:none}#flight-touch .flight-pad{display:grid;grid-template-columns:repeat(3,48px);gap:4px;pointer-events:auto}#flight-touch button{width:48px;height:48px;touch-action:none;border:1px solid #fff7;background:#173c48dc;color:white;border-radius:10px;font-size:18px;user-select:none}#flight-touch button:active{background:#a48138}
      @media(max-height:600px){#flight-panel{padding:6px;max-width:280px}#flight-panel summary{min-height:25px}#flight-panel button,#flight-panel select{min-height:32px}#flight-touch button{height:42px;width:44px}#flight-touch .flight-pad{grid-template-columns:repeat(3,44px)}}
    `;document.head.appendChild(this.style);
    this.panel=document.createElement('details');this.panel.id='flight-panel';this.panel.hidden=true;
    this.panel.innerHTML=`<summary>直升机游览 <span id="flight-altitude">地面</span></summary><p id="flight-pause-notice" role="status" hidden></p><div class="flight-row"><button type="button" data-action="resume" hidden>返回游戏 / 继续飞行</button></div><p id="flight-status" role="status">午门外待登机</p><div class="flight-row"><button type="button" data-action="board">靠近后登机 H</button><button type="button" data-action="tour">自动观光 F</button><button type="button" data-action="hover">手动/悬停 T</button></div><div class="flight-row"><label>视角 <select id="flight-view"><option value="pilot">驾驶员</option><option value="follow" selected>跟随</option><option value="overhead">俯瞰</option></select></label><label>停靠 <select id="flight-landing"></select></label><button type="button" data-action="land">飞往并降落 L</button></div><p>WASD/方向键平移 · Q/E转向 · 空格升高/C降低 · 鼠标环顾 · V切视角。方向/升降可随时接管自动航线。Esc 暂停并显示可点击的操作；落地后点击“下飞机”或按 H。</p><p class="flight-note">虚拟游览载具与游戏停靠点，不代表现实飞行或降落许可。机体与屋顶保守避碰；手动可在净空足够的平地起降。</p>`;
    attachTourTool(this.panel);this.pauseNotice=this.panel.querySelector('#flight-pause-notice');this.resumeButton=this.panel.querySelector('[data-action="resume"]');this.status=this.panel.querySelector('#flight-status');this.altitude=this.panel.querySelector('#flight-altitude');this.boardButton=this.panel.querySelector('[data-action="board"]');this.landingSelect=this.panel.querySelector('#flight-landing');this.viewSelect=this.panel.querySelector('#flight-view');
    for(const p of this.landings){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;this.landingSelect.appendChild(o);}
    const handlers={resume:()=>this.resumeOperations(),board:()=>this.toggleBoard(),tour:()=>{this.clearInput();this.state.startTour();},hover:()=>{this.clearInput();this.state.hover();},land:()=>this.requestLanding()};
    for(const b of this.panel.querySelectorAll('[data-action]'))this.listen(b,'click',e=>{if(!this.isPaused())handlers[b.dataset.action]();if(e.detail>0&&b!==this.resumeButton)b.blur();});
    this.listen(this.panel,'toggle',()=>{if(this.operationsOpen&&!this.panel.open)this.panel.open=true;});
    this.boardingPrompt=document.createElement('div');this.boardingPrompt.id='flight-boarding';this.boardingPrompt.hidden=true;
    this.boardingButton=document.createElement('button');this.boardingButton.type='button';
    this.boardingButton.textContent=this.controls.isMobile?'登上直升机':'按 H 登机 / 点击登机';
    this.boardingPrompt.appendChild(this.boardingButton);attachTourTool(this.boardingPrompt);
    this.listen(this.boardingButton,'click',()=>{if(!this.occupied&&!this.isPaused())this.toggleBoard();});
    this.walkingResumeButton=document.createElement('button');this.walkingResumeButton.type='button';this.walkingResumeButton.id='flight-walking-resume';this.walkingResumeButton.hidden=true;
    this.walkingResumeButton.textContent='已下机，点击恢复步行和鼠标视角';document.body.appendChild(this.walkingResumeButton);
    for(const type of ['pointerdown','touchstart'])this.listen(this.walkingResumeButton,type,e=>e.stopPropagation());
    this.listen(this.walkingResumeButton,'click',e=>{e.stopPropagation();this.releaseControlFocus();this.requestWalkingControl();});
    this.operationsBackdrop=document.createElement('div');this.operationsBackdrop.id='flight-operations-backdrop';this.operationsBackdrop.hidden=true;
    for(const type of ['click','pointerdown','touchstart'])this.listen(this.operationsBackdrop,type,e=>e.stopPropagation());
    document.body.appendChild(this.operationsBackdrop);
    this.listen(this.viewSelect,'change',()=>this.setView(this.viewSelect.value));
    this.touch=document.createElement('div');this.touch.id='flight-touch';this.touch.hidden=true;
    this.touch.innerHTML='<div class="flight-pad"></div><div class="flight-pad"></div>';
    const pads=this.touch.children;
    const specs=[['↶','yaw',1,0],['↑','forward',1,0],['↷','yaw',-1,0],['←','right',-1,0],['↓','forward',-1,0],['→','right',1,0],['升','vertical',1,1],['停','hover',0,1],['降','vertical',-1,1]];
    for(const[label,axis,value,pad]of specs){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',`飞行${{forward:value>0?'前进':'后退',right:value>0?'右移':'左移',yaw:value>0?'左转':'右转',vertical:value>0?'升高':'降低',hover:'悬停'}[axis]}`);pads[pad].appendChild(b);
      this.listen(b,'pointerdown',e=>{if(!this.occupied||this.isPaused()||this.operationsOpen)return;e.preventDefault();b.setPointerCapture?.(e.pointerId);this.state.takeOver();if(axis==='hover')this.clearInput();else this.pointers.set(e.pointerId,{axis,value});});
      for(const event of['pointerup','pointercancel','lostpointercapture'])this.listen(b,event,e=>this.pointers.delete(e.pointerId));
    }
    document.body.appendChild(this.touch);
  }
  updateUI(force=false){
    document.body.classList.toggle('flight-tour-active',this.occupied);
    this.panel.hidden=!this.occupied;this.panel.inert=!this.occupied;
    if(this.boardingPrompt){
      this.boardingPrompt.hidden=this.occupied||this.isPaused()||!this.canBoard();this.boardingButton.disabled=this.boardingPrompt.hidden;
      if(this.boardingPrompt.hidden&&this.boardingPrompt.contains(document.activeElement))document.activeElement?.blur?.();
    }
    if(this.walkingResumeButton)this.walkingResumeButton.hidden=!this.walkingControlNeeded||this.occupied||this.controls.isMobile||this.controls.mapOpen||this.isPaused()||document.pointerLockElement===this.controls.domElement;
    this.status.textContent=this.state.status;this.altitude.textContent=this.occupied?`${Math.round(this.position.y)}m · ${LABELS[this.view]}`:'地面';
    this.boardButton.textContent=this.occupied?(this.canExit()?'下飞机 H':'需安全落地后下机') :this.canBoard()?'登机 H':'靠近后登机 H';
    this.boardButton.title=this.occupied&&!this.canExit()?'请先在净空足够的平地降落并停稳':'';
    document.body.classList.toggle('flight-operations-open',!!this.operationsOpen);
    if(this.operationsBackdrop)this.operationsBackdrop.hidden=!this.operationsOpen;
    if(this.pauseNotice){this.pauseNotice.hidden=!this.operationsOpen;this.pauseNotice.textContent=this.pauseMessage??'';}
    if(this.resumeButton){this.resumeButton.hidden=!this.operationsOpen;this.resumeButton.disabled=!!this.resumePending;}
    if(this.operationsOpen){this.panel.setAttribute('role','dialog');this.panel.setAttribute('aria-modal','true');this.panel.setAttribute('aria-label','直升机操作，飞行已暂停');}
    else{this.panel.removeAttribute?.('role');this.panel.removeAttribute?.('aria-modal');this.panel.removeAttribute?.('aria-label');}
    for(const b of this.panel.querySelectorAll('[data-action]'))b.disabled=b.dataset.action==='resume'?!!this.resumePending:b.dataset.action==='board'?(this.occupied?!this.canExit():!this.canBoard()):!this.occupied;
    this.viewSelect.value=this.view;this.touch.hidden=!(this.occupied&&this.controls.isMobile&&!this.isPaused()&&!this.operationsOpen);
    if(force&&this.occupied)this.panel.open=true;
  }
  getMapMarker(){return {x:this.position.x,z:this.position.z,y:this.position.y,yaw:this.state.yaw,occupied:this.occupied,mode:this.state.mode};}
  dispose(){if(this.disposed)return;this.disposed=true;clearTimeout(this.resumeTimer);this.clearInput();this.listeners.forEach(f=>f());this.cm.removeByTag(TAG);this.model.dispose();document.body.classList.remove('flight-tour-active','flight-operations-open');this.operationsBackdrop?.remove();detachTourTool(this.panel);if(this.boardingPrompt)detachTourTool(this.boardingPrompt);this.walkingResumeButton?.remove();this.touch.remove();this.style.remove();}
}
