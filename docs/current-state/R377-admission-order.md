# R377 canonical Git-order admission

R376 hosted run 43537830025 failed checkout admission because its changes list placed schema before pins while Git sorts paths with pins first. The path sets were identical. No later controls, build or full-world ran. The historical R376 pins and evidence are preserved unchanged.

R377 sorts changed paths before constructing its manifest. No product or previous test bytes change. Its new bounded regression creates real temporary Git parent/candidate commits and executes the complete workflow admission shell, checking parent, parent tree, clean status, Git diff order, all source/retained hashes and evidence receipt. Only the expected parent literal is substituted for the synthetic temporary parent; no assertions are removed. Unsorted historical order must fail, sorted order must pass, and incorrect parent tree, source hash and dirty worktree must fail.

At preparation time hosted results remain pending. No local full-world/build or GPU/phone acceptance; no Fengxian product fix. main remains untouched.
