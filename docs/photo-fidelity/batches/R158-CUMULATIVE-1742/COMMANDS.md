# Exact final commands and reproduction boundary

Working tree: `r158-wenyuan-stele-1724`; dependency symlink to the previously verified `r157-dings-remote-1514/node_modules`, not a fresh npm install. All commands ran serially.

## Final components (125/125)

```sh
node --max-old-space-size=1024 --test --test-concurrency=1 \
 tests/r158-wenyuan-stele/component.test.mjs \
 tests/r158-chuanxin/component.test.mjs \
 tests/r158-neige-store/component.test.mjs \
 tests/r158-neige-store/flight.test.mjs \
 tests/r158-neige-store/routes.test.mjs \
 tests/r158-nansansuo-front*.test.mjs \
 tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs \
 tests/r158-donghua/contact.test.mjs
```

The unchanged `tests/r157-pavilion-side/retained-contact-57.json` must be checked out in a sparse tree. No source or expected fixture bytes were edited to recover the missing-file failure.

## Normal cumulative World

Each command uses `node --max-old-space-size=1024 --test --test-concurrency=1 FILE` and `EVIDENCE_OUT` pointing to a private local JSON. No prototype injection or fallback builder. Before the six-face contact follow-up:

- `tests/r158-cumulative-1742/chuanxin-world.test.mjs`: 14 accepted routes +3 wall refusals.
- `tests/r158-cumulative-1742/neige-store-world.test.mjs`: 8 new +8 retained-main accepted routes; 8 inherited diagnostic rows exactly equal the acc36 reference (4 arrive,4 old center-line failures).
- `tests/r158-wenyuan-stele/world.test.mjs`: 12 accepted routes +6 solid/water refusals, including4 retained hall-entry routes.

The Neige test requires `BASELINE_REPORT=../r158-cumulative-evidence-1711/world-neige.json`. This is a LOCAL_ONLY original; its hash is published, not its bytes. A remote checkout without that private reference cannot independently repeat the exact-frame baseline comparison from the published tree alone.

After the scoped contact follow-up, the identical stricter command:

```sh
EVIDENCE_OUT=../r158-cumulative-evidence-1742/nansansuo-contact-final.json \
node --max-old-space-size=1024 --test tests/r158-cumulative-1742/nansansuo-world.test.mjs
```

12 accepted routes /5,937 frames, peak0.204333m; its original actual RED was0.849444m. The unchanged old-front comparison was a private SHA-locked loader experiment, not a production path and not used for the accepted final run.

## Single application build

```sh
VITE_BASE=/gugong/ ./node_modules/.bin/vite build
node --input-type=module -e "import {verifyBuildSource} from './scripts/build-identity.mjs'; console.log(JSON.stringify(verifyBuildSource({expectedBase:'/gugong/'})))"
```

621 modules transformed, exit0; independent source verifier exit0. Clean runtime commit `e45c8410bdfeb0d51f102c898837409c0d089948`, fingerprint `820a06494f6c1c9c8b5f8be8ec06e4e111e60a76a7fd48a34877b5df3d259975`, base `/gugong/`. The inherited UI release string remains honestly `R146-fix`; no claim of a new release tag or deployment. The existing large-chunk warning is retained.
