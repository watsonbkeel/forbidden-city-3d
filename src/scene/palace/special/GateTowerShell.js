import * as THREE from 'three';
import {applyBoxUV,applyBandUV} from '../../../utils/GeometryUV.js';
import {gateRailFacade} from '../gateRailFacade.js';
/** Explicit upper enclosure. Ground-gate studded doors are intentionally absent.
 * Every body-height box/leaf/shaft registers its actual rendered local bounds. */
export function buildGateTowerShell(lib,p) {
  if(!['axis/wumen-upper-tower','axis/shenwu-upper-tower'].includes(p.id))throw new Error(`Unsupported gate tower profile: ${p.id}`);
  const group=new THREE.Group(),colliders=[],ownedMaterials=[];
  function collider(mesh){mesh.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(mesh);b.min.y=Math.max(0,b.min.y);b.max.y=Math.min(3,b.max.y);if(!b.isEmpty())colliders.push(b);}
  function mesh(geo,material,x,y,z,part,collide=true,extra={}){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=!['closed-lattice-panel','interior-floor','threshold'].includes(part);m.receiveShadow=true;m.userData={gatePart:part,...extra};group.add(m);if(collide)collider(m);return m;}
  function box(w,h,d,x,y,z,material,part,collide=true,band=false,extra={}){
    const geo=(band?applyBandUV:applyBoxUV)(new THREE.BoxGeometry(w,h,d),lib.tileSize(material));
    if(p.id==='axis/shenwu-upper-tower'&&part==='local-hall-balustrade')gateRailFacade(geo);
    return mesh(geo,lib.material(material,material==='balustrade'?{alphaTest:.5,side:THREE.DoubleSide}:{}),x,y,z,part,collide,extra);
  }
  const {T,wallH,enclosure:e}=p;
  if(p.id==='axis/wumen-upper-tower'){
  for(const s of [-1,1])box(T,wallH,e.outerZ*2,s*(e.width/2-T/2),wallH/2,0,'wall_red','gable-wall');
  for(const opening of p.openings){const {sign,side,width:dw,height:dh}=opening;
    for(const bay of p.facadeBays.filter(b=>b.side===side)){
      const extra={geographicSide:side,facadeBayId:bay.id,parameterStatus:bay.type,leafCount:bay.leafCount};
      const spans=bay.open?[[bay.minX,-dw/2],[dw/2,bay.maxX]]:[[bay.minX,bay.maxX]];
      for(const [a,b] of spans){
        const width=b-a,x=(a+b)/2;
        box(width,wallH,T,x,wallH/2,sign*e.wallAxisZ,'wall_red','facade-wall',true,false,extra);
        // Recess the existing lattice finish within each independently identified
        // bay. Do not infer individual leaf counts from these distant photos.
        box(width-.24,wallH*.9,p.veneer.thickness,x,wallH*.45,sign*(e.outerZ+p.veneer.thickness/2),'lattice_doors','closed-lattice-panel',true,true,extra);
      }
    }
    box(dw,wallH-dh,T,0,dh+(wallH-dh)/2,sign*e.wallAxisZ,'wall_red','door-lintel',false);
    for(const s of [-1,1]){
      const leaf=new THREE.Mesh(applyBandUV(new THREE.BoxGeometry(opening.leafWidth,dh-.2,opening.leafThickness),lib.tileSize('lattice_doors')),lib.material('lattice_doors'));
      leaf.position.set(s*(dw/2-.14),(dh-.2)/2,sign*(e.wallAxisZ-T/2-opening.leafWidth/2));leaf.rotation.y=s*opening.openingRadians;
      leaf.castShadow=leaf.receiveShadow=true;leaf.userData={gatePart:'open-lattice-leaf',geographicSide:side,parameterStatus:opening.status};group.add(leaf);collider(leaf);
    }
    box(dw,.2,T+.2,0,.1,sign*e.wallAxisZ,'wood_column','threshold',false);
  }
  } else {
    buildShenwuFaces();
  }
  const floorMat=new THREE.MeshStandardMaterial({color:0x4a4a4c,roughness:.7,metalness:0,name:'tower_floor'});ownedMaterials.push(floorMat);
  const fg=new THREE.PlaneGeometry(p.floor.width,p.floor.depth);fg.rotateX(-Math.PI/2);mesh(fg,floorMat,0,p.floor.visualOffset,0,'interior-floor',false);
  const ceiling=new THREE.PlaneGeometry(p.floor.width,p.floor.depth);ceiling.rotateX(Math.PI/2);mesh(ceiling,lib.material('caihua_beam'),0,wallH-.03,0,'ceiling',false);
  for(const c of p.columns)mesh(new THREE.CylinderGeometry(c.radius,c.bottomRadius,c.height,12),lib.material('wood_column'),c.x,c.height/2,c.z,c.kind,true,{parameterStatus:c.status});
  box(p.width+.4,p.beamH,p.depth+.4,0,wallH+p.beamH/2,0,'caihua_beam','retained-upper-beam',false,true);
  if(p.localOutline) buildLocalOutline();
  group.userData={topY:p.height,colliders,ownedMaterials,structure:p.metadata};return group;

  function orientedBox(face,w,h,d,lateral,y,normal,material,part,collide=true,band=false){
    const alongZ=face.axis==='z',x=alongZ?lateral:normal,z=alongZ?normal:lateral;
    return box(alongZ?w:d,h,alongZ?d:w,x,y,z,material,part,collide,band,{geographicSide:face.side,parameterStatus:'PROVISIONAL_PREVIEW_NOT_SURVEYED'});
  }
  function buildShenwuFaces(){
    for(const face of p.faces){
      let cursor=-face.span/2;
      const solid=(a,b)=>{if(b-a<1e-8)return;
        orientedBox(face,b-a,wallH,T,(a+b)/2,wallH/2,face.sign*face.wallAxis,'wall_red','facade-wall');
        if(face.axis==='z')orientedBox(face,b-a,wallH*.9,p.veneer.thickness,(a+b)/2,wallH*.45,face.sign*(face.wallAxis+T/2+p.veneer.thickness/2),'lattice_doors','closed-lattice-panel',true,true);
      };
      for(const o of face.openings){
        solid(cursor,o.center-o.width/2);cursor=o.center+o.width/2;
        orientedBox(face,o.width,wallH-o.height,T,o.center,o.height+(wallH-o.height)/2,face.sign*face.wallAxis,'wall_red','door-lintel',false);
        for(const sign of [-1,1]){
          const lateral=o.center+sign*(o.width/2-.14),normal=face.sign*(face.wallAxis-T/2-o.leafWidth/2);
          // Open leaves run normal to their enclosure; material/type differs by face.
          orientedBox(face,o.leafThickness,o.height-.2,o.leafWidth,lateral,(o.height-.2)/2,normal,o.type==='lattice'?'lattice_doors':'wood_column',o.type==='lattice'?'open-lattice-leaf':'open-board-leaf',true,o.type==='lattice');
        }
        orientedBox(face,o.width,.2,T+.2,o.center,.1,face.sign*face.wallAxis,'wood_column','threshold',false);
      }
      solid(cursor,face.span/2);
    }
  }
  function buildLocalOutline(){
    const q=p.localOutline,t=q.railThickness;
    // A flush visible paving finish, not an invented elevated plinth/support.
    const paving=new THREE.PlaneGeometry(q.width,q.depth);paving.rotateX(-Math.PI/2);
    const slab=mesh(applyBoxUV(paving,lib.tileSize('stone_slab')),lib.material('stone_slab'),0,.02,0,'flat-local-paving',false,{parameterStatus:'FLAT_PREVIEW_RAISED_PLINTH_AND_STAIRS_DEFERRED'});slab.castShadow=false;
    for(const face of p.faces){
      const span=(face.axis==='z'?q.width:q.depth),normal=face.sign*((face.axis==='z'?q.depth:q.width)/2-t/2);
      let cursor=-span/2;
      const rail=(a,b)=>{if(b-a>0)orientedBox(face,b-a,q.railHeight,t,(a+b)/2,q.railHeight/2,normal,'balustrade','local-hall-balustrade',true,true);};
      const opening=q.accessGaps[face.side],half=opening.width/2;
      rail(cursor,opening.center-half);cursor=opening.center+half;
      rail(cursor,span/2);
    }
  }
}
