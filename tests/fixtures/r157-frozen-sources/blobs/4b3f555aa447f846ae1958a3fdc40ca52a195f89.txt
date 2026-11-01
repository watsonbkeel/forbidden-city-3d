import {registerQianqingTerraceSurface} from './QianqingAssemblyPhysics.js';
import * as THREE from 'three';
import {mergeByMaterial} from '../../utils/MergeUtils.js';
export const QIANQING_TERRACE_BURNERS=Object.freeze({id:'qianqing-front-terrace-burners',xs:Object.freeze([-16.2,-6.5,6.5,16.2]),z:300,source:'https://www.dpm.org.cn/explore/building/236472.html',photo:'https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997affc5961.jpg',dimensionStatus:'PHOTO_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEY',unknown:['exact metric placement','foot carving and count','animal finial identity','inscriptions']});
/** Four museum-documented principal silhouettes. No invented lettering or dragon
 * relief. Shared bounded template; feet/ears are simplified engineering forms. */
export function installQianqingTerraceBurners(builder,hall){
 if(hall.getObjectByName(QIANQING_TERRACE_BURNERS.id))throw Error('Duplicate Qianqing terrace group');
 hall.updateWorldMatrix(true,true);
 const probe=new THREE.Raycaster(new THREE.Vector3(6.5,3,300),new THREE.Vector3(0,-1,0));
 const hit=probe.intersectObject(hall,true).find(h=>h.object.material?.name==='qianqing-front-stone-r31');
 if(!hit||Math.abs(hit.point.y-2.02)>1e-6)throw Error('Actual retained Qianqing terrace top must be present');
 const mat=builder.ownMat('r112-qianqing-terrace-gilt',{name:'r112-qianqing-terrace-gilt',color:0xa98d46,roughness:.48,metalness:.55}),raw=new THREE.Group();
 const add=(g,x=0,y=0,z=0)=>{const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;raw.add(m);return m;};
 const lathe=points=>add(new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),12));
 for(let i=0;i<3;i++){const a=(i+.5)*Math.PI*2/3;add(new THREE.BoxGeometry(.14,.28,.14),Math.cos(a)*.30,.14,Math.sin(a)*.30);}
 lathe([[0,.24],[.34,.24],[.41,.34],[.49,.54],[.48,.74],[.39,.88],[.34,.91],[.34,1.02],[0,1.02]]);
 lathe([[0,1.01],[.50,1.01],[.52,1.07],[.43,1.12],[.32,1.27],[.10,1.37],[0,1.37]]);
 lathe([[0,1.35],[.09,1.35],[.12,1.43],[.075,1.52],[0,1.59]]);
 for(const s of[-1,1]){const ear=add(new THREE.TorusGeometry(.16,.035,5,10),s*.47,.91,0);ear.rotation.y=Math.PI/2;}
 const template=mergeByMaterial(raw,{name:'r112-qianqing-burner-template'}),root=new THREE.Group();root.name=QIANQING_TERRACE_BURNERS.id;
 for(let i=0;i<4;i++){const instance=template.clone(true);instance.name='qianqing-terrace-burner-'+i;instance.position.set(QIANQING_TERRACE_BURNERS.xs[i],hit.point.y,QIANQING_TERRACE_BURNERS.z);instance.userData={...QIANQING_TERRACE_BURNERS,instanceId:instance.name,supportSource:'actual-finished-retained-terrace-ray',supportY:hit.point.y};root.add(instance);}
 hall.add(root);hall.updateWorldMatrix(true,true);for(const instance of root.children)registerQianqingTerraceSurface(builder,instance,instance.name);return root;
}
