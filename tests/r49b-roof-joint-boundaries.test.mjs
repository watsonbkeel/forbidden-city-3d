import test from 'node:test';import assert from 'node:assert/strict';import*as T from'three';
import{splitRoofJointPolygon}from'../src/scene/palace/special/CanopyRoofSurfaceJoint.js';
const vertex=p=>({point:new T.Vector3(...p),values:{position:p,uv:[p[0],p[2]],normal:[0,1,0]}});
const area=p=>{let a=0;for(let i=1;i<p.length-1;i++)a+=new T.Triangle(p[0].point,p[i].point,p[i+1].point).getArea();return a;};
for(const[name,points]of Object.entries({negative_negative_zero:[[-1,0,0],[-1,0,1],[0,0,0]],positive_negative_zero:[[1,0,0],[-1,0,1],[0,0,-1]],negative_zero_zero:[[-1,0,0],[0,0,1],[0,0,-1]],entirely_on_boundary:[[0,0,0],[0,1,1],[0,0,1]]}))test('roof partition retains original area: '+name,()=>{
 const poly=points.map(vertex),r=splitRoofJointPolygon(poly,p=>p.x);
 assert.ok(Math.abs(area(r.yes)+area(r.no)-area(poly))<1e-9,'both half polygons include their boundary vertices without duplicating all-coplanar faces');
 for(const p of [...r.yes,...r.no])assert.deepEqual(p.point.toArray(),p.values.position,'UV/position interpolation uses the same fraction');
});
