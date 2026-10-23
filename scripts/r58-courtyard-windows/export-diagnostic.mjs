// Bounded before/after components, never a second full world/build.
import fs from 'node:fs';
import {fixture,hash,meshRows,physical,snapshot,triangles,meshes,geometryHealth,roles} from '../../tests/lib/r58-court-facade-fixture.mjs';
import {baselineSideGate,oldCourtyardBar,newCourtyardMember,COURTYARD_WINDOW_BASE} from '../../tests/lib/r58-courtyard-window-fixture.mjs';
import {assertCourtyardWindowsInWorld} from '../../tests/lib/r58-courtyard-window-world-check.mjs';
import {exportCourtyardWindowViews} from '../../tests/lib/r58-courtyard-window-cpu.mjs';
const out='reports/r58-courtyard-windows';fs.mkdirSync(out,{recursive:true});
const report={scope:'ACTUAL_MERGED_COMPONENT_CPU_ONLY; NOT FULL WORLD/BROWSER/GPU/TEXTURE/CURRENT-2026 ACCEPTANCE',baseCommit:COURTYARD_WINDOW_BASE,status:'VERIFY_PENDING',officialPhotosCopied:false,profiles:{}};
for(const profile of ['xihe','xiehe']){
 const before=fixture(profile,{},baselineSideGate),after=fixture(profile),r=report.profiles[profile]={before:snapshot(before),after:snapshot(after),retainedExact:hash(meshRows(before.frame,oldCourtyardBar))===hash(meshRows(after.frame,newCourtyardMember)),physicsExact:hash(physical(before.kit))===hash(physical(after.kit)),geometryHealth:geometryHealth(after.frame),windows:[],views:[]};
 for(const pane of roles(after.frame,'gate-window').filter(o=>o.userData.side==='rear')){
  const bay=pane.userData.bay,oldBars=meshes(before.frame).filter(o=>oldCourtyardBar(o)&&Math.abs(o.position.x-after.g.bayCenters[bay])<after.g.bayWidths[bay]/2),newMembers=meshes(pane).filter(newCourtyardMember);
  const sum=list=>list.reduce((n,o)=>n+(o.geometry.index?.count??o.geometry.attributes.position.count)/3,0);
  const retained=meshes(before.frame).filter(o=>['gate-window-shadow','gate-window-frame'].includes(o.userData.role)&&o.position.z>0&&Math.abs(o.position.x-after.g.bayCenters[bay])<after.g.bayWidths[bay]/2);
  r.windows.push({bay,removedGenericBars:oldBars.length,removedTriangles:sum(oldBars),newMemberTriangles:sum(newMembers),retainedBackingAndOuterFrame:sum(retained),oldFullWindowTriangles:sum(oldBars)+sum(retained),newFullWindowTriangles:sum(newMembers)+sum(retained),newPaneIncludingBacking:triangles(pane),triangleDelta:sum(newMembers)-sum(oldBars)});
 }
 for(const [stage,f] of [['before',before],['after',after]]){
  const scene=f.kit.finish(),W={scene,cm:f.cm};scene.updateMatrixWorld(true);r[stage+'Merged']={triangles:triangles(scene),draws:meshes(scene).length,health:geometryHealth(scene)};
  if(stage==='after')r.actualMergedWindows=assertCourtyardWindowsInWorld(W,{profiles:[profile]});
  r.views.push(...exportCourtyardWindowViews(W,out,stage,{profiles:[profile]}));f.kit.dispose(scene);
 }
 r.mergedDrawDelta=r.afterMerged.draws-r.beforeMerged.draws;r.triangleDelta=r.afterMerged.triangles-r.beforeMerged.triangles;
}
fs.writeFileSync(`${out}/proof.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
