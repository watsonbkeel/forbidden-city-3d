# Synchronous build-step observations

Base: remote `5030d7a4171eb7c5fd13c7e7d5bce259255f18a9`. That candidate and main stay unchanged.

This step does not claim to remove a long task. ZoneBase.build will consume a private ordered generator synchronously to completion. No timer, Promise, asynchronous mode, movement admission change, cache budget change, or public suspended builder is introduced. Original gate-first pass, item pass, optional profiles, every post-hook, Yanxi frame detach, material merge, LOD installation, and result assembly retain their order.

The generator yields only internal phase/index metadata before executing each operation. The synchronous consumer times the next resume, so each observation includes small iterator/look-ahead overhead. Observations are per builder in a WeakMap: count, total duration, maximum, and at most eight largest completed/failed step records. Records contain fixed phase names, integer indices and finite duration, never item names, error messages, scene objects, callbacks, or source credentials. The existing first-error copied summary is unchanged. Timing failure must never skip an operation or replace its exception.

Tests first: production build records exist and synchronous completion is retained; synthetic ordered generator success/failure/invalid clocks and bounded immutable data; exact source normalization to the frozen baseline; real west-six before/after complete geometry, physics, metadata, source registration/reuse, disposal and default cache refusal. Real NingShou cumulative regression is required because all hooks share this build path. No World or browser attempts. Any unexpected product change stops inclusion.

After measuring real steps, use the largest actual operation to design a separate optimization. An asynchronous split additionally needs movement admission, synchronous Teleport/Flight compatibility, source-certificate ownership, late/cancel cleanup, atomic scene/collision/listener publication and first-query spatial-index cost. Those are not implemented here.
