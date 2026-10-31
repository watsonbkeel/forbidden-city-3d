import{registerHooks}from'node:module';
registerHooks({load(u,c,next){const r=next(u,c);if(!u.endsWith('/src/scene/PalaceBuilder.js'))return r;let s=String(r.source);function once(old,neu){if(s.split(old).length!==2)throw Error('Private explicit boundary missing/ambiguous: '+old.slice(0,70));s=s.replace(old,neu);}
once('  buildWumen(data) {','  buildWumen(data) {\n    const __r157LowerStart=this.colliders.length,__r157WalkStart=this.walkables.length;');
once('    // 午门专属三跑折返马道：','    globalThis.__R157_LOWER_SEGMENTS?.("pre-ascent-lower",this.colliders.slice(__r157LowerStart),this.walkables.slice(__r157WalkStart));\n    // 午门专属三跑折返马道：');
const old='    registerWumenNorthPortalOverheads(this, {\n      openings, southZ: zS, northZ: zN, platformHeight: PH,\n    });';
if(s.includes(old))once(old,'    const __r157NorthStart=this.colliders.length;\n'+old+'\n    globalThis.__R157_LOWER_SEGMENTS?.("old-three-north-overheads",this.colliders.slice(__r157NorthStart),[]);');
return{...r,source:s};}});
