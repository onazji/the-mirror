# Mirror Light Behavior System v1

The Light Behavior layer is a second visual channel for Mirror. It expresses
the psychological state through a static field surrounding the avatar while
leaving the avatar selection, state calculation, scoring, reflection history,
analytics, and card logic independent.

## State mapping

| Psychological state | Light Behavior asset |
| --- | --- |
| Alignment | `faithful.png` |
| Anxiety | `constricted.png` |
| Drift | `wandering.png` |
| Flow | `gracious.png` |
| Idle | `receptive.png` |
| Overdrive | `emergent.png` |
| Patience | `burdened.png` |
| Pressure | `dissonant.png` |
| Stagnant | `fractured.png` |

## Visual hierarchy

The reveal stack remains:

`Background → Light Behavior → Avatar → Mirror Card → UI`

The avatar remains the primary focal point. Light Behavior is centered in the
same reveal stage and rendered beneath the avatar with subtle opacity.

## Rendering rules

- Canonical Draft 03 PNGs are preserved without resizing, cropping, or artwork
  modification.
- Assets use normal alpha compositing.
- The layer is centered and static.
- There is no glow filter, blur, blend mode, pulse, rotation, scale, fade, or
  other animation.
- Opacity is kept subtle at approximately 0.52.

## Future animation roadmap

Future micro-animation may be added as a separate layer without coupling Light
Behavior to avatar selection or psychological state calculation.