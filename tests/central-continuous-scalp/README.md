# In-process preparation fix, not product or guard change

Failure 43559832085 remains intact. The missing VmRSS PID's executable was not captured; a short-lived git process is a hypothesis, not a proven root cause. This change removes preparation-time Python and git subprocess creation inside capture, while keeping all preparation inside the supervised Node process. Chromium still has child processes and the original fail-closed RSS guard may still reject a future run.

Integrate prepare.mjs and capture.mjs into tests/central-volume-shading. Include the new prepare module and changed capture in the new complete source pins, update checkout identity and publish a NEW frozen commit/branch. Keep the existing external clean Git/tree/toolchain preflight, original guard and observation module hashes, 6 GiB/720 s ceiling, and single new-identity attempt. Do not run the failed identity again.

prepareSite requires detached HEAD in a regular .git directory. Worktrees, symbolic HEAD, symlinked files, missing pins, inconsistent checkout identity and dirty pinned inputs fail closed. Full git status (including unknown/untracked files) is intentionally still the unchanged outer gate's responsibility; an in-process pin check alone does NOT independently prove the Git index/worktree is clean. Outer gate is not modified here.

Validation: 15 unit tests pass, capture syntax checked, actual 1,405-file/69,781,351-byte source+retained input corpus copied into a temporary detached synthetic checkout and prepared successfully (14 site files). This is not a CI or browser result. No product, guard, shader, resource limit, browser permission or sandbox changed. No upload or browser run.
