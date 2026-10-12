# Image Circle Animation

Eleven images arranged in a ring. The largest sits at right-centre; the rest shrink as they go round to the left. Drag the front image and the ring turns, with each image growing or shrinking as it moves into its next place.

Built from a 1440 × 1024 Figma frame, in plain HTML, CSS and JavaScript. Animation uses [Motion](https://motion.dev); the live control panel is [DialKit](https://github.com/joshpuckett/dialkit).

## Run it

No build step and no install. Either open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

then visit http://localhost:8000/.

## How to use it

- **Drag the right-centre image** up or down along the ring. On release the ring springs to the nearest image; a quick flick carries it further.
- **Hover** an image on the right half and the images from -90° to 90° lean back on their right side.
- **Arrow keys** turn the ring one place when the front image is focused.
- **Off / On pill** (bottom-left) shows the "Fancy" overlay: the orbit path, the size stops, the gap and fade zones, and each image's live angle, size and opacity.
- **Dial panel** (top-right icon) tunes everything live. Nothing is saved; reloading restores the defaults.

## How the layout works

Angles are measured from the front image: 0° is right-centre, positive angles run clockwise (down the screen), and 180° is the far left.

**Size.** An image's size depends only on its angle. These stops are interpolated linearly, so an image passing a stop is exactly that size:

| Angle | Size |
| --- | --- |
| 0° | 320 × 180 |
| ±30° | 240 × 130 |
| ±60° | 160 × 100 |
| ±90° | 128 × 80 |
| ±120° | 112 × 70 |
| ±150° | 80 × 50 |
| 180° | 64 × 40 |

**Spacing.** The eleven images are evenly spaced, then squeezed towards the front to leave a 60° gap on the left. At rest they sit exactly on the stops above, 30° apart.

**Crossing the gap.** The image that crosses the left gap during a turn fades out over the first 10° past the gap's edge, blurring as it goes, stays hidden across the middle, and fades back in over the last 10°.

**Dimming.** Images further back are dimmer, down to 0.35 at the far left. The images at 0° and ±30° are left at full opacity, and the dimming eases in between 30° and 60°.

## Dial panel

| Folder | Controls |
| --- | --- |
| Fancy | Master on/off for the overlay (same as the bottom-left pill) |
| Motion | The spring used on release (stiffness 230, damping 35) |
| Motion → Drag | Drag from anywhere or only the front image; how far a flick carries |
| Motion → Turn Tilt | Tip the images while the ring is turning (off by default) |
| Ring | Radius, horizontal and vertical stretch, size of the left gap |
| Images | Scale and corner radius |
| Images → Hover Tilt | Mode, which images tilt (range), amount, reach, lift scale, response |
| Gap Fade | Fade arc and blur |
| Perspective | 3D depth of the left side, viewer distance, whether images turn with the plane |
| Perspective → Dimming | Far opacity, and the angles where dimming starts and is fully applied |
| Skeleton | What the overlay draws and how it looks (starts collapsed) |

Perspective depth starts at 0, so the ring loads flat. Raise **Perspective → Depth** to make the left side recede.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page |
| `orbit.js` | All layout, drag, hover and overlay logic, plus the dial configuration |
| `styles.css` | Page, overlay and switch styles |
| `Images/` | The eleven images |
| `vendor/motion/` | Motion 14.1.0, browser build |
| `vendor/dialkit/` | DialKit 2.0.2, browser build, with one local change (see its README) |

The size stops and image order are the `SIZE_STOPS` and `IMAGES` constants at the top of `orbit.js`. Every dial's default is in the `createDialKit` call just below them.

`package.json` records the versions the vendored files were copied from. The page itself loads only from `vendor/`.

## Notes

- With "reduce motion" turned on in the system settings, the ring jumps to its new position instead of animating.
- Hover tilt does not apply on touch screens.
- Motion and DialKit are MIT licensed; their licences are alongside the vendored files.
