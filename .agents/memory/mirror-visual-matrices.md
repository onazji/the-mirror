---
name: Mirror visual matrices
description: The independent input matrices used to select canonical state artwork and Light Behavior artwork.
---

Mirror State is calculated from Energy + Momentum and selects the canonical
state PNG/avatar. Light Behavior is calculated independently from Presence +
Focus and selects the transparent expression PNG. Never infer Light Behavior
from the resulting Mirror State.

**Why:** The same state must be able to appear with different expressions
depending on Presence and Focus.

**How to apply:** Preserve the composite order as coded Mirror Frame → Light
Behavior PNG → complete canonical state PNG.