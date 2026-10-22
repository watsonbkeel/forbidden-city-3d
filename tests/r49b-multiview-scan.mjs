import fs from'node:fs';import path from'node:path';import{pathToFileURL}from'node:url';import*as T from'three';
import'./lib/inner-palace-fixture.mjs';import{realTextureLibrary}from'./lib/r48-real-texture-library.mjs';
const root=path.resolve(process.argv[2]??'.'),{ZoneBase}=await import(pathToFileURL(path.join(root,'src/scene/zones/ZoneBase.js'))),rows=[];
const names=['养心殿','景仁宫','承乾宫','钟粹宫','永和宫','景阳宫','永寿宫','翊坤宫','储秀宫','太极殿','长春宫','咸福宫','重华宫','文渊阁','咸若馆','寿康宫','慈宁宫','皇极殿','古华轩','遂初堂','畅音阁','阅是楼','颐和轩','倦勤斋','宁寿宫','乐寿堂','梵华楼','文华门','武英门'];
for(const file of fs.readdirSync(path.join(root,'data/zones')).filter(f=>f.endsWith('.json'))){const d=JSON.parse(fs.readFileSync(path.join(root,'data/zones',file)));
 for(const item of d.items.filter(i=>names.includes(i.name)&&['hall','gate'].includes(i.kind))){const lib=realTextureLibrary(),z=new ZoneBase(lib,d);try{
 if(item.kind==='gate')z.buildGate(item);else z.buildHall(item);
 const p=z.kit.plaques.find(p=>p.text===(item.plaqueText??item.name)),f=p.mesh.parent;z.kit.root.updateMatrixWorld(true);
 const face=p.mesh.position.toArray(),width=p.mesh.geometry.parameters.width*p.mesh.scale.x,height=p.mesh.geometry.parameters.height*p.mesh.scale.y,frameBounds={bottom:p.frame.position.y-p.frame.geometry.parameters.height*p.frame.scale.y/2,top:p.frame.position.y+p.frame.geometry.parameters.height*p.frame.scale.y/2};
 const g=z.kit.finish();g.updateMatrixWorld(true);const viewSpecs=[{name:'far-courtyard-local-context-only',x:face[0],y:(item.ph??.8)+1.65,z:face[2]-45},{name:'courtyard',x:face[0],y:(item.ph??.8)+1.65,z:Math.min(-((item.d??16)/2)-10,face[2]-10)},{name:'near-under-eave',x:face[0],y:(item.ph??.8)+1.65,z:face[2]-1.2},{name:'oblique-left',x:face[0]-3,y:(item.ph??.8)+1.65,z:face[2]-4},{name:'oblique-right',x:face[0]+3,y:(item.ph??.8)+1.65,z:face[2]-4},{name:'elevated-inspection-not-pedestrian',x:face[0]-2,y:face[1]-1,z:face[2]-5}];
 const views=viewSpecs.map(v=>{const origin=f.localToWorld(new T.Vector3(v.x,v.y,v.z)),blocked=[];let clear=0;
 for(const dx of[-.35,0,.35])for(const dy of[-.35,0,.35]){const target=f.localToWorld(new T.Vector3(face[0]+dx*width,face[1]+dy*height,face[2])),distance=origin.distanceTo(target),ray=new T.Raycaster(origin,target.clone().sub(origin).normalize(),0,distance+.02),hit=ray.intersectObject(g,true)[0];if(!hit||hit.distance>=distance-.025)clear++;else blocked.push({sample:[dx,dy],firstHit:hit.object.name||hit.object.material?.name,distance:hit.distance});}
 return{...v,clearSamples:clear,totalSamples:9,blocked};});
 rows.push({zone:d.id??file.replace('.json',''),name:item.name,text:p.text,face,width,height,frameBounds,layout:p.layout??'vertical',mount:p.mesh.userData.nameboardMount??p.mesh.userData.hallNameboardMount??null,views});z.kit.dispose(g);
 }finally{z.dispose();lib.dispose();}}
}
fs.writeFileSync(process.argv[3]??'/tmp/r49b-multiview.json',JSON.stringify({method:'ACTUAL_PRODUCTION_FINISHED_MERGED_TRIANGLES__LOCAL_BUILDING_CONTEXT__CPU_RAYS_NOT_GPU_PHOTO_OR_WHOLE_CITY_ACCEPTANCE',warning:'Natural eave/beam obstruction is reported, never a reason to lower a board into the door. Elevated view is diagnostic, not reachable pedestrian evidence.',root,rows},null,2));console.log('rows',rows.length);
