# First-entry map loading race

This small follow-on to the Taihe preview changes only the deferred desktop welcome-overlay guard.

## Visible behavior

If M opens the map during the final 500 ms loading-completion interval, the welcome overlay no longer covers that open map when loading disappears. An already-visible settings panel is likewise respected. Normal desktop click-to-enter and mobile automatic entry remain unchanged.

## Evidence and limits

A deterministic test executes the actual production loading callback and the existing production map/input listeners. The original callback fails the map-open and settings-open boundaries; the corrected guard passes those boundaries while retaining locked, unlocked, mobile, missing-UI and disposed behavior.

This race is separate from the earlier cloud-browser M acknowledgment delays after pointer-lock entry. It does not establish their cause or promise an FPS or latency improvement. Sustained native-touch movement, normal cold-entry responsiveness and browser screenshots are recorded separately; CPU tests do not certify a physical phone.

The change adds no geometry, material, lighting, physics, public test interface or rendering pass. Existing authenticity, mobile-device, full-route and software-renderer smoothness limitations continue to apply.
