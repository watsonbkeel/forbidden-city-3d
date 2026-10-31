// Test-only proposed hooks. Production FirstPerson/Collision remain untouched.
import fs from 'node:fs';import {createHash}from'node:crypto';
import{originalFirstPersonSource,firstPersonURL}from'./first-person-baseline.mjs';
const root=new URL('../../../../',import.meta.url);let serial=0;
const encode=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const imports=(s,url)=>s.replace(/(from\s*['"])([^'"]+)(['"])/g,(_,a,name,b)=>a+(name.startsWith('.')?new URL(name,url).href:import.meta.resolve(name))+b);
const replace=(s,a,b)=>{if(!s.includes(a))throw Error('Recovery harness source hook drift: '+a);return s.replace(a,b);};
export async function createRecoveryHarness(contract){
 const uid=serial++,url=firstPersonURL,original=originalFirstPersonSource,prefix=`// isolated ${uid}\nlet recovery;export const setRecovery=c=>{recovery=c;};\n`;let source=prefix+imports(original,url);
 source=replace(source,'    this.setupEventListeners();','    this.setupEventListeners();\n    try{this._wuyingRecovery = recovery.attach(this);}catch(error){this.dispose();throw error;}');
 source=replace(source,'    // 起跳：只有站在地面上才能跳（空中不能二段跳）','    this._wuyingRecovery.observe({forward:targetForward,right:targetRight});\n    // Ordinary grounded jumping stays unchanged; isolated crown capability only.');
 source=replace(source,'if (this.jumpQueued) {\n      this.jumpQueued = false;','if (this.jumpQueued) {\n      const recoveryLift=this._wuyingRecovery.tryJump();\n      this.jumpQueued = false;');
 source=replace(source,'      if (onGround) {','      if (onGround || recoveryLift !== null) {');
 source=replace(source,'this.verticalVelocity = PLAYER.JUMP_VELOCITY ?? 6.7;\n        this.groundY = this.feetY;','this.verticalVelocity = onGround ? (PLAYER.JUMP_VELOCITY ?? 6.7) : recoveryLift;\n        if(onGround)this.groundY = this.feetY;');
 source=replace(source,'const validPosition = this.collisionManager.getValidPosition(','const validPosition = this._wuyingRecovery.withMovement(currentPosition,newPosition,()=>this.collisionManager.getValidPosition(');
 source=replace(source,"{kind:'player',airborne:air,feetY:this.feetY}\n      );","{kind:'player',airborne:air,feetY:this.feetY}\n      ));");
 source=replace(source,'      const triangleImpact=this.collisionManager.resolveTriangleVertical?.(','      allowedFeet=this._wuyingRecovery.limitVertical(this.feetY,allowedFeet);\n      const triangleImpact=this.collisionManager.resolveTriangleVertical?.(');
 source=replace(source,'  stop() {','  stop() {\n    this._wuyingRecovery?.cancel();');
 source=replace(source,'  setPosition(x, y, z) {','  setPosition(x, y, z) {\n    this._wuyingRecovery?.reset();');
 source=replace(source,'  dispose() {','  dispose() {\n    this._wuyingRecovery?.dispose();');
 const control=await import(encode(source));control.setRecovery(contract);
 const rail=new URL('src/scene/palace/special/WuyingThreeBridgeRails.js',root).href;
 const shimURL=encode(`// isolated ${uid}\nimport{canRecoverInwardFromWuyingRail as old}from'${rail}';let contract;export const setRecovery=c=>contract=c;export function canRecoverInwardFromWuyingRail(...args){return old(...args)||contract.allowsRiver(...args);}`);
 (await import(shimURL)).setRecovery(contract);
 const collisionURL=new URL('src/utils/Collision.js',root),collision=replace(imports(fs.readFileSync(collisionURL,'utf8'),collisionURL),rail,shimURL),classes=await import(encode(collision));
 return {FirstPersonControls:control.FirstPersonControls,CollisionManager:classes.CollisionManager,instrumentedControlsSource:source.slice(prefix.length),sourceHash:createHash('sha256').update(original).digest('hex')};
}
