# R58-A · second internal functional checkpoint

Five bounded changes, not five complete buildings and not A37 completion:
1. Baohe: nine walking beasts on each corner of both eaves, with original rider separate.
2. Zhonghe: seven walking beasts on each of four corners.
3. Baohe: three actual stair approaches and rails replace the old generic dais/air collision box.
4. Xihe: six courtyard-facing curved corbels.
5. Tiren: six lower window groups contain twelve independently framed leaves.

The actual source checkpoint is `322eb2eb5af839486f75276e23fcc5e07e567626`. `SUMMARY.json` and the lossless `one-world-validation.json.gz` bind the exact results. One cumulative world run passed in 200.5 seconds. This is CPU functional test runtime, not a frame-performance measurement. 225 focused checks passed. Production compilation passed; the intermediate build still carries the prior R57 release identity and is not a release package.

The same world freshly binds all 108 identities and separately proves visible submitted triangles for each in B and after real Yangxin, Kunning and Huangji S model loads. No other character can substitute for a missing ID. Twenty-four routes run for two periods, six zone unload/reload generations, Ningshou cold entry, off/on/night and actual high64/low32/near2 caps remain checked. There are 401 view records, not 401 people and not 108 simultaneous people.

The five additions are checked against actual merged scene geometry. There are 400 animal foot-corner vertices. Baohe has 241 new stair/rail solids plus ten actual existing-furniture proxies, removes one old oversized collision box, and adds 19 rescue=false visible supports. Net world change from batch1 is +250 colliders / +19 supports, yielding 25,425 / 1,125. Other four changes preserve navigation exactly in their focused audits. Baohe's 48 actual-controller cases cover three approaches at 10/60 Hz, walking/sprint, W/S and straight/oblique waypoint paths; the oblique option is NOT a simultaneous W+D/S+D input claim. Twenty full-world Xihe/Tiren routes additionally test 10/60 Hz walking/sprint and actual rendered overhead clearance.

The original batch1 source manifest is retained at `data/characters/world-source-freeze-r58-a-batch1.json`. The new active 210-file manifest is `data/characters/world-source-freeze.json`; five previously tracked sources and four helpers differ. Registry, Kit, actor paths and runtime caps are unchanged. The bridge-cap prototype remains unhooked.

Historical failing assertions are not silently rewritten or called green. In particular, the Wumen old total-child count changed under the approved first batch; the original ascent fixture is preserved by a separate exact successor check in batch1. Baohe's old air-box retention assertion is intentionally superseded only for the removed giant. Source/report details and original red logs remain in their component directories.

CPU views are bounded diagnostic renders of actual geometry, without runtime textures/shadows. They do not replace the required real-browser same-camera comparison. Species sculptures, fine carving, some rail profile detail, paint, unknown rear views/interiors and target-date questions remain open. No ACCEPTED flag is granted here.
