#!/usr/bin/env python3
"""Read-only engineering proposal from actual captured AABBs; NOT candidate geometry."""
import json,pathlib,matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
p=pathlib.Path('reports/r123-chuxiu');d=json.load(open(p/'baseline/frame-inventory.json'));out=p/'proposal';out.mkdir(exist_ok=True)
rear=[{'role':'Fengguang EAST','x':77.0,'z':444.5,'w':9.4,'d':4.4,'rot':'west','maxCompleteEnvelope':[74.15,439.25,79.9,449.75]},{'role':'Yilan WEST','x':112.6,'z':444.5,'w':9.4,'d':4.4,'rot':'east','maxCompleteEnvelope':[109.7,439.25,115.45,449.75]}]
r={'status':'PROPOSAL_NOT_APPROVED_NOT_GEOMETRY','sourceFingerprint':d['beforeSourceFingerprint'],'translation':{'itemIndices':[23,25,26],'deltaZ':-5,'mainZ':429.3,'frontWingZ':417.0,'unchanged':[15,24]},'rearWingEngineeringFits':rear,'scope':'No survey claim; envelope includes proposed roof/steps/decorations, actual candidate pending. Unknown ear strips are reservation only, not game geometry or a claimed door.','derivedOldBounds':d['frames'],'unknownEarReservations':[[74.15,450,81.4,455.75],[107.6,450,115.45,455.75]]}
(out/'frame-proposal.json').write_text(json.dumps(r,indent=2)+'\n')
fig,axes=plt.subplots(1,2,figsize=(12,8.5),sharex=True,sharey=True)
for k,ax in enumerate(axes):
 ax.set_xlim(118,71);ax.set_ylim(407,460.5);ax.set_aspect('equal');ax.grid(alpha=.15);ax.set_xlabel('World X (+X = west / left)');ax.set_ylabel('World Z (+Z = north / up)');ax.set_title(['R120 actual source bounds','Proposed bounded frame (NOT built)'][k]);ax.add_patch(Rectangle((73.8,414.8),42,41.2,fill=False,color='firebrick',lw=1.3));ax.plot([73,73.8],[409.5,414.8],color='firebrick');ax.plot([115,115.8],[409.5,414.8],color='firebrick');ax.axhline(460,color='black',lw=1,ls=':');ax.text(114,459.6,'Chonghua south boundary Z460',fontsize=7)
 for f in d['frames']:
  idx=f['itemIndex'];dz=-5 if k and idx in [23,25,26] else 0;c=f['colliderBounds'];v=f['renderBounds'];color='#487ba4' if idx in [23,25,26] else '#9b9279';ax.add_patch(Rectangle((c[0],c[2]+dz),c[3]-c[0],c[5]-c[2],facecolor=color,alpha=.30,edgecolor=color));ax.add_patch(Rectangle((v[0],v[2]+dz),v[3]-v[0],v[5]-v[2],fill=False,edgecolor=color,linestyle='--',lw=1));label={15:'Tihe (unchanged)',23:'Chuxiu',24:'Lijing (unchanged)',25:'front E',26:'front W'}[idx];ax.text((c[0]+c[3])/2,(c[2]+c[5])/2+dz,label,ha='center',va='center',fontsize=7,rotation=90 if idx in [25,26] else 0)
 if k:
  for q in rear:
   x0,z0,x1,z1=q['maxCompleteEnvelope'];ax.add_patch(Rectangle((x0,z0),x1-x0,z1-z0,facecolor='#58a06a',alpha=.4,edgecolor='#215d2b'));ax.text((x0+x1)/2,(z0+z1)/2,q['role'],ha='center',va='center',fontsize=7,rotation=90)
  for x0,z0,x1,z1 in r['unknownEarReservations']:ax.add_patch(Rectangle((x0,z0),x1-x0,z1-z0,fill=False,hatch='//',edgecolor='#ad762a',alpha=.6));ax.text((x0+x1)/2,(z0+z1)/2,'EAR UNKNOWN\nno doors built',ha='center',va='center',fontsize=6)
fig.suptitle('R123 source-bound layout study: solid = collider union AABB, dashed = actual render AABB\nNot measured dimensions, not per-triangle clearance, not a historical route claim',fontsize=11);fig.tight_layout(rect=[0,0,.98,.94]);fig.savefig(out/'frame-proposal.png',dpi=150);fig.savefig(out/'frame-proposal.svg');print('Proposal diagram written; no runtime edits.')
