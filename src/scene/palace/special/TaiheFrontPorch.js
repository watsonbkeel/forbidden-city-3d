import {taiheColumnGrid} from './TaiheColumnGrid.js';

/** Photo-supported topology, registered to the retained model's existing rows.
 * Its outer envelope remains provisional: this is not a surveyed porch depth.
 * No column, closed bay, central door pose, roof or floor is altered here. */
export function taiheFrontPorch(width,depth){
  const grid=taiheColumnGrid(width,depth);
  return {
    id:'taihe-front-column-behind-porch',
    source:'https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0a95c8c2815.jpg',
    status:'PHOTO_TOPOLOGY_EXISTING_GRID_MODEL_FIT_NOT_SURVEY',
    frontColumnZ:grid.z[0],doorZ:grid.z[1],
    stairCenters:grid.openBayIndices.map(i=>Number(((grid.x[i]+grid.x[i+1])/2).toFixed(5))),
    doorPolicy:'RETAIN_CLOSED_BAYS_AND_EXISTING_CENTRAL_PLAYABLE_OPENINGS',
  };
}
