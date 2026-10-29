import * as THREE from 'three';
// Own official south exterior and explicit three/six central leaf description.
// Retained fit dimensions; no invented imperial seats or current exhibition.
export function buildYueshiSouthFront(c){
 const{p,box}=c,w=p.localW,bw=w/5,front=-p.localD/2+p.gallery,outer=-p.localD/2,h0=p.upperFloorY-p.ph-.35,h1=p.ph+p.colH-p.upperFloorY-.35;
 function rect(role,mat,x,y,z,ww,hh,t=.065){for(const s of[-1,1]){box(role,mat,t,hh,.065,x+s*(ww-t)/2,y,z);box(role,mat,ww,t,.065,x,y+s*(hh-t)/2,z);}}
 for(const upper of[false,true]){const y=upper?p.upperFloorY:p.ph,h=upper?h1:h0;
  for(let i=0;i<5;i++){
   const x=-w/2+(i+.5)*bw,pw=bw-.16;
   if(i===2){
    const dw=Math.min(pw-.14,3.2),dh=Math.min(3.2,h-.35);
    if(!upper){
     for(const s of[-1,1]){box('yueshi-south-door-jamb','red',.11,dh,.16,x+s*(dw/2+.06),y+dh/2,front,true);const fill=(pw-dw)/2-.03;box('yueshi-south-door-filler','red',fill,h,.15,x+s*(dw/2+(pw-dw)/4),y+h/2,front,true);}
     for(let n=0;n<3;n++){const sign=n===0?-1:1,xx=sign*(dw/2+.17+(n===2?.13:0)),zz=front+.35;box('yueshi-south-open-leaf','red',.08,dh,.64,xx,y+dh/2,zz,true);box('yueshi-south-leaf-glass','glass',.014,dh-.45,.49,xx-sign*.05,y+dh/2+.1,zz);}
     box('yueshi-south-door-lintel','red',dw+.24,.18,.18,x,y+dh+.09,front,true);
     const th=h-dh-.18;if(th>0)box('yueshi-south-door-transom','red',dw,th,.14,x,y+dh+.18+th/2,front,true);
    }else for(let n=0;n<6;n++){const cell=pw/6,xx=x-pw/2+(n+.5)*cell;box('yueshi-south-upper-leaf','red',cell-.025,h,.14,xx,y+h/2,front,true);box('yueshi-south-upper-leaf-glass','glass',cell-.11,h*.62,.025,xx,y+h*.64,front-.085);rect('yueshi-south-upper-leaf-frame','red',xx,y+h*.64,front-.12,cell-.08,h*.62+.04);for(let k=1;k<5;k++)box('yueshi-south-upper-leaf-grid','red',cell-.12,.026,.035,xx,y+h*.35+k*h*.57/5,front-.14);}
   }else{
    const sill=.62,split=sill+(h-sill)*.57,top=h-.12;box('yueshi-south-sill','brick',pw,sill,.2,x,y+sill/2,front,true);
    for(const s of[-1,1]){const xx=x+s*pw/4,ww=pw/2-.07;
     box('yueshi-south-window-lower-field','glass',ww,split-sill-.07,.055,xx,y+(sill+split)/2,front,true);
     rect('yueshi-south-window-frame','red',xx,y+(sill+split)/2,front-.065,ww+.03,split-sill);
     box('yueshi-south-window-upper-field','glass',ww,top-split-.06,.055,xx,y+(split+top)/2,front,true);
     rect('yueshi-south-window-frame','red',xx,y+(split+top)/2,front-.065,ww+.03,top-split);
     // Two interlocking plain stepped rectangles, not original exact lattice.
     for(const k of[-1,1])rect('yueshi-south-step-grid','red',xx+k*ww*.19,y+(split+top)/2,front-.12,ww*.54,(top-split)*.67,.025);
    }
   }
  }
 }
 // Continuous front upper viewing rail, no new upper navigation.
 const ry=p.upperFloorY,rz=outer+.1;
 for(const yy of[.22,.86])box('yueshi-south-rail','red',w-.2,.075,.1,0,ry+yy,rz,true);
 for(let i=0;i<=15;i++){const x=-(w-.2)/2+i*(w-.2)/15;box('yueshi-south-rail-post','red',.085,.91,.11,x,ry+.455,rz,true);box('yueshi-south-rail-cap','gold',.11,.06,.13,x,ry+.94,rz);}
 for(let i=0;i<15;i++){const ww=(w-.2)/15,x=-(w-.2)/2+(i+.5)*ww;rect('yueshi-south-rail-field','green',x,ry+.53,rz-.03,ww-.14,.39,.04);}
 box('yueshi-south-floor-fascia','green',w,.22,.075,0,p.upperFloorY-.23,outer-.08);
 for(const yy of[-.31,-.15])box('yueshi-south-fascia-border','gold',w,.025,.025,0,p.upperFloorY+yy,outer-.13);
 // Existing low platform gets a continuous physical approach; exact tread
 // count/run are fits, not measured from the low-resolution historic view.
 const edge=-(p.localD/2+Math.min(c.item.pad??.5,.8)),run=1.25,clear=3.6,ph=p.ph;
 for(let i=0;i<5;i++){const top=ph*(i+1)/5;box('yueshi-south-step','stone',clear,top,run/5+.008,0,top/2,edge-run+(i+.5)*run/5);}c.kit.walkRamp(c.f,-clear/2,clear/2,edge-run,edge,0,ph);
 for(const sign of[-1,1]){const x=sign*(clear/2+.12),a=edge-run,b=edge,base=z=>ph*(z-a)/run,shape=new THREE.Shape();shape.moveTo(a,0);shape.lineTo(b,0);shape.lineTo(b,ph+.12);shape.lineTo(a,.12);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.2,bevelEnabled:false});geo.applyMatrix4(new THREE.Matrix4().set(0,0,-1,0,0,1,0,0,1,0,0,0,0,0,0,1));c.tag(c.kit.mesh(c.f,geo,c.mats.stone,x+.1,0,0),'yueshi-south-stair-cheek',{pattern:'PLAIN_LOW_STONE_NOT_SCULPTED_RAIL'});for(let i=0;i<10;i++){const z0=a+(b-a)*i/10,z1=a+(b-a)*(i+1)/10;c.kit.col(c.f,x-.1,0,z0,x+.1,base(z1)+.12,z1);}}
 const data={object:'FC-78E6A34C2D',source:'https://www.dpm.org.cn/explore/building/236461.html',accepted:false,scope:'FIVE_BAY_TWO_LEVEL_SOUTH_VIEWING_FACADE_AND_CENTRAL_APPROACH',dimensions:'MODEL_FIT_NOT_SURVEY',lowerCentralLeaves:3,upperCentralLeaves:6,doorPose:'THREE_GROUND_FOLDED_LEAVES_FOR_RETAINED_CIRCULATION_SIX_UPPER_CLOSED_PHOTO_STATE',newGroundRamps:1,newUpperDestinations:0,retained:['rolled green-trim roof and source verge','side rear enclosure and floors','view-only upper navigation'],missing:['exact double-step grid','original gilded painted motifs','throne beds and current exhibition inventory','unseen side gallery interfaces','measured stair dimensions']};c.f.userData.yueshiSouthFront=data;return data;
}
