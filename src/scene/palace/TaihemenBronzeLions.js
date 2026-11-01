import * as T from 'three';
import {withTaihemenCandidateTransaction} from './TaihemenObservedTransaction.js';

// Taihemen's own 2020-published photographs and the Museum's size sheet p97.
// Plan positions are rounded source registrations, not a modern site survey.
// The measured 2.355 m lion + .635 m bronze base EXCLUDES the stone plinth.
// Curl count, relief, stone height and individual anatomy are game-scale fits.
const scale=48.06/827;
export const TAIHEMEN_BRONZE_LIONS=Object.freeze([
 {side:'east',sex:'male',motif:'ball',pixel:[1306,1085]},
 {side:'west',sex:'female',motif:'cub',pixel:[623,1085]},
].map(p=>Object.freeze({...p,pixel:Object.freeze(p.pixel),
 id:`AUX-FC-B3B12CF397-LION-${p.side.toUpperCase()}`,
 x:(962.5-p.pixel[0])*scale,z:-224.47+(757-p.pixel[1])*scale,
 sourceIds:Object.freeze(['T-DRAW-06','T-BRONZE-LION-MEASURES',p.side==='east'?'T-CLOSE-3':'T-CLOSE-4']),
 bronzeHeight:2.99,stoneHeight:1.10,accepted:false,
 shapeStatus:'OWN_PHOTOGRAPH_GAME_SCALE_SILHOUETTE_NOT_ORNAMENT_REPLICA',
})));

export function buildTaihemenBronzeLions(builder,parent){
 if(parent?.name!=='太和门'||!builder?.library||typeof builder.col!=='function'||typeof builder.ownMat!=='function'||builder.ox!==0||builder.oz!==0)throw Error('Taihemen lions need their world-origin Taihemen host');
 if(TAIHEMEN_BRONZE_LIONS.some(p=>parent.getObjectByName(p.id)||parent.userData.architecture?.some(a=>a.id===p.id)))throw Error('Taihemen lions already installed');
 return withTaihemenCandidateTransaction(builder,parent,{},()=>{
  const bronze=builder.ownMat('taihemen-lion-patinated-bronze',{name:'taihemen-lion-patinated-bronze',color:0x3e6c5a,metalness:.58,roughness:.64});
  const dark=builder.ownMat('taihemen-lion-dark-bronze',{name:'taihemen-lion-dark-bronze',color:0x233c31,metalness:.5,roughness:.7});
  const stone=builder.library.material('marble');
  return TAIHEMEN_BRONZE_LIONS.map(p=>{
   const g=new T.Group();g.name=p.id;g.position.set(p.x,0,p.z);g.userData.structure={id:p.id,entityId:'FC-B3B12CF397',profile:structuredClone(p),accepted:false,source:'OWN_TAIHEMEN_PAIR'};parent.add(g);
   // Shared low-poly curved geometry is adequate at the ordinary route distance.
   let sphere;
   const put=(geo,mat,role,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.name=p.id+':'+role;m.userData.lionPart=role;m.castShadow=m.receiveShadow=true;g.add(m);return m;};
   const ellipse=(role,x,y,z,sx,sy,sz,mat=bronze)=>{sphere??=new T.SphereGeometry(1,12,8);const m=put(sphere,mat,role,x,y,z);m.scale.set(sx,sy,sz);return m;};
   const box=(role,w,h,d,y,mat=stone)=>put(new T.BoxGeometry(w,h,d),mat,role,0,y,0);
   const block=(w,h,d,y,x=0,z=0)=>{builder.col(p.x+x-w/2,y-h/2,p.z+z-d/2,p.x+x+w/2,y+h/2,p.z+z+d/2);const c=builder.colliders.at(-1);c.structureId=p.id;c.taihemenLionSource=p.id;};
   for(const [w,h,d,y]of[[2.55,.18,3.22,.09],[2.42,.18,3.08,.27],[2.16,.40,2.82,.56],[2.40,.16,3.07,.84],[2.55,.18,3.22,1.01]]){box('stone-plinth',w,h,d,y);block(w,h,d,y);}
   const base=p.stoneHeight,top=base+.635;
   for(const[w,h,d,y]of[[2.035,.12,2.765,base+.06],[1.87,.395,2.60,base+.3175],[2.035,.12,2.765,base+.575]])box('bronze-pedestal',w,h,d,y,bronze);
   block(2.035,.635,2.765,base+.3175);
   // Frontal hanging cloth distinguishes the pedestal from an ordinary box.
   const cloth=new T.Shape();cloth.moveTo(-.48,0);cloth.lineTo(.48,0);cloth.lineTo(0,-.47);cloth.closePath();
   const clothGeo=new T.ExtrudeGeometry(cloth,{depth:.035,bevelEnabled:false});
   put(clothGeo,bronze,'hanging-cloth',0,top+.015,-1.41);
   // Seated anatomy: broad haunches, upright chest, forward forelegs, heavy mane.
   ellipse('haunch',0,top+.48,.42,.68,.50,.69);
   ellipse('body',0,top+.92,.18,.55,.83,.58);
   ellipse('chest',0,top+1.12,-.24,.66,.58,.48);
   for(const side of[-1,1]){ellipse('hind-leg',side*.56,top+.36,.48,.28,.41,.40);ellipse('hind-paw',side*.65,top+.10,.21,.28,.13,.32);}
   // Facing south (-Z), the motif and raised paw are on the central-axis side:
   // the east male's west (+X) side; the west female's east (-X) side.
   const raised=p.side==='east'?1:-1;
   for(const side of[-1,1]){
    const lift=side===raised?.26:0;
    const leg=ellipse('foreleg',side*.47,top+.49+lift/2,-.47,.20,.47-lift/2,.24);leg.rotation.x=-.14;
    ellipse('paw',side*.47,top+.11+lift,-.64,.28,.14,.32);
    for(let i=0;i<4;i++)ellipse('claw',side*.47+(i-1.5)*.12,top+.09+lift,-.88,.065,.085,.09);
   }
   ellipse('mane',0,top+1.67,.01,.64,.69,.51);
   ellipse('head',0,top+1.75,-.32,.50,.47,.43);
   // A few broad curls, not invented source-exact hair counts or relief.
   for(let row=0;row<3;row++)for(let i=0;i<11;i++){
    const a=(i-5)*Math.PI/10,r=.56-row*.035;
    ellipse('mane-curl',Math.sin(a)*r,top+1.63+Math.cos(a)*(.61-row*.04),.10-row*.19,.13,.13,.12);
   }
   for(const side of[-1,1]){
    ellipse('ear',side*.43,top+1.96,-.24,.17,.21,.11);
    ellipse('ear-hollow',side*.43,top+1.98,-.33,.085,.13,.035,dark);
    ellipse('brow',side*.20,top+1.89,-.66,.23,.12,.13).rotation.z=side*.20;
    ellipse('eye',side*.20,top+1.81,-.745,.085,.055,.04,dark);
    ellipse('muzzle',side*.18,top+1.57,-.72,.25,.17,.22);
   }
   ellipse('open-mouth',0,top+1.42,-.705,.34,.11,.15,dark);
   ellipse('lower-jaw',0,top+1.32,-.68,.34,.10,.20);
   ellipse('nose',0,top+1.66,-.88,.18,.09,.095,dark);
   // Bronze teeth remain bronze; no bright white toy-like additions.
   for(const x of[-.24,.24])ellipse('canine',x,top+1.41,-.82,.04,.095,.045);
   const collar=put(new T.TorusGeometry(.52,.065,6,20,Math.PI*1.1),bronze,'collar',0,top+1.13,-.47);collar.rotation.z=Math.PI*.95;
   ellipse('bell',0,top+.82,-.73,.13,.17,.12);ellipse('bell-loop',0,top+1.01,-.70,.06,.08,.04,dark);
   const tailCurve=new T.CatmullRomCurve3([new T.Vector3(.45,top+.4,.77),new T.Vector3(.63,top+.8,.86),new T.Vector3(.47,top+1.23,.62),new T.Vector3(.31,top+1.2,.67)]);
   put(new T.TubeGeometry(tailCurve,12,.085,6,false),bronze,'tail',0,0,0);
   if(p.motif==='ball'){
    ellipse('ball',.47,top+.21,-.65,.25,.25,.25);
    for(const rot of[0,Math.PI/2]){const ring=put(new T.TorusGeometry(.245,.018,5,12),dark,'ball-band',.47,top+.21,-.65);ring.rotation.y=rot;}
   }else{
    ellipse('cub-body',-.48,top+.13,-.67,.28,.14,.32);
    ellipse('cub-head',-.48,top+.20,-.92,.18,.17,.17);
    for(const x of[-.35,-.61])ellipse('cub-ear',x,top+.32,-.92,.065,.07,.05);
    for(const x of[-.35,-.61])ellipse('cub-paw',x,top+.07,-1.04,.075,.06,.10);
   }
   // The solid base is the route blocker; bounded torso/head records also make
   // elevated contact possible without an invisible full-height corridor wall.
   block(1.42,1.13,1.42,top+.565,0,.12);
   block(1.30,1.16,1.10,top+1.77,0,-.04);
   return g;
  });
 });
}
