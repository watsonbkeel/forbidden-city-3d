import * as T from 'three';
// A detached five-bay front fragment. No production location or full roof claim.
export function createChunxiFrontFragment({enabled=false}={}){
 if(typeof enabled!=='boolean')throw Error('Explicit boolean');if(!enabled)return null;
 const group=new T.Group();group.name='chunxi-five-bay-front-fragment';const materials=[],geometries=[];let disposed=false;
 const mat=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.9});materials.push(m);return m;};
 const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());};
 try{
 const red=mat('chunxi-red-fit',0x903f32),dark=mat('chunxi-window-opaque-fit',0x363e3c),stone=mat('chunxi-stone-fit',0x99958a),gold=mat('chunxi-yellow-eave-fit',0xb99438),paint=mat('chunxi-muted-beam-fit',0x42665c);
 const box=(role,w,h,d,x,y,z,m)=>{const g=new T.BoxGeometry(w,h,d);geometries.push(g);const mesh=new T.Mesh(g,m);mesh.name=role;mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;};
 for(const x of[-6.25,6.25])box('side-platform-fragment',8.5,.4,2.8,x,.2,0,stone);
 // Five equal bays are an explicit metric fit; five-bay count is textual evidence.
 for(let j=0;j<6;j++)box('front-column-'+j,.32,4.5,.34,-10+4*j,2.65,0,red);
 for(let j=0;j<5;j++){
  const x=-8+4*j;
  if(j===2){/* Explicit open gameplay door pose; no threshold or ground change. */}
  else {box('sill-wall-'+j,3.68,1.05,.25,x,.925,.16,stone);box('opaque-sill-window-'+j,3.68,2.85,.16,x,2.875,.16,dark);for(const dx of[-1.75,0,1.75])box('window-frame-'+j+'-'+dx,.1,2.85,.12,x+dx,2.875,.03,red);for(const y of[1.45,4.3])box('window-crossbar-'+j+'-'+y,3.68,.12,.12,x,y,.03,red);}
  box('upper-beam-field-'+j,3.7,.45,.4,x,4.65,0,paint);
 }
 // Closed wedge is ONLY a cropped front roof slope, not a complete xieshan roof.
 const v=[[-10.8,4.95,-1.4],[10.8,4.95,-1.4],[10.8,6.1,1.4],[-10.8,6.1,1.4],[-10.8,4.75,-1.4],[10.8,4.75,-1.4],[10.8,5.9,1.4],[-10.8,5.9,1.4]],faces=[[0,1,2,3],[7,6,5,4],[4,5,1,0],[3,2,6,7],[4,0,3,7],[1,5,6,2]],positions=[];
 for(const [a,b,c,d]of faces)for(const i of[a,b,c,a,c,d])positions.push(...v[i]);const roof=new T.BufferGeometry();roof.setAttribute('position',new T.Float32BufferAttribute(positions,3));roof.computeVertexNormals();geometries.push(roof);const mesh=new T.Mesh(roof,gold);mesh.name='CROPPED_FRONT_ROOF_SLOPE_NOT_FULL_XIESHAN';group.add(mesh);
 group.userData.structure={id:group.name,sourceObjectId:'FC-A3C1FC5AE6',name:'春禧殿五间南前段',defaultEnabled:false,productionIntegrated:false,placement:'D1_SOURCE_COORDINATE_LIMITED_FRONT_AT_276_333_65_NOT_SURVEY',wholeObjectAccepted:false,sourceSupported:['south facing','five bays','central door and four sill-window bays','yellow glazed single-eave xieshan textual roof taxonomy'],completeRoofImplemented:false,historicalBayCount:5,metricBaySpacing:'EQUAL_4M_ENGINEERING_FIT_NOT_SURVEY',fit:['all sizes/colors and window divisions','open central gameplay door pose and opaque side glazing','cropped front slope, not completed roof taxonomy'],unknown:['full rear body and juandian connection','exact present facade/carpentry/paint','old estimated Shouan entry coordinate conflicts with D1 front/rear topology'],newRooms:0,newMapItems:0,newTravelTargets:0,photosUsedAsTexture:false};
 return{group,materials,geometries,dispose};
 }catch(e){dispose();throw e;}
}
