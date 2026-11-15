// Diagnostic wiring, not a full World, renderer, physics or actual phone test.
// No DOM open/visibility/focus patches; disclosure and boarding use product events.
import '/style.css';
import * as THREE from 'three';
import {DayNightPanel} from '/src/ui/DayNightPanel.js';
import {FirstPersonControls} from '/src/controls/FirstPerson.js';
import {CollisionManager} from '/src/utils/Collision.js';
import {FlightTour} from '/src/scene/flight/FlightTour.js';
import {FlightEnvelope} from '/src/scene/flight/FlightEnvelope.js';
import {getBeijingDayCycle} from '/src/scene/sky/BeijingDayCycle.js';
const camera = new THREE.PerspectiveCamera();
const cm = new CollisionManager();
const controls = new FirstPersonControls(camera, document.getElementById('scene-container'), cm);
controls.setPosition(22, 1.7, -494); // ordinary walking origin within original parked-aircraft boarding radius
const calls=[];
const environment={previewDate:null,dayCycle:getBeijingDayCycle(new Date('2026-11-14T12:00:00+08:00')),setTimePreview(date){this.previewDate=date;this.dayCycle=getBeijingDayCycle(date??new Date());calls.push(date?.toISOString()??null);}};
const clock = new DayNightPanel(environment);
const flight = new FlightTour({scene:new THREE.Scene(),camera,controls,collisionManager:cm,zoneManager:{ensureLoadedAt(){}},envelope:new FlightEnvelope()});
// No update loop: all actions under test update the product UI synchronously;
// no claim about world movement or flight simulation. Boarding must be native click.
const events=[];
for(const root of [clock.root,flight.panel]) root.addEventListener('toggle',()=>events.push({id:root.id,open:root.open,focus:document.activeElement?.id??'',at:performance.now()}));
window.qa={clock,flight,controls,environment,calls,events};
window.qaReady=true;
