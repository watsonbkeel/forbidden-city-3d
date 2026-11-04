# Yangxin paired folded board doors: bounded CPU checks

Base44091382053b50349f86d9e3064275e0b605b82b. Frozen Loader is copied byte-for-byte from that Git object, SHA256 b325941e36928a830d80370729402c968d3d96d16d5118962e18a75bd8456380. GLB bytes stay unchanged.

Run serially:

    node --test --test-concurrency=1 tests/r164-yangxin-folded-doors/component.test.mjs tests/r164-yangxin-folded-doors/lifecycle.test.mjs
    node --test tests/r164-yangxin-folded-doors/production-zone.test.mjs

The production test constructs one real west-six B zone and two sequential real optional S layers: frozen4409 and current. It preserves every prior S mesh signature, all old contact values and B records/roof. Four added ordinary contacts are exact visible boxes. Original room routes total32 positive/16 blocked across the old/current two runs (candidate alone16/8), with24 candidate head/jump checks and woodscreen24/8. Forty-eight additional edge probes across old/current are **24 arrived and24 pre-existing blocked** (candidate alone12/12), all old/current frame-identical. North-edge z=+0.98 return routes are not claimed passable; south-edge z=-0.98 routes arrive. This preserves a known old boundary, not a fix for every grazing trajectory. Real FirstPerson controls run under controlled clock/heading and decelerate before turns, not arbitrary live input.

Failure injection covers readonly hosts/metadata, source changes, third geometry initialization, private material setup and late fourth geometry inside actual Loader. Old historical MainPartitions source normalization removes only this successor's declared import/call; no old assertions are deleted. Its previous whole-layer production snapshot counted two added headers relative56fa and predates these four new door contacts; the current test freezes4409 and validates the additive four-contact boundary instead.

Official identity: https://ggzl.dpm.org.cn/pages/exhibit_works/details?id=8664 (2026-11-04 search index exposes text; direct page requires JS). Corroboration: https://www.dpm.org.cn/Uploads/File/pdf/8c/ca/d4/8ccad4e5728d0f62855c8e72e7ef45cf.pdf . Both describe paired board doors in the red main-room partitions. Modern opening posture, hinges and precise leaf dimensions are not established. Fully folded-back plain boards are a deliberate display fit preserving the existing3m doorway, not a measured reconstruction or assertion of actual museum access.

No World, browser, GPU, mobile or real Mac thermal verification.
