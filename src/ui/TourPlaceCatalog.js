import supplemental from '../../data/places/supplemental.json' with {type:'json'};
import {PlaceCatalog} from './PlaceCatalog.js';
import {SupplementalPlaceCatalog} from './SupplementalPlaceCatalog.js';
/** Original cards and supplemental identities share selection, not navigation. */
export class TourPlaceCatalog {
 constructor(){this.original=new PlaceCatalog();this.additional=new SupplementalPlaceCatalog(supplemental);this.places=this.original.places;this.supplementalPlaces=this.additional.places;this.allPlaces=[...this.places,...this.supplementalPlaces];if(new Set(this.allPlaces.map(p=>p.id)).size!==this.allPlaces.length)throw Error('Overlapping tour place IDs');}
 get(id){return this.original.get(id)??this.additional.get(id);}
 forBinding(binding){return this.original.forBinding(binding);}
 forMapItem(item,items){const old=this.original.forMapItem(item,items),added=this.additional.forMapItem(item,items);return old&&added?null:old??added;}
 sourcesFor(place){return place.catalogKind==='supplemental'?this.additional.sourcesFor(place):this.original.sourcesFor(place);}
}
