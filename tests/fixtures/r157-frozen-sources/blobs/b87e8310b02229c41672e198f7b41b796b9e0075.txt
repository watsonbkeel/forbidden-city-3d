import { fitRegisteredNameboard } from './FittedNameboardMount.js';

export const YANCHUN_SOUTH_FIT=Object.freeze({
 entityId:'FC-12BEB1BB0E',status:'PHOTO_FIT_NOT_SURVEYED',visualAcceptance:'VERIFY_PENDING',photographyDate:null,
 page:'https://www.dpm.org.cn/explore/building/236524.html',
 photo:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d41b19d7f7.jpg',
 photoSHA256:'fda0c35ed50b0d23f5b4151702faec1089f74fff3c9e999d170579d159e162f9',
 scope:'SOUTH_FRONT_ONLY_FINISHED_STATE_PHOTO',unknown:['carved ornament','exact dimensions','rear/side baluster forms','capture date'],
});
function guard(c){if(c.p.key!=='yanchun'||c.item.name!=='延春阁'||c.item.x!==216||c.item.z!==485.5||c.g.w!==23.5||c.g.d!==24.3)throw Error('Yanchun photo fit requires exact retained host');}
// South turned-rail candidate withdrawn after full-body jump probe reproduced
// the R65 low-rail step-clearance and non-colliding roof-skirt defects.
// Source-positive engineering residual, not a shipped or accepted new railing.
export function fitYanchunFrontPlaque(c){guard(c);return fitRegisteredNameboard(c.kit,c.f,'延春阁',{x:0,y:4.97,z:-12.35,...YANCHUN_SOUTH_FIT,reason:'FINISHED_PHOTO_HIGH_FRONT_BEAM_NOT_RECESSED_GROUND_WALL',fitRange:{y:[4.8,5.1],z:[-12.5,-12.25]},width:.9,height:1.5});}
