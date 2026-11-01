import {baoheColumnGrid} from './BaoheColumnGrid.js';
import {baoheDepthGrid} from './BaoheDepthGrid.js';
/** Official outer-bay warm rooms and two board leaves; exact aperture,
 * panel joints, opening pose and plain crest contour are reversible model fits.
 * No undocumented furnishings or relief artwork are reconstructed. */
export function buildBaoheWarmRooms(b,g,{x0,z0,y,w,d,H,beamH}){
 if(g.userData.baoheWarmRooms)throw Error('Duplicate Baohe warm rooms');
 const grid=baoheColumnGrid(w),depth=baoheDepthGrid(d),h=H-beamH,t=.22,opening=2.6,doorH=Math.min(3.8,h-.8);
 if(![x0,z0,y,H,beamH].every(Number.isFinite)||doorH<2.4)throw Error('Invalid Baohe warm-room frame');
 const data={id:'baohe-outer-bay-warm-rooms-r48',source:'https://www.dpm.org.cn/explore/building/236434.html',innerX:[grid.x[1],grid.x.at(-2)],south:depth.frontDoorZ,north:depth.rearDoorZ,openingZ:0,openingWidth:opening,doorLeavesPerRoom:2,pose:'OPEN_MODEL_ACCESS_NOT_VERIFIED_HISTORICAL_POSE',dimensions:'INHERITED_AXIS_REGISTRATION_AND_FITTED_COMPONENTS_NOT_SURVEY',decoration:'PLAIN_CREST_CONTOUR_NOT_CLOUD_DRAGON_RELIEF',furniture:'UNRECONSTRUCTED',accepted:false};
 const mat=b.ownMat('baohe_warm_room_timber',{color:0x713324,roughness:.81}),gold=b.ownMat('baohe_warm_room_crest',{color:0x9b7b35,roughness:.65});
 const solid=(role,ww,hh,dd,x,yy,z)=>{const m=b.box(g,mat,ww,hh,dd,x0+x,y+yy,z0+z);m.userData.baoheWarmRoom={role};b.col(x0+x-ww/2,y+yy-hh/2,z0+z-dd/2,x0+x+ww/2,y+yy+hh/2,z0+z+dd/2);return m;};
 for(const x of data.innerX){const side=Math.sign(x);for(const[a,c]of[[data.south,-opening/2],[opening/2,data.north]])solid('partition',t,h,c-a,x,h/2,(a+c)/2);
 solid('door-header',t,h-doorH,opening,x,doorH+(h-doorH)/2,0);
 for(const sign of[-1,1]){solid('open-board-leaf',opening/2,doorH,.12,x+side*opening/4,doorH/2,sign*(opening/2+.07));solid('door-jamb',.3,doorH,.14,x,doorH/2,sign*(opening/2+.14));}
 for(let k=-2;k<=2;k++){const crest=b.box(g,gold,.28,.13+.10*(2-Math.abs(k)),opening/5+.015,x0+x,y+doorH+.2,z0+k*opening/5);crest.userData.baoheWarmRoom={role:'plain-fitted-crest'};}
 }
 g.userData.baoheWarmRooms=data;return data;
}
