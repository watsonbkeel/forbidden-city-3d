/** The CPU evidence renderer and shared GPU material use exactly this deformation contract.
 *  No skeletal/pose transitions are claimed. Torso follows pose-specific hip pivot;
 *  head and arms are transformed locally before the parent torso rotation.
 */
const rotX=(v,a)=>[v[0],Math.cos(a)*v[1]-Math.sin(a)*v[2],Math.sin(a)*v[1]+Math.cos(a)*v[2]];
const rotY=(v,a)=>[Math.cos(a)*v[0]+Math.sin(a)*v[2],v[1],-Math.sin(a)*v[0]+Math.cos(a)*v[2]];
const rotZ=(v,a)=>[Math.cos(a)*v[0]-Math.sin(a)*v[1],Math.sin(a)*v[0]+Math.cos(a)*v[1],v[2]];
const around=(v,p,a,fn)=>fn(v.map((x,i)=>x-p[i]),a).map((x,i)=>x+p[i]);
export function deformCharacterVertex(position,normal,attributes,state={}){
 let p=[...position],n=[...normal];const time=state.time??0,phase=state.phase??0,amp=state.amplitude??1,speed=state.walkSpeed??0;
 if(amp===0&&speed===0)return {position:p,normal:n};
 const pose=state.poseIndex??(typeof state.pose==='number'?state.pose:({standing:0,seated:1,kneeling:2}[state.pose??'standing']));
 const t=time+phase,part=attributes.part??attributes.characterPart??0,pivot=attributes.pivot??attributes.characterPivot??[0,0,0],w=attributes.weight??attributes.characterWeight??1,tw=attributes.torsoWeight??attributes.characterTorsoWeight??0;
 const motion=Math.sin(t*.72)*amp,step=Math.sin(t*speed/.60*Math.PI*2)*Math.min(speed,1)*amp;
 let angle=0,fn=rotX;
 if(part===1){angle=motion*.13*w;fn=rotY;}
 else if(part===2||part===3){const side=part===2?-1:1;if(pose===1){angle=(.5+.5*Math.sin(t*.92))*.075*w*amp;fn=rotX;}else {angle=side*(motion*.022+step*.10)*w;fn=rotX;}}
 else if((part===4||part===5)&&pose===0&&speed>0){const cycle=((t*speed/.60+(part===4?0:.5))%1+1)%1;const swing=(cycle-.5)*2;const shift=cycle<.5?.15-.60*cycle:-.15+.30*(.5-.5*Math.cos(swing*Math.PI));p[2]+=shift*w;p[1]+=(cycle<.5?0:.065*Math.sin(swing*Math.PI))*w;}
 if(angle!==0){p=around(p,pivot,angle,fn);n=fn(n,angle);}
 if(part===6&&pose===0){const a=step*.065*w*Math.sign(p[0]);p=around(p,[0,.89,0],a,rotX);n=rotX(n,a);}
 const hip=pose===0?[0,.89,0]:pose===1?[0,.57,-.04]:[0,.33,.04];
 const lean=(pose===2?(.5+.5*Math.sin(t*.6))*.075:Math.sin(t*.55)*.008)*amp*tw;
 p=around(p,hip,lean,rotX);n=rotX(n,lean);
 const breath=1+Math.sin(t*1.7)*.004*amp*tw;p[0]*=breath;p[2]=hip[2]+(p[2]-hip[2])*breath;n=[n[0]/breath,n[1],n[2]/breath];
 const l=Math.hypot(...n)||1;return {position:p,normal:n.map(v=>v/l)};
}
export const CHARACTER_DEFORM_GLSL = /* glsl */`
attribute float characterPart;
attribute vec3 characterPivot;
attribute float characterWeight;
attribute float characterTorsoWeight;
vec3 characterRX(vec3 v,float a){float c=cos(a),s=sin(a);return vec3(v.x,c*v.y-s*v.z,s*v.y+c*v.z);}
vec3 characterRY(vec3 v,float a){float c=cos(a),s=sin(a);return vec3(c*v.x+s*v.z,v.y,-s*v.x+c*v.z);}
void characterDeform(inout vec3 p,inout vec3 n,float time,vec4 anim){
 float t=time+anim.x,amp=anim.y,speed=anim.z,pose=anim.w;
 float motion=sin(t*.72)*amp,step=sin(t*speed/.60*6.28318530718)*min(speed,1.0)*amp;
 float angle=0.0;
 if(characterPart>.5&&characterPart<1.5){angle=motion*.13*characterWeight;p=characterPivot+characterRY(p-characterPivot,angle);n=characterRY(n,angle);}
 else{
  if(characterPart>1.5&&characterPart<3.5){float side=characterPart<2.5?-1.0:1.0;if(pose>.5&&pose<1.5)angle=(.5+.5*sin(t*.92))*.075*characterWeight*amp;else angle=side*(motion*.022+step*.10)*characterWeight;}
  else if(characterPart>3.5&&characterPart<5.5&&pose<.5&&speed>0.0){float cycle=fract(t*speed/.60+(characterPart<4.5?0.0:.5));float swing=(cycle-.5)*2.0;float shift=cycle<.5?.15-.60*cycle:-.15+.30*(.5-.5*cos(swing*3.14159265359));p.z+=shift*characterWeight;p.y+=(cycle<.5?0.0:.065*sin(swing*3.14159265359))*characterWeight;}
  p=characterPivot+characterRX(p-characterPivot,angle);n=characterRX(n,angle);
 }
 if(characterPart>5.5&&pose<.5){float a=step*.065*characterWeight*sign(p.x);p=vec3(0.0,.89,0.0)+characterRX(p-vec3(0.0,.89,0.0),a);n=characterRX(n,a);}
 vec3 hip=pose<.5?vec3(0.0,.89,0.0):(pose<1.5?vec3(0.0,.57,-.04):vec3(0.0,.33,.04));
 float lean=(pose>1.5?(.5+.5*sin(t*.6))*.075:sin(t*.55)*.008)*amp*characterTorsoWeight;
 p=hip+characterRX(p-hip,lean);n=characterRX(n,lean);
 float breath=1.0+sin(t*1.7)*.004*amp*characterTorsoWeight;p.x*=breath;p.z=hip.z+(p.z-hip.z)*breath;n=normalize(vec3(n.x/breath,n.y,n.z/breath));
}
`;
