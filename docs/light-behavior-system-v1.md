# Mirror Light Behavior System v1

The Light Behavior layer is a second visual channel for Mirror. It expresses a
mapped expression through a static field surrounding the avatar. It is
calculated independently from Mirror State:

- Mirror State: `Energy + Momentum`
- Mapped Expression: `Presence + Focus`

The layer leaves avatar selection, state calculation, scoring, reflection
history, analytics, and card logic independent.

## Presence × Focus mapping

| Presence | Narrow | Wide | Scattered |
| --- | --- | --- | --- |
| Relaxed | `emergent.png` | `receptive.png` | `dissonant.png` |
| Content | `faithful.png` | `gracious.png` | `wandering.png` |
| Tense | `constricted.png` | `burdened.png` | `fractured.png` |

The resulting Mirror State does not participate in this lookup. For example,
Stagnant can appear with Emergent, Receptive, or Fractured depending on
Presence and Focus.

## Visual hierarchy

The reveal stack is:

`Mirror frame (coded UI) → Light Behavior PNG → Canonical state PNG`

The canonical state PNG is one complete base image containing both the
behavioral avatar and its black void/background. The Light Behavior PNG is
centered over that complete base image, while the existing coded Mirror frame
remains the foremost UI layer.

## Rendering rules

- Canonical state PNGs and canonical Draft 03 Light Behavior PNGs are preserved
  without resizing, cropping, masking, or artwork modification.
- The canonical state PNG is not separated into avatar and background layers.
- No additional background PNG family is used.
- Assets use normal alpha compositing.
- The layer is centered and static.
- There is no glow filter, blur, blend mode, pulse, rotation, scale, fade, or
  other animation.
- Opacity is kept subtle at approximately 0.52.

## Future animation roadmap

Future micro-animation may be added as a separate layer without coupling Light
Behavior to avatar selection or psychological state calculation.