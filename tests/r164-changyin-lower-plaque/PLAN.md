# Changyin lower-eave title implementation plan

Goal: complete the clearly absent lower title as one limited visible increment on d565. Official building236437 says lower-eave 壶天宣豫; official PDF u5d6e382d9ba17.pdf page5/printed38 figure4 clearly shows its dark/gold front title. Normalized traditional 壺天宣豫, right-to-left; original calligraphy/carving and exact measurements are not replicated.

Architecture: one independent source-bound helper, one ZoneBase hook after the existing middle title. A private canvas and two private materials protect old atlas/middle texture. Plain fitted rim and board, centre(0,5.3,-7.84), face3.2×.85m, frame3.32×.97×.12m. Lower frame bottom4.815m stays above player normal jumps; no collision, walk support, new access or altered normal physics.

Approaches: changing the shared title atlas risks all other text and touching old middle implementation risks a delivered scope; independent two-mesh addition is chosen under parent's autonomous small-step authorization. No new decorative ghost-mask, couplets, roof or backstage work.

- [ ] Freeze actual d565 NingShou old geometry/data/roof before code, including middle plaque.
- [ ] Missing-helper red; actual lower glyph pixels/reading order/front rays; complete old-middle/atlas/physics preservation. Guard changed host/readonly arrays/duplicate/non-auto matrices before allocation, failure disposal+retry.
- [ ] Implement isolated helper and one hook; old sources remain byte-identical apart from two ZoneBase lines.
- [ ] Run real NingShou cumulative routes, real-controller ordinary jumps/head clearance and low-resource old Yangxin/Fengxian regression, no World/browser.
- [ ] Independent review, explicit limitations/docs/I29 unchanged whole acceptance, clean Pages-base build, remote unique branch and fullreadback. Keep d565/main unchanged.

Early local test correction: the first fitted bottom4.665m was below the real60Hz jump head4.691667m. Raise only this new board .15m to bottom4.815m, preserving all old physics/geometry; verify10/30/60/144Hz actual jumps. This avoids new head/visual overlap, not a harmless surveying refinement.
