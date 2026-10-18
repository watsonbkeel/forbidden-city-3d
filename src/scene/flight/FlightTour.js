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
    this.listeners=[];this.lastUI=-Infinity;this.landings=LANDING_CHOICES.filter(p=>envelope.safeGround(p.x,p.z,this.state.rules.radius));
    if(this.model.bounds.horizontalRadius>this.state.rules.radius)throw Error('Aircraft exceeds collision envelope');
    this.buildUI();this.bindInputs();this.syncModel();this.registerParkedCollision();
  }
  get occupied(){return this.state.occupied;}
  get position(){return this.state.position;}
  listen(target,type,fn,options){target.addEventListener(type,fn,options);this.listeners.push(()=>target.removeEventListener(type,fn,options));}
  showStatus(text){this.state.status=text;this.status.textContent=text;}
  canBoard(){const p=this.controls.camera.position,s=this.position;return !this.occupied&&this.state.grounded&&Math.hypot(p.x-s.x,p.z-s.z)<8&&Math.abs((p.y-PLAYER.HEIGHT)-s.y)<.7;}
  clearInput(){this.keys.clear();this.pointers.clear();this.lookPointer=null;}
  board(){
    if(this.isPaused()||!this.canBoard()){this.showStatus('请步行靠近午门外或停靠处的直升机');return false;}
    if(!this.state.board())return false;
    this.savedLookLocked=this.controls.lookLocked;this.savedHeadBob=this.controls.headBobEnabled;
    this.controls.stop();this.controls.headBobEnabled=false;this.controls.lookLocked=true;
    this.cm.removeByTag(TAG);this.clearInput();this.lookYaw=0;this.lookPitch=0;
    this.walkingUI=[this.controls.joystick?.base,this.controls.lookLockButton,this.controls.jumpButton,document.getElementById('help-panel')].filter(Boolean).map(el=>[el,el.style.display]);
    this.walkingUI.forEach(([el])=>el.style.display='none');
    this.onModeChange(true);this.updateCamera();this.updateUI(true);return true;
  }
  exit(){
    if(this.isPaused()||!this.occupied||!this.state.grounded||this.state.speed>.1){this.showStatus('请先在净空足够的地面停稳再下机');return false;}
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
    this.clearInput();this.controls.stop();this.controls.lookLocked=this.savedLookLocked;this.controls.headBobEnabled=this.savedHeadBob;
    this.camera.up.set(0,1,0);
    this.controls.setPosition(exit.x,exit.y,exit.z);this.controls.lookAt(this.position.x,this.position.z);
    this.controls.prevTime=performance.now();
    this.walkingUI?.forEach(([el,display])=>el.style.display=display);this.registerParkedCollision();this.onModeChange(false);this.updateUI(true);return true;
  }
  toggleBoard(){return this.occupied?this.exit():this.board();}
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
      if(e.repeat&&['KeyH','KeyF','KeyV','KeyL','KeyT'].includes(e.code))return;
      if(hasShortcutModifier(e)||isTextEntryTarget(e.target)||this.isPaused())return;
      if(e.code==='KeyH'){e.preventDefault();e.stopImmediatePropagation();this.toggleBoard();return;}
      if(!this.occupied)return;
      if(e.code==='Space'&&e.target?.closest?.('button, a, summary, [role="button"]'))return;
      if(MOTION_KEYS.has(e.code)){e.preventDefault();e.stopImmediatePropagation();this.keys.add(e.code);this.state.takeOver();return;}
      const action={KeyF:()=>this.state.startTour(),KeyV:()=>this.setView(VIEWS[(VIEWS.indexOf(this.view)+1)%VIEWS.length]),KeyT:()=>this.state.hover(),KeyL:()=>this.requestLanding()}[e.code];
      if(action){e.preventDefault();e.stopImmediatePropagation();this.clearInput();action();}
    },true);
    this.listen(window,'keyup',e=>{const owned=this.keys.delete(e.code);if(this.occupied&&owned&&MOTION_KEYS.has(e.code)){e.preventDefault();e.stopImmediatePropagation();}},true);
    this.listen(window,'blur',()=>{this.active=false;this.clearInput();});
    this.listen(window,'focus',()=>{this.active=true;this.clearInput();});
    this.listen(document,'visibilitychange',()=>{this.active=!document.hidden;this.clearInput();});
    this.listen(document,'mousemove',e=>{
      if(!this.occupied||!this.controls.controls.isLocked||this.isPaused())return;
      e.stopImmediatePropagation();this.lookYaw-=e.movementX*.002;this.lookPitch=clamp(this.lookPitch-e.movementY*.002,-1.15,1.15);
    },true);
    this.listen(document,'pointerdown',e=>{
      if(!this.occupied||e.pointerType!=='touch'||this.isPaused()||e.target.tagName!=='CANVAS'||e.target.closest('#minimap, #minimap-preview'))return;
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
    const paused=this.isPaused()||!this.active;
    if(paused)this.clearInput();
    const p=this.controls.camera.position,home=this.state.home;
    const canRecycle=Math.hypot(p.x-home.x,p.z-home.z)>8;
    const event=this.state.update(paused?0:dt,now,paused?{}:this.axes(),canRecycle);
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
      body.flight-tour-active::before{display:none!important}
      @media(max-width:600px) and (orientation:portrait){body.flight-tour-active>#structural-preview-button{bottom:calc(116px + env(safe-area-inset-bottom,0px))}}
      #flight-panel{position:relative;flex-shrink:0;color:#fff7df;font:13px/1.45 system-ui;max-width:min(310px,calc(100vw - 28px));background:#17242be8;border:1px solid #9eacac88;border-radius:12px;padding:10px;box-shadow:0 3px 14px #0005}
      #flight-panel summary{cursor:pointer;min-height:32px;display:flex;align-items:center;gap:8px}#flight-panel button,#flight-panel select{font:inherit;min-height:38px;border:1px solid #83938b;border-radius:6px;background:#263d43;color:#fff;padding:5px 8px}#flight-panel button:focus-visible,#flight-panel select:focus-visible{outline:3px solid #ffd572}#flight-panel button:disabled{opacity:.5}#flight-panel .flight-row{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0}#flight-panel p{margin:6px 0}#flight-status{max-width:280px}#flight-panel .flight-note{color:#ced6d5;font-size:11px}#flight-panel select{max-width:100%}
      #flight-touch{position:fixed;bottom:calc(12px + env(safe-area-inset-bottom));left:12px;right:12px;display:flex;justify-content:space-between;pointer-events:none;z-index:1300}#flight-touch[hidden]{display:none}#flight-touch .flight-pad{display:grid;grid-template-columns:repeat(3,48px);gap:4px;pointer-events:auto}#flight-touch button{width:48px;height:48px;touch-action:none;border:1px solid #fff7;background:#173c48dc;color:white;border-radius:10px;font-size:18px;user-select:none}#flight-touch button:active{background:#a48138}
      @media(max-height:600px){#flight-panel{padding:6px;max-width:280px}#flight-panel summary{min-height:25px}#flight-panel button,#flight-panel select{min-height:32px}#flight-touch button{height:42px;width:44px}#flight-touch .flight-pad{grid-template-columns:repeat(3,44px)}}
    `;document.head.appendChild(this.style);
    this.panel=document.createElement('details');this.panel.id='flight-panel';
    this.panel.innerHTML=`<summary>直升机游览 <span id="flight-altitude">地面</span></summary><p id="flight-status" role="status">午门外待登机</p><div class="flight-row"><button type="button" data-action="board">靠近后登机 H</button><button type="button" data-action="tour">自动观光 F</button><button type="button" data-action="hover">手动/悬停 T</button></div><div class="flight-row"><label>视角 <select id="flight-view"><option value="pilot">驾驶员</option><option value="follow" selected>跟随</option><option value="overhead">俯瞰</option></select></label><label>停靠 <select id="flight-landing"></select></label><button type="button" data-action="land">飞往并降落 L</button></div><p>WASD/方向键平移 · Q/E转向 · 空格升高/C降低 · 鼠标环顾 · V切视角。方向/升降可随时接管自动航线。</p><p class="flight-note">虚拟游览载具与游戏停靠点，不代表现实飞行或降落许可。机体与屋顶保守避碰；手动可在净空足够的平地起降。</p>`;
    attachTourTool(this.panel);this.status=this.panel.querySelector('#flight-status');this.altitude=this.panel.querySelector('#flight-altitude');this.boardButton=this.panel.querySelector('[data-action="board"]');this.landingSelect=this.panel.querySelector('#flight-landing');this.viewSelect=this.panel.querySelector('#flight-view');
    for(const p of this.landings){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;this.landingSelect.appendChild(o);}
    const handlers={board:()=>this.toggleBoard(),tour:()=>{this.clearInput();this.state.startTour();},hover:()=>{this.clearInput();this.state.hover();},land:()=>this.requestLanding()};
    for(const b of this.panel.querySelectorAll('[data-action]'))this.listen(b,'click',e=>{if(!this.isPaused())handlers[b.dataset.action]();if(e.detail>0)b.blur();});
    this.listen(this.viewSelect,'change',()=>this.setView(this.viewSelect.value));
    this.touch=document.createElement('div');this.touch.id='flight-touch';this.touch.hidden=true;
    this.touch.innerHTML='<div class="flight-pad"></div><div class="flight-pad"></div>';
    const pads=this.touch.children;
    const specs=[['↶','yaw',1,0],['↑','forward',1,0],['↷','yaw',-1,0],['←','right',-1,0],['↓','forward',-1,0],['→','right',1,0],['升','vertical',1,1],['停','hover',0,1],['降','vertical',-1,1]];
    for(const[label,axis,value,pad]of specs){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',`飞行${{forward:value>0?'前进':'后退',right:value>0?'右移':'左移',yaw:value>0?'左转':'右转',vertical:value>0?'升高':'降低',hover:'悬停'}[axis]}`);pads[pad].appendChild(b);
      this.listen(b,'pointerdown',e=>{if(!this.occupied||this.isPaused())return;e.preventDefault();b.setPointerCapture?.(e.pointerId);this.state.takeOver();if(axis==='hover')this.clearInput();else this.pointers.set(e.pointerId,{axis,value});});
      for(const event of['pointerup','pointercancel','lostpointercapture'])this.listen(b,event,e=>this.pointers.delete(e.pointerId));
    }
    document.body.appendChild(this.touch);
  }
  updateUI(force=false){
    document.body.classList.toggle('flight-tour-active',this.occupied);
    this.status.textContent=this.state.status;this.altitude.textContent=this.occupied?`${Math.round(this.position.y)}m · ${LABELS[this.view]}`:'地面';
    this.boardButton.textContent=this.occupied?'停稳后下机 H':this.canBoard()?'登机 H':'靠近后登机 H';
    for(const b of this.panel.querySelectorAll('[data-action]'))b.disabled=b.dataset.action==='board'?(!this.occupied&&!this.canBoard()):!this.occupied;
    this.viewSelect.value=this.view;this.touch.hidden=!(this.occupied&&this.controls.isMobile&&!this.isPaused());
    if(force&&this.occupied)this.panel.open=true;
  }
  getMapMarker(){return {x:this.position.x,z:this.position.z,y:this.position.y,yaw:this.state.yaw,occupied:this.occupied,mode:this.state.mode};}
  dispose(){if(this.disposed)return;this.disposed=true;this.clearInput();this.listeners.forEach(f=>f());this.cm.removeByTag(TAG);this.model.dispose();document.body.classList.remove('flight-tour-active');detachTourTool(this.panel);this.touch.remove();this.style.remove();}
}
