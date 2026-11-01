import * as THREE from 'three';

// Only the exact retained runtime placement opts in; reusable/rotated SideGate fixtures stay unchanged.
export const isLongzongHallFrontFit = g => g.profile === 'longzong' && g.x === 110.7 && g.z === 173.7 && g.rot === 3 * Math.PI / 2;

function sameBox(mesh, w, h, d, x, y, z) {
  if (!mesh || mesh.position.distanceTo(new THREE.Vector3(x,y,z)) > 1e-10 ||
      mesh.rotation.x || mesh.rotation.y || mesh.rotation.z || !mesh.scale.equals(new THREE.Vector3(1,1,1))) return false;
  const expected = new THREE.BoxGeometry(w,h,d).toNonIndexed();
  const p=mesh.geometry.attributes.position, q=expected.attributes.position;
  const valid=!mesh.geometry.index && p?.count===q.count && p.array.every((v,i)=>v===q.array[i]);
  expected.dispose(); return valid;
}

/** Original procedural fitting, not an official photograph or measured ornament. */
export function buildLongzongHallFrontFit(kit, f, g, renderBoxes) {
  if (!isLongzongHallFrontFit(g)) return false;
  const front=-g.depth/2, bottom=g.platformY+.85, height=g.columnH-1.65;
  const bars=f.children.filter(m=>m.userData.role==='gate-window-bar'&&m.position.z===front);
  const expected=[];
  for(const bay of [0,4]) {
    const clear=g.bayWidths[bay]-2*g.radius,cx=g.bayCenters[bay];
    for(let j=1;j<12;j++)expected.push([.045,height,.14,cx-clear/2+j*clear/12,bottom+height/2,front]);
    for(let j=1;j<8;j++)expected.push([clear,.045,.14,cx,bottom+j*height/8,front]);
  }
  // Validate every deletion before any mutation; never silently remove changed sources.
  if(bars.length!==36 || bars.some((m,i)=>!sameBox(m,...expected[i]) || !renderBoxes.includes(m) || m.material!==kit.lib.material('wood_column')))
    throw new Error('Longzong front-window source mismatch');
  const beams=f.children.filter(m=>m.userData.role==='gate-painted-beam');
  const lintels=f.children.filter(m=>m.userData.role==='gate-door-lintel');
  const heads=f.children.filter(m=>m.userData.role==='gate-window-head'&&m.position.z===front);
  if(beams.length!==6||lintels.length!==3||heads.length!==2)throw new Error('Longzong beam source mismatch');
  const owners=[...beams,...lintels,...heads];
  const dimensions=[...g.columnZs.map(()=>[g.width+.4,.65,.48]),[.48,.65,g.depth+.4],[.48,.65,g.depth+.4],
    ...g.portals.map(p=>[p.clearWidth,.65,.35]),...heads.map(()=>[g.bayWidths[0],.5,.48])];
  const positions=[...g.columnZs.map(z=>[0,g.platformY+g.columnH-.325,z]),...[-1,1].map(s=>[s*g.width/2,g.platformY+g.columnH-.325,0]),...g.portals.map(p=>[p.centerX,g.platformY+g.columnH-.675,g.doorZ]),...g.bayCenters.filter((_,i)=>i===0||i===4).map(x=>[x,g.platformY+g.columnH-.9,front])];
  if(owners.some((m,i)=>!sameBox(m,...dimensions[i],...positions[i]) || m.material!==kit.lib.material('caihua_beam')))throw new Error('Longzong beam source mismatch');

  const palette=['#193d53','#367566','#111e22','#91a28a','#c5a352'].map((color,i)=>{
    const material=new THREE.MeshStandardMaterial({color,roughness:.86,polygonOffset:true,polygonOffsetFactor:-1-i,polygonOffsetUnits:-1-i});
    material.name=`longzong-fitted-paint-${i}`;kit.owned.push(material);return material;
  });
  const greenDisk=palette[1].clone();greenDisk.name='longzong-fitted-paint-green-inner-disk';
  greenDisk.polygonOffsetFactor=-3.5;greenDisk.polygonOffsetUnits=-3.5;kit.owned.push(greenDisk);
  function patch(ownerIndex, axis, sign, u, v, width, tall, color, disk=false) {
    const owner=owners[ownerIndex];owner.geometry.computeBoundingBox();
    const plane=owner.position[axis]+owner.geometry.boundingBox[sign>0?'max':'min'][axis];
    const geo=disk?new THREE.CircleGeometry(width/2,12):new THREE.PlaneGeometry(width,tall);
    const m=kit.mesh(f,geo,disk&&color===1?greenDisk:palette[color],axis==='z'?u:plane,v,axis==='z'?plane:u);
    if(axis==='z'&&sign<0)m.rotation.y=Math.PI;
    if(axis==='x')m.rotation.y=sign*Math.PI/2;
    m.castShadow=false;m.name='longzong-fitted-beam-paint';
    m.userData.longzongPaint={ownerIndex,axis,sign,plane,style:'simplified ink-line large-gold-dot spiral; not measured'};
  }
  owners.forEach((owner,index)=>{
    const side=index===4||index===5,axis=side?'x':'z',sign=side?-Math.sign(owner.position.x):-1;
    const spans=index<4?g.bayWidths.map((w,i)=>[g.bayCenters[i],w-.18]):side?
      g.columnZs.slice(1).map((z,i)=>[(z+g.columnZs[i])/2,z-g.columnZs[i]-.12]):[[owner.position.x,dimensions[index][0]-.12]];
    const y=owner.position.y,H=dimensions[index][1]-.06;
    for(const [u,W] of spans){
      patch(index,axis,sign,u,y,W,H,0);
      patch(index,axis,sign,u,y,W*.62,H*.7,1);
      // True thin strokes, not filled gold rectangles hiding the blue/green fields.
      for(const s of [-1,1]) {
        patch(index,axis,sign,u,y+s*H*.39,W*.94,.018,3);
        patch(index,axis,sign,u+s*W*.32,y,.018,H*.76,2);
        const c=u+s*W*.405;
        patch(index,axis,sign,c,y,H*.7,H*.7,2,true);
        patch(index,axis,sign,c,y,H*.57,H*.57,1,true);
        for(let k=0;k<6;k++)patch(index,axis,sign,c+Math.cos(k*Math.PI/3)*H*.18,y+Math.sin(k*Math.PI/3)*H*.18,H*.12,H*.12,3,true);
        patch(index,axis,sign,c,y,H*.16,H*.16,4,true);
      }
    }
  });
  for(const bar of bars){f.remove(bar);renderBoxes.splice(renderBoxes.indexOf(bar),1);bar.geometry.dispose();}
  for(const bay of [0,4]){
    const clear=g.bayWidths[bay]-2*g.radius,cx=g.bayCenters[bay],W=clear/4;
    for(let leaf=0;leaf<4;leaf++){
      const group=new THREE.Group();group.name='longzong-front-window-leaf';group.userData.longzongWindowLeaf={bay,leaf,fittedGrid:true};f.add(group);
      const center=cx-clear/2+(leaf+.5)*W;
      const bar=(w,h,x,y)=>{const m=kit.box(group,'wood_column',w,h,.055,x,y,front-.055);m.userData.role='longzong-front-leaf-wood';renderBoxes.push(m);};
      for(const s of [-1,1]){bar(.065,height,center+s*(W-.065)/2,bottom+height/2);bar(W,.075,center,bottom+(s+1)*height/2-s*.0375);}
      for(let c=1;c<4;c++)bar(.028,height-.15,center-W/2+c*W/4,bottom+height/2);
      for(let r=1;r<8;r++)bar(W-.13,.028,center,bottom+r*height/8);
    }
  }
  f.userData.longzongHallFrontFit={wholeObjectAccepted:false,frontWindows:2,leavesPerWindow:4,beamOwners:11,
    source:'https://www.dpm.org.cn/explore/building/236496.html',photos:['7900.jpg','8289.jpg','3902[1024].jpg'],
    limits:'Source-supported layout and fitted paint; no measured carving, complete reverse, Manchu, GPU or whole-building acceptance.'};
  return true;
}
