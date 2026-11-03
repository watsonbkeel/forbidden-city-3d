import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {registerHooks} from 'node:module';
import {setupMap} from '../lib/map-fixture.mjs';
import {TourFrameScheduler} from '../../src/render/TourFrameScheduler.js';
import * as preferences from '../../src/render/TourPerformancePreference.js';
const hook=registerHooks({load(url,ctx,next){return next(url,url.endsWith('.json')?{...ctx,importAttributes:{...ctx.importAttributes,type:'json'}}:ctx);}});
const {Teleport}=await import('../../src/ui/Teleport.js');hook.deregister();
const source=fs.readFileSync(new URL('../../main.js',import.meta.url),'utf8');
let Notice;try{({TourFailureNotice:Notice}=await import('../../src/ui/TourFailureNotice.js'));}catch(e){if(e.code!=='ERR_MODULE_NOT_FOUND')throw e;}
export async function fixture(t,{mobile=false}={}){
 let cleanup=()=>{};t.after(()=>cleanup());
 const s=await setupMap(t,{mobile});s.document.hidden=false;const errors=[];let reloads=0;s.window.location={reload:()=>reloads++};
 let id=0;const queue=new Map(),renders=[],error=new Error('Deliberate diagnostic frame exception; NOT an observed Chuxiu error');let fail=false;
 const request=fn=>{queue.set(++id,fn);return id;},cancel=n=>queue.delete(n);
 const env={document:s.document,window:s.window,performance,PERFORMANCE:{MOBILE_MAX_PIXEL_RATIO:2,LOD_DISTANCE_LOW:150,LOD_DISTANCE_HIGH:80},...preferences,TourFailureNotice:Notice,console:{error:(...args)=>errors.push(args)}};
 env.TourFrameScheduler=class extends TourFrameScheduler{constructor(options){super({...options,document:s.document,request,cancel,now:()=>s.now()});}};
 const body=source.slice(source.indexOf('class ForbiddenCityApp'),source.indexOf('// 本地开发暴露')).replaceAll('import.meta.env','({DEV:false,BASE_URL:"/forbidden-city-3d/"})');
 const App=vm.runInNewContext(`${body};ForbiddenCityApp`,env),a=Object.create(App.prototype);
 Object.assign(a,{disposed:false,currentQuality:'high',performanceMode:'eco',isMobile:mobile,camera:s.camera,controls:s.c,lastShadowUpdate:0,shadowObjects:[],updateLocationInfo(){},isInGatePassage(){return false;},
 renderer:{setPixelRatio(){},setSize(){}},postProcessing:{onResize(){},render(){if(fail)throw error;renders.push(s.camera.position.toArray());}},
 environment:{dayCycle:{lighting:{daylight:1},beijingTime:12},update(){}},shadowSetup:{updateShadowLOD(){}},
 palaceBuilder:{update(){}},enclosure:{update(){}},garden:{update(){}},interiors:{update(){}},characters:{update(){}},ambience:{update(){}},minimap:s.map,
 zoneManager:{getMapItems:()=>[],getCurrentId:()=>null,ensureLoadedAt(){},update(){}}});
 const tp=new Teleport(s.c,a.zoneManager,s.cm);s.map.hasTeleportTarget=name=>tp.targets.has(name);s.map.onTeleport=name=>tp.go(name);
 cleanup=()=>{a.frameLoop?.dispose();a.failureNotice?.dispose();tp.dispose();};
 function tick(ms=34){s.advance(ms);const pending=[...queue.values()];queue.clear();for(const cb of pending)cb(s.now());}
 function visibility(hidden){s.document.hidden=hidden;s.dispatch(s.document,'visibilitychange');}
 function travel(){if(!s.map.visible)s.map.toggle();s.map.showPlace('taihe');const b=s.map.container.querySelector('#place-travel');assert.ok(b);s.dispatch(b,'pointerdown',{pointerId:1,clientX:10,clientY:10});s.dispatch(b,'pointerup',{pointerId:1,clientX:10,clientY:10});s.dispatch(b,'click',{detail:1});}
 return {...s,a,tp,queue,renders,error,errors,reloads:()=>reloads,tick,visibility,travel,setFail:v=>fail=v};
}
