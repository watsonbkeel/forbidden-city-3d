import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/8218[1024].jpg';
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
/** Source-visible red lower panels and pale waisted front balusters only.
 * Existing span, rail level and fitted module count are retained. This is not
 * a measured carving, a new upper route, or evidence for the unseen rear. */
export function buildForiFrontBalustrade(c){
 const{p,f,kit}=c;
 if(p?.key!=='fori'||p.id!=='place-ningshou-2318b5f73b'||p.x!==-319.8||p.z!==513.3||p.localW!==11.5||p.localD!==8.9||p.ph!==.5||p.colH!==7||p.bays!==3||p.upperFloorY!==3.7||p.rot!==0||f?.parent!==kit?.root||kit.root.parent||f.matrixAutoUpdate!==true||kit.root.matrixAutoUpdate!==true||f.matrixWorldAutoUpdate!==true||kit.root.matrixWorldAutoUpdate!==true||f.position.x!==p.x||f.position.y!==0||f.position.z!==p.z||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||kit.root.position.lengthSq()||!kit.root.quaternion.equals(new T.Quaternion())||!kit.root.scale.equals(new T.Vector3(1,1,1))||!mutable(f.children)||!mutable(kit.colliders)||!mutable(kit.owned)||!Object.isExtensible(f.userData)||('foriFrontBalustrade' in f.userData)||f.children.some(m=>m.userData.role==='gallery-rail'||m.userData.r164ForiFront))throw Error('Exact mutable Fori front-rail source required, once only');
 const stage=new T.Group(),geometries=[],materials=[],contacts=[],w=p.localW-.2,z=-(p.localD-.2)/2,y=p.upperFloorY,n=Math.ceil(w/.65),step=w/n;
 stage.name='fori-source-fitted-front-balustrade';
 try{
  for(const[name,color]of[['red',0x8d3028],['pale',0xc9c7aa],['green',0x427568]])materials.push(new T.MeshStandardMaterial({name:`r164_fori_${name}_baluster_fit`,color,roughness:.82}));
  const add=(role,g,mat,x,yy,zz)=>{geometries.push(g);const m=new T.Mesh(g,materials[mat]);m.name=`r164-fori-front/${stage.children.length}/${role}`;m.userData={role,identity:p.id,r164ForiFront:true,dimensionStatus:'PHOTO_RELATIONSHIP_MODEL_FIT_NOT_SURVEYED'};m.position.set(x,yy,zz);m.castShadow=m.receiveShadow=true;stage.add(m);return m;};
  const box=(role,mat,ww,hh,dd,x,yy,zz)=>add(role,new T.BoxGeometry(ww,hh,dd),mat,x,yy,zz);
  box('red-handrail',0,w,.065,.08,0,y+.88,z);
  box('red-lower-cap',0,w,.10,.08,0,y+.30,z);
  for(let i=0;i<n;i++){const x=-w/2+(i+.5)*step,ww=step-.065;box('lower-panel',0,ww,.20,.08,x,y+.12,z);box('lower-panel-inset',2,ww-.06,.125,.008,x,y+.12,z-.044);}
  // Closed, deliberately simple waisted outline. This does not copy the
  // Fanhua geometry or claim that source-hidden counts/carving are identical.
  const outline=new T.Shape();outline.moveTo(-.085,0);outline.lineTo(.085,0);outline.lineTo(.095,.045);outline.quadraticCurveTo(.045,.12,.04,.23);outline.quadraticCurveTo(.065,.28,.135,.34);outline.quadraticCurveTo(.16,.38,.135,.42);outline.lineTo(.07,.46);outline.lineTo(-.07,.46);outline.lineTo(-.135,.42);outline.quadraticCurveTo(-.16,.38,-.135,.34);outline.quadraticCurveTo(-.065,.28,-.04,.23);outline.quadraticCurveTo(-.045,.12,-.095,.045);outline.closePath();
  for(let i=0;i<=n;i++){const x=-w/2+i*step;box('panel-divider',0,.065,.30,.08,x,y+.15,z);if(i===0||i===n)continue;const g=new T.ExtrudeGeometry(outline,{depth:.08,steps:1,curveSegments:5,bevelEnabled:false});geometries.push(g);g.scale(1,.50/.46,1);g.translate(0,0,-.04);geometries.pop();add('waisted-baluster',g,1,x,y+.35,z);}
  // Every physical registration uses that exact closed render geometry. No
  // old wide rectangle, invisible support or walkable is retained/introduced.
  stage.updateWorldMatrix(true,true);
  for(const m of stage.children){m.geometry.computeBoundingBox();const shape=triangleInstance(createTriangleTemplate(m.geometry),[p.x+m.position.x,m.position.y,p.z+m.position.z],m.name),b=shape.box.clone();b.triangleSupport=shape;b.r164ForiFront=true;b.r164ForiFrontMesh=m.name;contacts.push(b);}
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e;}
 const metadata={originalObjectId:'FC-2318B5F73B',source:'https://www.dpm.org.cn/explore/building/236573.html',photo:PHOTO,scope:'FRONT_UPPER_BALUSTRADE_ONLY',wholeObjectAccepted:false,surveyed:false,photoCountVerified:false,lowerPanels:n,waistedBalusters:n-1,modelSpan:w,retainedRailTop:y+.88+.065/2,newWalkables:0,newMapItems:0,upperAccess:'VIEW_ONLY_NO_NEW_STAIR',sourceSupported:['Red horizontal rails and lower framed panels','Pale waisted upper balusters visible in the building own photograph'],fitted:['Equal module counts, dimensions and simplified profile','Plain green inset fields instead of unreadable exact decoration','Uniform back/side colors; no independent hidden-face verification'],remaining:['Exact carving and painted ornament, photo-hidden end details','Whole building, east stair, current room inventory and visitor access','Browser/GPU/mobile visual acceptance and full World']};
 f.add(stage);kit.colliders.push(...contacts);kit.owned.push(...materials);f.userData.foriFrontBalustrade=metadata;return metadata;
}
