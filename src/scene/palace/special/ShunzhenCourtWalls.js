import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='shunzhen-low-court-walls';
const SOURCES=Object.freeze([
  'https://www.dpm.org.cn/lemmas/245113.html', // 承光门、两侧转折矮墙
  'https://www.dpm.org.cn/lemmas/245114.html', // 延和门
  'https://www.dpm.org.cn/lemmas/245115.html', // 集福门、北接宫墙及照片
  'https://www.dpm.org.cn/classify_detail/175908.html', // 东延和、西集福
  'https://img.dpm.org.cn/Uploads/File/2024/07/22/u669dd30a7f61c.pdf#page=4', // 御花园平面图 Fig. 1
]);
const rectangle=(half,lo,hi)=>[[-half,lo],[half,lo],[half,hi],[-half,hi]];

// Sweep a closed section on a plan polyline. One common miter per bend
// joins both adjacent pieces without coplanar roof strips or invisible corners.
function sweep(points,section,tile){
  const normals=[],distance=[0];
  for(let i=1;i<points.length;i++){
    const dx=points[i][0]-points[i-1][0],dz=points[i][1]-points[i-1][1],length=Math.hypot(dx,dz);
    normals.push([-dz/length,dx/length]);distance.push(distance.at(-1)+length);
  }
  const ring=points.map(([x,z],i)=>{
    const a=normals[Math.max(0,i-1)],b=normals[Math.min(i,normals.length-1)];
    const d=1+a[0]*b[0]+a[1]*b[1];
    return section.map(([q,y])=>[x+q*(a[0]+b[0])/d,y,z+q*(a[1]+b[1])/d]);
  });
  const profile=[0];
  for(let j=0;j<section.length;j++){
    const a=section[j],b=section[(j+1)%section.length];profile.push(profile.at(-1)+Math.hypot(b[0]-a[0],b[1]-a[1]));
  }
  const positions=[],uvs=[];
  const push=(p,u,v)=>{positions.push(...p);uvs.push(u/tile,v/tile);};
  for(let i=0;i<ring.length-1;i++)for(let j=0;j<section.length;j++){
    const k=(j+1)%section.length,a=ring[i][j],b=ring[i+1][j],c=ring[i+1][k],d=ring[i][k];
    const u=distance[i],v=distance[i+1],s=profile[j],t=profile[j+1];
    push(a,u,s);push(b,v,s);push(c,v,t);push(a,u,s);push(c,v,t);push(d,u,t);
  }
  const ends=T.ShapeUtils.triangulateShape(section.map(([x,y])=>new T.Vector2(x,y)),[]);
  for(const end of [0,ring.length-1])for(const [a,b,c] of ends){
    for(const k of end===0?[a,b,c]:[a,c,b])push(ring[end][k],...section[k]);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.computeVertexNormals();
  return geometry;
}

/** Missing enclosure only. Existing doors stay in the gameplay open state;
 * this game's approach, heights and thickness are a fit, not a site survey. */
export function buildShunzhenCourtWalls(kit){
  if(kit.root.name!=='garden')return;
  const at=(id,x,z)=>{
    const gate=kit.root.children.find(f=>f.userData.structure?.id===id);
    if(!gate?.position.equals(new T.Vector3(x,0,z)))throw Error('Shunzhen court walls require the retained gate '+id);
  };
  at('garden/shunzhen-gates',.5,518.3);
  at('chengguang-source-fit',.5,513);
  at('yanhe-source-fit',-13.3,514.4);
  at('jifu-source-fit',13.3,514.4);

  // Palace Museum plan: north returns reach the retained north wall, the
  // south arms turn in, then shallow jogs toward Chengguang's southern face.
  // End caps overlap a few cm INTO the old masonry, never into the aperture.
  const arms=[
    ['east-front',[[-13.3,512.96],[-13.3,513.48],[-4.11,513.48],[-3.03,513],[-1.52,513]]],
    ['west-front',[[13.3,512.96],[13.3,513.48],[5.11,513.48],[4.03,513],[2.52,513]]],
    ['east-return',[[-13.3,516.36],[-13.3,517.83]]],
    ['west-return',[[13.3,516.36],[13.3,517.83]]],
  ];
  const stone=kit.lib.material('stone_slab'),red=kit.lib.material('wall_red');
  const ochre=kit.lib.material('roof_tile').clone();
  ochre.name='shunzhen-court-ochre-glazed-cap';ochre.color.setHex(0x998361);ochre.roughness=.67;
  const green=new T.MeshStandardMaterial({name:'shunzhen-court-green-eave-trim',color:0x436251,roughness:.68});
  kit.owned.push(ochre,green);
  for(const [arm,points] of arms){
    const name=ID+'-'+arm,frame=kit.frame(0,0);
    frame.name=name;frame.userData.shunzhenCourtWall=name;
    if(arm==='east-front')frame.userData.structure={id:ID,sources:SOURCES,dimensionStatus:'ENGINEERING_FIT_NOT_SURVEY',siteAccessVerified:false};
    const render=(part,section,material,tile)=>{
      const m=kit.mesh(frame,sweep(points,section,tile),material,0,0,0);m.name=name+'/'+part;
    };
    render('stone-foot',rectangle(.18,0,.23),stone,kit.lib.tileSize('stone_slab'));
    render('red-masonry',rectangle(.18,.23,2.13),red,kit.lib.tileSize('wall_red'));
    render('green-eaves',rectangle(.31,2.13,2.25),green,1);
    render('ochre-cap',[[-.32,2.25],[.32,2.25],[.32,2.35],[0,2.62],[-.32,2.35]],ochre,kit.lib.tileSize('roof_tile'));
    // A single closed owner follows the exposed faces (including the pitched
    // cap). A landing from above contacts the real tile slope, not an interior
    // horizontal masonry proxy. No separate walkable or rescue registration.
    const body=sweep(points,[[-.18,0],[.18,0],[.18,2.13],[.31,2.13],[.31,2.25],
      [.32,2.25],[.32,2.35],[0,2.62],[-.32,2.35],[-.32,2.25],[-.31,2.25],[-.31,2.13],[-.18,2.13]],1);
    let shape;
    try{shape=triangleInstance(createTriangleTemplate(body),[0,0,0],name);}
    finally{body.dispose();}
    const collider=shape.box.clone();collider.triangleSupport=shape;collider.shunzhenCourtWall=name;
    kit.colliders.push(collider);
  }
}
