/** Default-off source-footprint solid study. Not imported by Enclosure.
 * Only two south-wall masonry bodies and two corner platforms are represented.
 * No gate/tower roof, crenels, northern extension, hidden floor or collision is
 * fabricated. Height10m is retained engineering, NOT an OSM-height adoption.
 */
import * as T from 'three';
import source from './wumen-southern-source.json' with {type:'json'};
import {applyBoxUV} from '../../../../src/utils/GeometryUV.js';
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
export const SOUTHERN_ENVELOPE_SOURCE=freeze(source);
export function buildSouthernEnvelopeCandidate({material,tileSize}={}){
 if(!material?.isMaterial)throw new TypeError('Borrowed wall material required');
 if(!Number.isFinite(tileSize)||tileSize<=0)throw new RangeError('Positive finite tileSize required');
 const group=new T.Group();group.name='wumen-southern-envelope-source-solid-study';
 group.userData={runtimeEnabled:false,wholeObjectAccepted:false,heightBasis:'RETAINED_ENGINEERING_10M_NOT_OSM_TAGS',scope:'TWO_SOUTH_WALL_BODIES_AND_TWO_CORNER_PLATFORMS_ONLY',sourceSHA256:source.sourceSHA256,missing:['wall-cap-and-crenel-interface','corner-tower-placement-and-forms','east-west-southern-wall-junctions','wumen-ascent-terminal','physics-and-routes','photo-camera-and-GPU']};
 const ownedGeometries=[];
 for(const p of source.parts){
  // XY outline maps to world XZ, positive extrusion to +Y, with no scaling.
  const shape=new T.Shape(p.points.slice(0,-1).map(([x,z])=>new T.Vector2(x,-z)));
  let geometry=new T.ExtrudeGeometry(shape,{depth:10,steps:1,bevelEnabled:false,curveSegments:1});geometry.rotateX(-Math.PI/2);geometry.clearGroups();geometry=applyBoxUV(geometry,tileSize);ownedGeometries.push(geometry);
  const mesh=new T.Mesh(geometry,material);mesh.name=p.role;mesh.castShadow=mesh.receiveShadow=true;mesh.userData={sourceWay:p.way,sourceRole:p.role,candidateOnly:true};group.add(mesh);
 }
 let disposed=false;return{group,ownedGeometries,ownedMaterials:[],colliders:[],walkables:[],dispose(){if(disposed)return;disposed=true;for(const g of ownedGeometries)g.dispose();}};
}
