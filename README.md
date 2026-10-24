# R70 static release only

This branch contains the prebuilt static R70 project-path artifact for GitHub Pages, not the complete project source repository. Do not treat it as a source development branch or merge it into main to replace source code.

- Release: R70-L
- Build ID: R70-5b5626e95dbf
- Build source commit: c29462bf81a08927cc012bc32c696804a2c0c306
- Frozen cumulative source commit: 2b8e4333eb99ae95b73dba4533364f9f9a92e4a9
- Source fingerprint: fdb2fb6a2b593c74ef349d93a800ab4e700789c7e82714b40127860bbabe8744
- Application base path: /forbidden-city-3d/

The 132 files under dist/ are the existing project-path build, copied byte-for-byte without rebuilding. The build source commit and later frozen source commit are intentionally recorded separately: the build embeds its creation-time source commit; the frozen cumulative commit also contains the subsequent release evidence.

The deployment workflow runs only by explicit workflow_dispatch. It uploads dist/ directly and does not run npm, install dependencies, or rebuild. Publishing this static artifact does not establish that the complete cumulative source has been uploaded. Preserve the previous source and Pages release for rollback.

Existing verification evidence is CPU-based. Real GPU, mobile-device and complete-route acceptance remain unverified.
