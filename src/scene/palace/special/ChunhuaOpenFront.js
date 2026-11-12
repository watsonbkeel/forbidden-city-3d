import * as T from 'three';
export function createChunhuaFront(){
 const group=new T.Group(),geometries=[],materials=[],contacts=[];let disposed=false;
 const mat=(name,color)=>{const m=new T.MeshStandardMaterial({color,roughness:.85});m.name=name;materials.push(m);return m;};
 const red=mat('chunhua-fit-red',0x8b352b),gold=mat('chunhua-fit-yellow',0xb59034),stone=mat('chunhua-fit-stone',0x99948a);
 const box=(name,w,h,d,x,y,z,m,rx=0)=>{const g=new T.BoxGeometry(w,h,d);geometries.push(g);const mesh=new T.Mesh(g,m);mesh.name=name;mesh.position.set(x,y,z);mesh.rotation.x=rx;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);mesh.updateMatrixWorld(true);const c=new T.Box3().setFromObject(mesh);c.chunhuaFrontProxy=true;contacts.push(c);return mesh;};
 for(const x of[-3.25,3.25]){box('isolated-stone-foot',1.4,.24,2.3,x,.12,0,stone);box('closed-red-support',1.2,4.2,1.6,x,2.34,0,red);}
 box('high-open-span-beam',7.7,.5,1.65,0,4.55,0,red);
 const rise=.8,halfDepth=1.85,angle=Math.atan2(rise,halfDepth),slope=Math.hypot(rise,halfDepth);
 box('fitted-south-roof-slope',9.9,.18,slope,0,5.15,-halfDepth/2,gold,-angle);
 box('fitted-north-roof-slope',9.9,.18,slope,0,5.15,halfDepth/2,gold,angle);
 box('plain-fitted-ridge',9.3,.18,.22,0,5.6,0,gold);
 group.name='chunhua-open-front';group.userData.structure={id:'chunhua-open-front',sourceObjectId:'FC-98F5C6BC6B',name:'春华门有限开口南前沿',alias:'凝华门',dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',source:'https://www.dpm.org.cn/classify_detail/261959.html',layoutSHA256:'02038c8f9a19942594f12715654c47dfbd2dca841e39ac155f755a65e6ddac95',supported:['own named layout: south of Yuhua, distinct from northern Zhaofu'],fitted:['all position dimensions primitive roof slopes colors and support design','open passage is gameplay choice, not present gateleaf state'],oldD1Center:[212.2,304.4],proposedCenter:[216,304.4],oldD1Envelope:[9.9,3.7],wallConnected:false,wholeObjectAccepted:false,interiorImplemented:false,photoMaterial:false,newRooms:0,newMapItems:0,centralClearWidth:3.6,centralClearHeight:3.5};
 const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();};
 return{group,geometries,materials,contacts,dispose};
}
