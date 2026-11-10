// Independent integration wiring. Every visual/interactive UI is a product module.
// No World, renderer, asset load, replacement UI, patched CSS, or fabricated browser.
import '../../../style.css';
import * as three from 'three';
import {LanguageControl} from '../../../src/ui/LanguageControl.js';
import {HelpPanel} from '../../../src/ui/HelpPanel.js';
import {Minimap} from '../../../src/ui/Minimap.js';
import {SettingsMenu} from '../../../src/ui/SettingsMenu.js';
import {DayNightPanel} from '../../../src/ui/DayNightPanel.js';
import {TourLocalization} from '../../../src/ui/TourLocalization.js';
import {localeStore} from '../../../src/i18n/LocaleStore.js';
import {FirstPersonControls} from '../../../src/controls/FirstPerson.js';
import * as quality from '../../../src/render/QualityPreference.js';
import * as performance from '../../../src/render/TourPerformancePreference.js';
import {TELEPORT} from '../../../src/config/constants.js';
const language=new LanguageControl();
const controls=new FirstPersonControls(new three.PerspectiveCamera(),document.getElementById('scene-container'));
const location=document.createElement('div');location.id='location-panel';
location.style.cssText='position:fixed;top:20px;left:20px;padding:15px 20px;background:rgba(0,0,0,.6);color:white;border-radius:8px;font-size:16px;z-index:1000;font-family:Arial,sans-serif';
function updateLocation(label='外朝（午门—乾清门广场） › 太和门广场') { const heading=document.createElement('strong');heading.textContent='当前位置'; location.replaceChildren(heading,document.createElement('br'),document.createTextNode(label)); }
updateLocation();document.body.append(location);
const help=new HelpPanel({isMobile:controls.isMobile,anchor:location});
const teleports=[];let settings;
const minimap=new Minimap({preview:controls.isMobile,hasTeleportTarget:()=>true,onTeleport:name=>{teleports.push(name);return true;},onToggle:visible=>{settings?.setMapMode(visible,minimap.container);controls.setMapOpen(visible);}});
settings=new SettingsMenu(document.body);settings.init({initialQuality:quality.readQualityPreference('high'),initialPerformanceMode:performance.readPerformanceMode(),charactersAvailable:false,onOpen:()=>controls.stop(),onQualityChange:q=>quality.writeQualityPreference(q),onPerformanceModeChange:m=>performance.writePerformanceMode(m)});
const env={dayCycle:{phase:'day',beijingTime:{timeLabel:'09:23',dateLabel:'2026-11-08',minutesOfDay:563}},previewDate:null,setTimePreview(date){this.previewDate=date;}};
const clock=new DayNightPanel(env);const localization=new TourLocalization();
window.qa={language,controls,help,minimap,settings,clock,env,localeStore,teleports,updateLocation,teleportKeys:TELEPORT.POINTS.map(p=>p.target)};
window.qaReady=true;
