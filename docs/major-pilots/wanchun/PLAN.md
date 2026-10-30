# 万春亭四向内围护 Implementation Plan

> Single product writer; continue original MASTER authorization. No main/Pages or remote write.

**Goal:** Replace the generic full-height gold lattice appearance on all four inner elevations with the source-visible red/gold window and door zoning, green/yellow hexagonal sill faces and bounded beam color fields.
**Architecture:** An opt-out named Wanchun-only surface adapter partitions existing BoxGeometry faces, preserving their exact position buffers, transforms, source-face union and all physics. Four generated original material maps describe source-visible relationships, not relief carving. No official pixels enter the product. Qianqiu and the outer door stage stay unchanged.
**Tech Stack:** Existing Three.js, Canvas2D, material merge, Node tests.
**Spec:** MASTER-PROMPT.md FC-8D9B4E9A44; official236521 and actual vp3348 / sphPicId1943245109680263168 cube images. Photography date unknown.

## Scope decision
The full caisson is a separate unresolved structural dependency within the same pavilion: the current flat core ceiling, full central hip faces and solid upper drum conflict with the actual deeply recessed caisson. Do not fake depth below the ceiling or silently remove roof faces. Existing whole-pavilion scope is NOT reduced and no whole-object acceptance is claimed. Source high cube shows outer octagon and **12**, not8, inner light windows; initial researcher miscount is corrected before implementation.

## Files and steps
- [x] `tests/major-pilots/wanchun-interior.test.mjs`: first fail on missing named four-elevation metadata; then assert exact face unions/physical records, candidate counts, outside/Qianqiu equality, no texture photo assets, rollback and malformed identity rejection.
- [x] `src/scene/garden/WanchunInteriorEnclosure.js`: validate exact original named frame and source targets; generate red/gold door panels, pale/gold window lattice, green/yellow hexagonal sills and restrained green/blue head fields; partition inward faces only and preserve original remaining faces/materials.
- [x] `CrossGardenPavilions.js`: named Wanchun-only opt-out call after complete source build. Keep shell, roof, windows/doors poses, columns, stairs, tree sampling, colliders, walkables and map unchanged.
- [x] Run targeted baseline/candidate tests and actual four-direction routes. Keep old failures named; do not rewrite historical fixtures. Current baseline R47 is14/14; R64 first-batch process failed without detailed assertion in initial combined run, retained locally for isolation.
- [x] Capture actual merged material CPU before/after at fixed cameras; label as CPU only, not browser/GPU. Build serially and request independent review. Checkpoint only explicit source/tests/concise docs; raw logs and images stay outside repository.

## Review focus
1. Every selected triangle stays exactly on the original source plane; no duplicate coplanar overlay.
2. Select room-facing sides, not a reflected outside face; folded leaves have their inward side faces fitted, while their open pose remains an access approximation.
3. New surface maps cannot claim transparent lattice, measured cell counts, carved depth or exact original paintings.
4. All four directions independently inspected; never propagate to Qianqiu.
5. Original full caisson/roof/outer stage/precise patterns remain explicitly pending.
