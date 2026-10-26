# R94 actual cloud browser QA — 2026-10-26

Verified URL from GitHub deploy job 121400154309: https://watsonbkeel.github.io/forbidden-city-3d/
Workflow run 40269793160: build and deploy success; deployment commit c32e6d44dea8db4d779a46380570d20753ff8d2f.

Actual remote cloud Chrome/CDP tab 31 opened the deployment and rendered R94 · 构建 44444072f87e. Initialization failed at WebGL renderer creation. Browser console reports GL_VENDOR=Disabled, GL_RENDERER=Disabled, Sandboxed=yes, BindToCurrentSequence failed. This is a current cloud-browser capability block, not evidence of a new R94 product regression or user GPU/mobile failure. No security or renderer flags were changed, no local browser retried.

Independent read-only HTTP checks returned HTTP/2 200 for index.html, build-info.json, assets/index-B04Zgtww.js and assets/index-B1n7_wTD.css. Metadata matches HTML buildId/fingerprint/base and JS buildId/fingerprint/commit/base. Build info: R94-44444072f87e; fingerprint 5321d4e1161dc82fdaed10b4ba95507d3b0d366b642cb531c9617cde9fbfafc6; sourceCommit c32e6d44dea8db4d779a46380570d20753ff8d2f; sourceDirty false; base /forbidden-city-3d/.

QA status: page and build identity PASS; real 3D startup BLOCKED_ENVIRONMENT; time hour/minute input/apply/close/move NOT_RUN; map open/close/compact NOT_RUN; real walking routes NOT_RUN; runtime texture/model network coverage NOT_RUN (renderer fails before scene initialization); user GPU/mobile/FPS NOT_RUN.

Evidence: webgl-disabled.jpg, console-errors.txt, build-info.json and individual HTTP headers and downloaded entry assets alongside this report. HTTP checks came from exec/curl, not browser network instrumentation. Screenshot is actual cloud browser, not CPU-rendered substitute.
