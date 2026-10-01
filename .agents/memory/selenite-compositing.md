---
name: Selenite compositing
description: Material/environment separation and the clipped-layer compositing constraint.
---

Keep selenite delivery artwork neutral and environmental illumination separate.

**Why:** The intended material system must eventually respond to its environment independently; baking warm/lavender/cyan illumination into the texture would prevent that separation.

**How to apply:** Preserve the canonical neutral material when creating derivatives. Obtain environmental colors through compositing with the stationary environment, not recolored texture artwork.

A polygon-clipped material establishes a stacking context. A soft-light child blends with other material layers inside that context, not directly with the environment behind it. Multiple translucent source layers also compound coverage.

**Why:** A strong secondary texture layer made the luminous phase nearly gray despite a low-opacity primary layer in a mobile browser capture.

**How to apply:** Judge combined coverage, not a single layer's opacity. Keep secondary strata treatment restrained so actual environmental color can transmit through the composite.