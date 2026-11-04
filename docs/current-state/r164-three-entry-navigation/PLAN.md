# Three existing entrance navigation corrections

Goal: restore strict ground-to-door teleport checks for 阅是楼、佛日楼、倦勤斋 using their retained visible approaches and registered ramps. The previous generic points declared zero height on existing slopes. No building, collision, general Teleport algorithm, rescue support, input or map target changes.

Approach: exact-profile pure helper applied before navigation freeze in both profile factories. Start one metre before the existing ramp toe, another point .2m before it, five slope samples, retained platform and original portal/end. Alternative weakening Teleport tolerances is rejected; moving existing steps would introduce needless geometry risk. Coordinates and slope samples are game navigation fitting, not historic survey or museum access.

- [x] Freeze d84 profile source, assert three old strict failures and new expected landings (red).
- [x] Add one helper and two factory calls, preserve all other profile fields and 16 other profiles exactly.
- [x] Check exact identity/readonly rejection, old-point/missing-ramp/blocker negatives, real controller entry/exit, real Teleport.go commit/refusal.
- [x] Real NingShou: preserve geometry/material/physics/map signatures; all 19 strict results (three corrected, thirteen retained, three still rejected); cumulative shared-stair and existing routes.
- [ ] Bounded cumulative regressions, independent read-only review, Node24 Pages-base clean build and real HTTP resource verification.
- [ ] New cumulative dev branch with full remote content/tree/ref readback. Preserve d84/main, no deployment.

Known unrelated pending: 遂初堂 and 萃赏楼 also reject historical strict entry checks; do not guess at their support interfaces in this patch. No full World, browser, GPU, mobile, Node20 or actual UI manual verification.

Scope correction after actual-zone red: 梵华楼 remains excluded. Existing jingfu-rear-stair furniture domain covers the first half of its registered ramp and returns0 for finite feet; do not modify public physics or fabricate support heights in this patch. Preserve the original failing route exactly, alongside 遂初堂/萃赏楼.

The last two checkboxes are release gates performed after this source commit. The final parent delivery includes actual build-info, remote commit/tree and complete readback evidence; this plan is not itself a claim that publication occurred.
