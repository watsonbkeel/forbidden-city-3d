import * as T from 'three';
import {WUMEN_NORTHEAST_PAVILION_ID,WUMEN_NORTHEAST_NORTH_COLUMN_FIT} from './WumenPavilionColumns.js';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-6;
/** One retained closed north facade. The southern clone shares its old geometry:
 * never mutate/dispose that shared source, never open the solid inner body. */
export function refineWumenNorthEnclosure(builder,body,{instanceId}={}){
 if(instanceId!==WUMEN_NORTHEAST_PAVILION_ID)return false;
 if(body?.userData.structure?.northEnclosure)return false;
 const old=body?.children.filter(m=>m.isMesh&&near(m.position.z,4.8)&&near(m.position.y,2.97)&&near(m.rotation.y,Math.PI))??[],south=body?.children.find(m=>m.isMesh&&near(m.position.z,-4.8)&&near(m.position.y,2.97));
 const columns=body?.children.filter(m=>m.geometry?.type==='CylinderGeometry'&&near(m.position.z,5.5))??[];
 if(!body?.isGroup||body.userData.structure?.id!==instanceId||body.userData.structure.northColumnFit!==WUMEN_NORTHEAST_NORTH_COLUMN_FIT.revision||!near(body.position.x,-47.7)||!near(body.position.y,12.3)||!near(body.position.z,-6)||!near(body.userData.topY,7.5)||columns.length!==6||old.length!==1||!south||old[0].geometry!==south.geometry||old[0].material!==south.material||old[0].material!==builder.library.material('lattice_doors'))throw Error('Wumen northeast north enclosure source mismatch');
 if(!body.quaternion.equals(new T.Quaternion())||!body.scale.equals(new T.Vector3(1,1,1))||!old[0].scale.equals(new T.Vector3(1,1,1))||!near(old[0].position.x,0)||old[0].rotation.x||old[0].rotation.z||old[0].geometry.attributes.position.count!==36)throw Error('Wumen north enclosure transform changed');
 old[0].geometry.computeBoundingBox();const size=old[0].geometry.boundingBox.getSize(new T.Vector3());if(!near(size.x,9.42)||!near(size.y,5.94)||!near(size.z,.2))throw Error('Wumen north enclosure footprint changed');
 const root=new T.Group();root.name=root.userData.role='wumen-ne-north-enclosure';root.position.z=4.8;
 const gold=builder.ownMat('wumen-ne-north-gold-fit',{color:0xb5a268,roughness:.9}),dark=builder.ownMat('wumen-ne-north-closed-pane-fit',{color:0x514a3c,roughness:1});
 const unitBox=new T.BoxGeometry(1,1,1);
 const box=(parent,role,material,x0,x1,y0,y1,depth=.2,z=0)=>{const m=new T.Mesh(unitBox,typeof material==='string'?builder.library.material(material):material);m.scale.set(x1-x0,y1-y0,depth);m.position.set((x0+x1)/2,(y0+y1)/2,z);m.name=m.userData.role=role;m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 const frame=(parent,role,mat,[x0,x1,y0,y1],w)=>{box(parent,role,mat,x0,x0+w,y0,y1);box(parent,role,mat,x1-w,x1,y0,y1);box(parent,role,mat,x0+w,x1-w,y0,y0+w);box(parent,role,mat,x0+w,x1-w,y1-w,y1);return[x0+w,x1-w,y0+w,y1-w];};
 box(root,'wumen-ne-north-stone-foot','stone_slab',-4.71,4.71,0,.42);box(root,'wumen-ne-north-top-band','wood_column',-4.71,4.71,5.65,5.94);
 // Three unequal inner groups, independently registered from the printed plan.
 // Outer six columns/five spans are not substituted for these three groups.
 const boundaries=[277,338,427,489].map(px=>5.5-(px-239)*11/287).reverse();
 box(root,'wumen-ne-north-end-strip','wood_column',-4.71,boundaries[0],.42,5.65);box(root,'wumen-ne-north-end-strip','wood_column',boundaries[3],4.71,.42,5.65);
 for(let i=0;i<3;i++){
  const group=new T.Group();group.name=group.userData.role='wumen-ne-north-window-group';group.userData.groupIndex=i;root.add(group);
  const inner=frame(group,'wumen-ne-north-red-frame','wood_column',[boundaries[i],boundaries[i+1],.42,5.65],.12),r=frame(group,'wumen-ne-north-gold-frame',gold,inner,.035),[x0,x1,y0,y1]=r;
  // Opaque neutral pane fit preserves CLOSED interior, not a black open void.
  box(group,'wumen-ne-north-closed-pane',dark,x0,x1,y0,y1,.1,-.05);
  box(group,'wumen-ne-north-crossband-gold',gold,x0,x1,4.19,4.235);box(group,'wumen-ne-north-crossband','wood_column',x0,x1,4.235,4.365);box(group,'wumen-ne-north-crossband-gold',gold,x0,x1,4.365,4.41);
  const count=[2,3,2][i];for(let j=1;j<count;j++){const x=x0+(x1-x0)*j/count;box(group,'wumen-ne-north-lower-coarse-divider',gold,x-.0225,x+.0225,y0,4.19);}
  group.userData.evidence={lowerCoarseDivisions:count,lowerStatus:'VISIBLE_COARSE_FIT',upperDivisionCount:'UNRESOLVED_NO_FINE_GRID_INVENTED'};
 }
 const slot=body.children.indexOf(old[0]);body.remove(old[0]);body.add(root);body.children.splice(body.children.indexOf(root),1);body.children.splice(slot,0,root);
 body.userData.structure.northEnclosure={scope:'ONE_NORTH_CLOSED_FACADE_ONLY',source:'own-official-north-oblique-and-2021-east-plan',planPixels:[277,338,427,489],groupBoundaries:boundaries,groups:3,lowerCoarseFit:[2,3,2],upperAndFineGrid:'UNRESOLVED',depth:'INHERITED_UNMEASURED',originalOuterBounds:{x:[-4.71,4.71],y:[0,5.94],z:[4.7,4.9]},wholeObjectAccepted:false,interiorAccess:'RETAINED_CLOSED_SOLID_BODY'};
 return true;
}
