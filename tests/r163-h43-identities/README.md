# H43 identity-only checks

This documentation/test successor uses the unchanged runtime of remote
`16521cd0761c6ecf26ced3a0b2212211c9fe42a7` (and d5). It does not add buildings,
rename gameplay objects, change geometry or count partial work as completion.

```sh
node --test --test-concurrency=1 tests/r163-h43-identities/identity.test.mjs
```

Seven bounded checks call production functions and, for three cases, real
single-component builders with CourtKit and the real TextureLibrary. Offline
inert textures and a DOM fixture replace external loading/rendering only.

- A single-arched 英华门 must reject the separate 英华殿山门 identity/profile.
- The 英华殿 principal-hall profile must reject both ear-hall names.
- The 重华宫 middle-hall profile must not consume 崇敬殿, 葆中殿/古香斋,
  翠云馆/重华宫后殿 or the whole palace region.
- 延春阁 must not consume the 建福宫花园 aggregate region.
- The real 英华门 builds one aperture and registers its own map name only.
- The real 中正殿东配殿 keeps FC-E5EEAB2373, not the principal/west-side IDs.
- The real 英华殿西耳殿 keeps FC-BA2BB4F70D, not the east-ear ID.

Negative inputs exercise actual existing guards. The three real builders also
retain their explicit non-acceptance flags. These tests do not prohibit future
independent missing buildings or assert that no anonymous geometry exists.
They cannot validate the full historical architectural identities, all43
implementations, appearance, whole-World traversal or complete acceptance.

The H43 appendix records30 dedicated partial implementations,2 generic fits,
10 entries without an explicit runtime binding found and1 courtyard aggregate
needing coverage review. No item is classified as historical merely because an
old record described destruction. These are code classifications, not a
completion rate. Existing Yanchun south turned-rail work is retained.

Use these checks alongside the156 bounded card/map/Teleport checks in
`../r163-five-place-cards/README.md`. The existing R6 catalog hash failure and
other historical baseline limitations remain disclosed there. No full-suite,
World, browser/GPU or physical-phone pass is claimed. No new build/deployment
is performed; the actual inherited build source remains local
`d2f65984528179154fef0022cf9692e03bcf12f0`, build R163-ff9834c19984.

Current bounded result:163/163 passes (the prior156 plus these7). Three isolated
in-memory fault injections removed the gate-name guard or changed the east-side
and west-ear source IDs. Each made its corresponding identity regression fail;
no production file bytes were modified for the sensitivity check.
