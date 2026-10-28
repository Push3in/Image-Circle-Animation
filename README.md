# Image Circle Animation

Eleven images arranged in a ring. The largest sits at right-centre; the rest shrink as they go round to the left. The ring turns one place every 3 seconds on its own, or when you drag or click, with each image growing or shrinking as it moves into its next place.

Built from a 1440 × 1024 Figma frame, in plain HTML, CSS and JavaScript. Animation uses [Motion](https://motion.dev); the live control panel is [DialKit](https://github.com/joshpuckett/dialkit).

## Run it

No build step and no install. Either open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

then visit http://localhost:8000/.

## How to use it

- **Auto turn** moves the ring one place clockwise every 3 seconds, each turn easing over 1 second. It pauses while the pointer is over an image, while you drag and while the tab is in the background, and starts a fresh count after you drag, click or use the arrow keys.
- **Drag the right-centre image** up or down along the ring. On release the ring springs to the nearest image; a quick flick carries it further.
- **Click** any other image to bring it to the front.
- **Hover** any image and every image except the front one leans its right side back, up to 8°. The front image stays flat, and the tilt eases in over the first place either side of it so a turning image doesn't jump. The hovered image lifts slightly. Switch Tilt → Hover → Mode to "place" to tilt every image by its place on the ring instead, so the ring dips like a bowl.
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
| Motion | The spring the ring settles with (stiffness 230, damping 35) |
| Motion → Auto | On/off, step interval (3 s from one turn to the next), transition duration (1 s per turn) |
| Interaction → Drag | On/off, drag from anywhere or only the front image, ring / vertical / horizontal mode, follow, how far a flick carries, flick speed cap |
| Interaction → Click | On/off, bring the clicked image to the front or move one step towards it, whether clicking the front image moves on one place |
| Ring | Radius, stretch, size of the left gap. Stretch is a pad: left/right widens the ring (1 to 1.5), up/down sets its height (0.5 to 1.5, default 0.9) |
| Images | Scale and corner radius |
| Images → Gap Fade | Fade arc and blur |
| Images → Dimming | On/off, far opacity, and the angles where dimming starts and is fully applied |
| Perspective | Enabled (whether images turn to lie in the plane), 3D depth of the left side, viewer distance |
| Tilt | Viewer distance used for every tilt |
| Tilt → Hover | Mode (place, right, no tilt center, pointer or bank; default no tilt center), which images tilt (range), amount (default 8°), reach, lift scale, response |
| Tilt → Turn | Tip the images while the ring is turning, by bank or lean, scaled by turning speed (off by default) |
| Skeleton | What the overlay draws and how it looks (starts collapsed) |

Perspective depth starts at 0, so the ring loads flat. Raise **Perspective → Depth** to make the left side recede.

Perspective and Tilt are independent. Perspective places the images on a receding plane and uses its own viewer distance. Each tilt is then drawn about the image's own centre using **Tilt → Perspective**, so a tilt looks the same anywhere on the ring and does not change when the ring's perspective does. Dimming works with or without depth.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page |
| `orbit.js` | All layout, auto turn, drag, click, hover and overlay logic, plus the dial configuration |
| `styles.css` | Page, overlay, switch and pad-line styles |
| `Images/` | The eleven images |
| `vendor/motion/` | Motion 14.1.0, browser build |
| `vendor/dialkit/` | DialKit 2.0.2, browser build, with one local change (see its README) |

The size stops and image order are the `SIZE_STOPS` and `IMAGES` constants at the top of `orbit.js`. Every dial's default is in the `createDialKit` call just below them.

`package.json` records the versions the vendored files were copied from. The page itself loads only from `vendor/`.

## Notes

- With "reduce motion" turned on in the system settings, the ring jumps to its new position instead of animating, and does not turn on its own.
- Hover tilt does not apply on touch screens.
- Motion and DialKit are MIT licensed; their licences are alongside the vendored files.
