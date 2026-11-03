# Yuhua east side building implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. No agents per parent.

**Goal:** Own-photo distinguishable west-facing two-storey exterior while preserving6fe routes and old geometry.
**Architecture:** New CourtKit special component; one ZoneBase hook, private materials and actual collision owners. Existing runtime geometry is immutable.
**Tech Stack:** Three.js/Node native tests, CPU renderer, Vite.
**Spec:** docs/superpowers/specs/2026-11-03-yuhua-east-design.md

## Global constraints
No main/upload/new agents, no moved walls, serial heavy jobs; unknown interior and dimensional/roof fits explicit.

## Review focus
Wrong west photo attribution; hidden upper opening; owner/visual mismatch; accidental old material mutation; facade/roof visible from normal west player perspective.

## Tasks
- [x] Capture source-clean6fe exact World geometry/owners/far roof and candidate occupation before hook.
- [x] Write missing-component/hook tests and preserve expected RED.
- [x] Implement buildYuhuaEastLou(kit,zone) returning {frame,meta}, private fitted exterior/real ledge and stair; test metadata, face orientation, material isolation, owner completeness, front views, guard/failure atomicity and closed interior.
- [x] Run actual native local controller30/60 walk/sprint approach/ledge/bypass and closed-door negative; preserve meaningful contacts, no zero-contact physics chase.
- [x] Commit product snapshot, send parent SHA.
- [x] Serial actual-world strictoldstream/farroof and Yuhua/Fanzong/183.7/306 plus prior route regression; out-of-scope negative mutation/restoration.
- [x] Render actual merged outer-west6CPU proofs with source/image hashes and human inspect.
- [x] Fresh /gugong/ clean build,137HTTP source identity and bytes; archive all initial failures and freeze evidence commit. Verify runtime bytes unchanged after freeze.

Ruling: One initially proposed z335 neighbor segment crosses unchanged Yuhua low porch; corrected via z358 after exact original component evidence, no product or physics change. Full baseline route-only resource attempt SIGKILL retained, not called passed. Controlled cumulativeWorld subsequently passed160/46. Parent owns fresh independent review; no worker delegation.
