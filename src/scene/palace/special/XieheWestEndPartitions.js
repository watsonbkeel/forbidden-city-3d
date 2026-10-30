import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

// Separate own north/south west-hall views (7-f / 7-b), sphere below.
// Envelope and join dimensions are engineering fits, not a measured survey.
export function buildXieheWestEndPartitions(kit,frame,g,renderBoxes,materials){
 if(g.profile!=='xiehe')return;
 const lattice=[];
 const ph=g.platformY,top=g.columnH-.65,thick=.32;
 const doorZ=1.5,doorW=1.35,doorH=top-.25,lowerH=doorH*.51;
 const {plaster,border}=materials; // Borrow existing east-hall materials; no duplicate owners.
 for(const [x,end]of[[g.columnXs[1],'north'],[g.columnXs[4],'south']]){
  const group=new T.Group();group.position.x=x;group.name='xiehe-west-end-partition';
  group.userData={role:group.name,end,sourceSphere:'2054726937396219918',sourceCube:end==='north'?'f':'b',measured:false,completeObject:false};frame.add(group);group.updateWorldMatrix(true,false);
  const box=(role,material,w,h,d,cx,cy,cz,physical=true)=>{
   const m=kit.box(group,material,w,h,d,cx,cy,cz);m.name=role;m.userData.role=role;renderBoxes.push(m);
   if(physical)kit.col(group,cx-w/2,cy-h/2,cz-d/2,cx+w/2,cy+h/2,cz+d/2);
   return m;
  };
  const solid=(role,material,w,h,d,cx,cy,cz)=>{
   if(typeof material==='string')return box(role,material,w,h,d,cx,cy,cz);
   const m=kit.mesh(group,new T.BoxGeometry(w,h,d),material,cx,cy,cz);m.name=role;m.userData.role=role;renderBoxes.push(m);
   kit.col(group,cx-w/2,cy-h/2,cz-d/2,cx+w/2,cy+h/2,cz+d/2);return m;
  };
  for(const[a,b]of[[0,doorZ-doorW/2],[doorZ+doorW/2,g.depth/2]]){
   solid('xiehe-west-end-stone-base','wall_brick',thick,.85,b-a,0,ph+.425,(a+b)/2);
   solid('xiehe-west-end-side-wall',plaster,thick,top-.85,b-a,0,ph+.85+(top-.85)/2,(a+b)/2);
   // Border belongs on the inner-facing plaster, not on the existing west window.
   const face=x<0?thick/2+.003:-thick/2-.003;
   for(const yy of[ph+.97,ph+top-.12]){const m=kit.mesh(group,new T.BoxGeometry(.006,.03,Math.max(.05,b-a-.16)),border,face,yy,(a+b)/2);m.userData.role='xiehe-west-end-panel-border';}
   for(const zz of[a+.08,b-.08]){const m=kit.mesh(group,new T.BoxGeometry(.006,top-1.09,.03),border,face,ph+.85+(top-.85)/2,zz);m.userData.role='xiehe-west-end-panel-border';}
  }
  solid('xiehe-west-narrow-door-head',plaster,thick,top-doorH,doorW,0,ph+doorH+(top-doorH)/2,doorZ);
  // No continuous wall behind the leaf: the opening is constructed from the
  // side/head blocks above. Closed lower board and actual grille below fill it.
  box('xiehe-west-narrow-door-lower','wood_column',.14,lowerH,doorW-.12,0,ph+lowerH/2,doorZ);
  for(const z of[doorZ-doorW/2+.06,doorZ+doorW/2-.06])box('xiehe-west-narrow-door-frame','wood_column',.2,doorH,.12,0,ph+doorH/2,z);
  for(const y of[ph+lowerH,ph+doorH-.06])box('xiehe-west-narrow-door-frame','wood_column',.2,.12,doorW,0,y,doorZ);
  // Open diamond lattice: clip each diagonal at the visible frame. Physical
  // bars use the same final mesh triangles, rather than a solid invisible pane.
  const z0=doorZ-doorW/2+.12,z1=doorZ+doorW/2-.12,y0=ph+lowerH+.06,y1=ph+doorH-.12;
  for(const sign of[-1,1])for(let k=-Math.ceil((y1-y0)/.23);k<=Math.ceil((z1-z0+y1-y0)/.23);k++){
   const c=z0+k*.23;const points=[];
   for(const y of[y0,y1]){const z=c+sign*(y-y0);if(z>=z0&&z<=z1)points.push(new T.Vector3(0,y,z));}
   for(const z of[z0,z1]){const y=y0+sign*(z-c);if(y>y0&&y<y1)points.push(new T.Vector3(0,y,z));}
   if(points.length!==2||points[0].distanceTo(points[1])<.04)continue;
   const a=points[0],b=points[1],delta=b.clone().sub(a),m=kit.mesh(group,new T.BoxGeometry(.12,delta.length(),.035),kit.lib.material('wood_column'),0,0,0);
   m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());m.name='xiehe-west-narrow-door-lattice';m.userData.role=m.name;
   lattice.push(m);
  }
 }
 return()=>{
  frame.updateMatrixWorld(true);
  for(const [i,m]of lattice.entries()){const geo=m.geometry.clone().applyMatrix4(m.matrixWorld);
   try{const owner=triangleInstance(createTriangleTemplate(geo),[0,0,0],`xiehe-west-lattice:${i}`),bounds=owner.box.clone();bounds.triangleSupport=owner;kit.colliders.push(bounds);}finally{geo.dispose();}
  }
 };
}
