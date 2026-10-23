# R60 full-world QA attempts

Production source was frozen at d1e0887, versioned world schema16/228 files. No later QA change changes production geometry, physics, characters, source fingerprint or budgets.

- `../r60-c-world/`: first cumulative attempt exited1 without a child signal in its default reporter. It omitted the inherited 1024MiB QA heap flag. No complete-world pass.
- `../r60-c-world-recheck/`: restored the original 1024MiB flag/TAP, died with test-child SIGKILL at185.66s, maxRSS1612372KiB. This identifies the signal, not who sent it or the root cause.
- `../r60-c-world-bounded/`: measured mock history release, completed the inherited A/B/C route assertions and Yangxin S/B, then died with SIGKILL during Kunning S individual views at229.18s, maxRSS1705580KiB. Checkpoint contains256 observation groups, not a completed401-group pass.

The small regression proves Node mock `restore()` retains call history, whereas clearing only completed route mocks drops those histories without changing the returned frames, errors or unrelated mocks. The same six-zone checkpoint's retained JS heap decreased from about354MB to275MB. That is a QA storage improvement, not proof of the SIGKILL cause or gameplay/GPU memory.

Authorized successor: four **serial, independent full-world processes**, B/Yangxin/Kunning/Huangji, each rebuilding the same228 frozen sources. B retains the full inherited/new route/lifecycle scope. Every S process checks all108 fresh B bindings and individual visibility, its own actual S asset, all108 fresh S bindings/visibility/generations, then returned B cleanup/rebinding/individual visibility. No ready flags or module/scene state can cross processes. This intentionally does **not** establish one world surviving three consecutive S transitions.

The AST multiset check preserves all135 original explicit assert-call expressions and adds15. Commit438cb43's subject says207 in error; the machine-recorded counts are135→150. It does not count runtime loop expansions as new test methods.

Each stage writes its own exit/resource/TAP and full report. The resource script's maximumRSS is explicitly the cumulative largest child seen so far, an upper bound per later stage, not a measured later-stage maximum. A failed stage stops the runner; no reduced counts/quality/route set is substituted.
