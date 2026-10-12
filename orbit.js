(() => {
  const { animate, wrap } = Motion;

  // Figma frame "Images Circle" (1:3) is 1440 × 1024.
  const DESIGN = { width: 1440, height: 1024 };

  // Frame sizes from the Figma file, keyed by how far (in degrees) an image
  // sits from the front of the orbit. The 180° stop is extrapolated: the
  // design leaves that slot empty.
  const SIZE_STOPS = [
    { angle: 0, width: 320, height: 180 },
    { angle: 30, width: 240, height: 130 },
    { angle: 60, width: 160, height: 100 },
    { angle: 90, width: 128, height: 80 },
    { angle: 120, width: 112, height: 70 },
    { angle: 150, width: 80, height: 50 },
    { angle: 180, width: 64, height: 40 },
  ];

  // Clockwise from the front (right-hand) image, matching the Figma layout.
  const IMAGES = [
    { file: "red_light_conceptual_character_god_headshot_photo_woman_with__1f877209-8471-42b1-bdd0-0967b0b5d65a_3.webp", alt: "Woman in red light" },
    { file: "Black_calla_lilies_--chaos_30_--ar_12581523_--exp_50_--sref_1_50a20287-17ae-412d-9c3e-a457d86eba68_2.webp", alt: "Black calla lilies on blue" },
    { file: "a_close-up_of_the_sunglasses_with_thick_blue_frames_and_black_caf248a6-4877-4c33-8325-cd2e19eeceb0_2.webp", alt: "Blue-framed sunglasses" },
    { file: "a_cute_transparent_dragon_with_holographic_wings_in_a_beautif_0886e7c1-2034-41de-8088-4819e70e5f03_3.webp", alt: "Transparent dragon in a garden" },
    { file: "Christmas_toy_--chaos_10_--ar_169_--exp_10_--sref_4404291381__09322db5-0740-4807-b6de-cba435d17a42_1.webp", alt: "Toy dinosaur" },
    { file: "3d_aura_circle_made_with_topographical_lines_minimalist_smoot_35846b5f-f2c5-4ff3-a3e9-4e6331b49a88_3.webp", alt: "Glowing aura ring" },
    { file: "moss_person_with_sport_water_bottle_learning_minimalist_edito_cbd35b66-3a31-4cbf-b6e1-a71929fcf1c3_0.webp", alt: "Moss figure" },
    { file: "test_--sref_2491812127_--profile_l3h4vio_--sw_500_--stylize_5_8af7be4a-5510-4e77-aa77-e2410fd4fe94_3.webp", alt: "Colourful painting" },
    { file: "macro_product_photo_thick_gel_cleanser_pouring_in_a_slow_ribb_ea209f59-640c-4c16-8356-c146a4831d2d_3.webp", alt: "Ribbon of gel" },
    { file: "red_light_conceptual_Eponas_horses_--chaos_30_--ar_12581523_-_7e2eae23-ab85-4470-b52f-4f6f1dd3a8f6_1.webp", alt: "Horses in red light" },
    { file: "movie_still_photorealism_surrealist_--chaos_100_--ar_169_--ex_f5ac8d1d-0991-4ae0-8663-5801495fc837_3.webp", alt: "Two people in a film still" },
  ];

  const stage = document.getElementById("stage");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  DialKit.createDialRoot({ theme: "dark", defaultOpen: false });
  const dial = DialKit.createDialKit("Orbit", {
    fancy: true, // overlay showing how the orbit is constructed

    // How the ring turns when dragged and how it settles on release.
    motion: {
      transition: { type: "spring", stiffness: 230, damping: 35, mass: 1 },
      drag: {
        anywhere: false, // off: only the front (right-centre) image can be dragged
        flick: [0.15, 0, 0.6, 0.01], // seconds of travel a release carries on for; 0 snaps to the nearest image
      },
      // Images tip over while the ring is turning and settle flat as it stops.
      turnTilt: {
        enabled: false,
        mode: { type: "select", options: ["bank", "lean"], default: "bank" }, // bank tips in 3D, lean rotates flat on screen
        amount: [20, -60, 60, 1], // degrees at a turning speed of 180°/s; negative tips the other way
      },
    },

    // Shape of the ring the images sit on.
    ring: {
      radius: [420, 200, 560, 1],
      horizontalStretch: [1, 1, 1.5, 0.01], // widens the ring; the Figma layout is about 1.27
      verticalStretch: [1, 0.5, 1.5, 0.01], // makes the ring taller or shorter; both at 1 is a true circle
      leftGap: [60, 33, 140, 1], // degrees of empty arc on the left; 60 matches the Figma layout
    },

    images: {
      scale: [1, 0.5, 1.5, 0.01],
      cornerRadius: [2, 0, 24, 1],
      // While the pointer is over an image, the images within `range` of the
      // front tilt. "right" leans the right side of them all back by `amount`;
      // "pointer" turns them all to face away from the pointer, so each tilts
      // by where the pointer is relative to it; "bank" and "lean" give just
      // the hovered image a set tilt for its place on the ring.
      hoverTilt: {
        enabled: true,
        mode: { type: "select", options: ["right", "pointer", "bank", "lean"], default: "right" },
        range: [90, 0, 180, 5], // degrees either side of the front that can tilt; 90 is -90° to 90°
        amount: [25, -60, 60, 1], // maximum degrees of tilt
        reach: [400, 50, 1200, 10], // "pointer" mode: distance from an image at which its tilt is at maximum
        scale: [1.04, 1, 1.3, 0.01], // how much the hovered image grows
        response: [10, 2, 30, 1], // how quickly it follows the pointer; higher is snappier
      },
    },

    // How an image disappears while it crosses the left gap.
    gapFade: {
      arc: [10, 1, 30, 1], // degrees past each gap edge over which it fades
      blur: [12, 0, 40, 1], // px of blur reached when fully faded
    },

    // 3D depth: the ring becomes a plane whose left side recedes from the viewer.
    perspective: {
      enabled: true,
      distance: [1200, 300, 4000, 10], // viewer distance; smaller is more dramatic
      depth: [0, 0, 1500, 10], // how far back the left side sits; the front stays put
      tiltImages: true, // turn images to lie in the plane instead of facing the viewer
      // Images further back are dimmed.
      dimming: {
        farOpacity: [0.35, 0, 1, 0.01], // image opacity at the far left; the front stays at 1
        clearUntil: [30, 0, 180, 1], // images within this angle of the front are not dimmed
        dimFrom: [60, 0, 180, 1], // dimming is fully applied from this angle round the back
      },
    },

    // What the Fancy overlay draws, layer by layer.
    skeleton: {
      _collapsed: true,
      guides: {
        orbitPath: true,
        centerReadout: true, // crosshair plus rotation and step values
        gapZones: true, // the left gap and the arcs where images fade
        dragTarget: true,
      },
      sizeStops: {
        boxes: true, // dashed boxes at fixed angles
        labels: true,
        spacing: [30, 10, 90, 5], // degrees between size stops
        labelPosition: [0.5, 0.15, 0.95, 0.01], // 0 is the centre, 1 the orbit path
      },
      imageMarkers: {
        spokes: true,
        outlines: true,
        centerDots: true,
      },
      imageLabels: {
        number: true,
        angle: true,
        size: true,
        opacity: true, // current image opacity whenever it is below 1
        fade: true, // opacity and blur while crossing the gap
        decimals: [0, 0, 2, 1],
      },
      style: {
        color: "#5ed2ff",
        imageDim: [0.3, 0, 1, 0.01], // image opacity while the overlay is on
        strength: [1, 0.1, 1, 0.01], // overlay opacity
        labelSize: [11, 8, 20, 1],
        lineWidth: [1, 0.5, 4, 0.5],
      },
    },
  });

  const items = IMAGES.map(({ file, alt }) => {
    const figure = document.createElement("figure");
    figure.className = "orbit-item";
    const img = document.createElement("img");
    img.src = `./Images/${file}`;
    img.alt = alt;
    img.draggable = false;
    // The figure is the pointer target and never tilts under the pointer; the
    // card inside it carries the hover tilt, so hovering an edge can't swing
    // that edge out from under the cursor.
    const card = document.createElement("div");
    card.className = "orbit-card";
    card.append(img);
    figure.append(card);
    stage.append(figure);
    return figure;
  });
  const cards = items.map((item) => item.firstElementChild);

  function sizeAt(distance) {
    for (let i = 1; i < SIZE_STOPS.length; i++) {
      const from = SIZE_STOPS[i - 1];
      const to = SIZE_STOPS[i];
      if (distance <= to.angle) {
        const t = (distance - from.angle) / (to.angle - from.angle);
        return {
          width: from.width + (to.width - from.width) * t,
          height: from.height + (to.height - from.height) * t,
        };
      }
    }
    return SIZE_STOPS[SIZE_STOPS.length - 1];
  }

  const skeleton = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  skeleton.classList.add("skeleton");
  skeleton.setAttribute("aria-hidden", "true");
  stage.append(skeleton);

  // On-page switch for the overlay; mirrors the "fancy" dial.
  const skeletonSwitch = document.getElementById("skeleton-switch");
  skeletonSwitch.addEventListener("click", () => dial.setValue("fancy", !dial.values.fancy));

  const step = 360 / items.length;
  let rotation = 0; // degrees; 0 puts the first image at the front
  let target = 0;
  let frontIndex = 0;
  let spin = null;
  let spinVelocity = 0; // degrees per second, measured while a step is animating
  let lastTick = 0;

  // Images are evenly spaced around the ring, then squeezed towards the front
  // so the two on the far left sit `leftGap` degrees apart. An image crossing
  // the gap during a step sweeps through it rather than jumping.
  // Angle at which the left gap starts (150° with the default 60° gap).
  const gapEdge = () => 180 - Math.max(dial.values.ring.leftGap, step) / 2;

  function displayAngle(logical) {
    const angle = wrap(-180, 180, logical);
    const outer = 180 - step / 2; // resting angle of the two left-most images
    const edge = gapEdge();
    const distance = Math.abs(angle);
    const squeezed =
      distance <= outer
        ? (distance * edge) / outer
        : edge + ((distance - outer) * (180 - edge)) / (180 - outer);
    return Math.sign(angle) * squeezed;
  }

  function layout() {
    const { radius, horizontalStretch, verticalStretch } = dial.values.ring;
    const { scale: imageScale, cornerRadius } = dial.values.images;
    const { gapFade } = dial.values;
    const fit = Math.min(stage.clientWidth / DESIGN.width, stage.clientHeight / DESIGN.height);
    const centerX = stage.clientWidth / 2;
    const centerY = stage.clientHeight / 2;
    const radiusX = radius * horizontalStretch * fit;
    const radiusY = radius * verticalStretch * fit;

    // Perspective: depth falls off linearly from the front (0) to the far
    // left (-depth), which is a flat plane turned about a vertical axis.
    const { perspective } = dial.values;
    const depth = perspective.enabled ? perspective.depth * fit : 0;
    const viewer = perspective.distance * fit;
    const tilt = perspective.enabled && perspective.tiltImages ? Math.atan2(depth, radiusX * 2) : 0;
    // The stage always has perspective so tilts read as 3D; `enabled` only
    // controls the receding plane and the dimming.
    stage.style.perspective = `${viewer}px`;

    // `flat` is a position on the ring before perspective; `depthAt` and
    // `project` reproduce the browser's 3D projection so the overlay can be
    // drawn in the same place as the transformed images.
    const flat = (angle, distance = 1) => {
      const radians = (angle * Math.PI) / 180;
      return {
        x: centerX + Math.cos(radians) * radiusX * distance,
        y: centerY + Math.sin(radians) * radiusY * distance,
      };
    };
    const depthAt = (x) => (-depth * (1 - (x - centerX) / radiusX)) / 2;
    const project = (x, y, z) => {
      const scale = viewer / (viewer - z);
      return { x: centerX + (x - centerX) * scale, y: centerY + (y - centerY) * scale };
    };
    const geometry = {
      // Projected point on the ring, optionally nudged in screen-plane pixels.
      point(angle, distance = 1, offsetX = 0, offsetY = 0) {
        const at = flat(angle, distance);
        return project(at.x + offsetX, at.y + offsetY, depthAt(at.x));
      },
      // Projected corners of a box centred on the ring at `angle`. Mirrors
      // the CSS transform given to the images, applied innermost first: hover
      // scale and tilt, the turn tilt (`tip` radians), the plane's turn, depth.
      box(angle, width, height, tip = 0, hover = null) {
        const at = flat(angle);
        const z = depthAt(at.x);
        return [[-1, -1], [1, -1], [1, 1], [-1, 1]]
          .map(([u, v]) => {
            let p = [(u * width) / 2, (v * height) / 2, 0];
            if (hover) {
              p = [p[0] * hover.scale, p[1] * hover.scale, 0];
              if (hover.axis) p = turn(p, hover.axis, hover.angle);
              else p = turn(turn(p, [0, 1, 0], hover.y), [1, 0, 0], hover.x);
            }
            p = turn(p, tiltAxis(motionTilt.mode, angle), tip);
            const corner = project(
              at.x + p[0] * Math.cos(tilt) - p[2] * Math.sin(tilt),
              at.y + p[1],
              z + p[0] * Math.sin(tilt) + p[2] * Math.cos(tilt)
            );
            return `${corner.x.toFixed(1)},${corner.y.toFixed(1)}`;
          })
          .join(" ");
      },
    };

    // Rotates point `p` by `radians` about unit axis `k`, as CSS rotate3d does.
    function turn(p, k, radians) {
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const along = (k[0] * p[0] + k[1] * p[1] + k[2] * p[2]) * (1 - cos);
      return [
        p[0] * cos + (k[1] * p[2] - k[2] * p[1]) * sin + k[0] * along,
        p[1] * cos + (k[2] * p[0] - k[0] * p[2]) * sin + k[1] * along,
        p[2] * cos + (k[0] * p[1] - k[1] * p[0]) * sin + k[2] * along,
      ];
    }
    // "bank" tips in 3D about the line from the ring's centre through the
    // image; "lean" rotates flat on screen.
    function tiltAxis(mode, angle) {
      if (mode === "lean") return [0, 0, 1];
      const radians = (angle * Math.PI) / 180;
      return [Math.cos(radians), Math.sin(radians), 0];
    }

    // Turn tilt: every image tips by the same angle, proportional to how
    // fast the ring is turning. "bank" tips in 3D about the line from the
    // ring's centre through the image; "lean" rotates flat on screen.
    const motionTilt = dial.values.motion.turnTilt;
    const tip = motionTilt.enabled
      ? (Math.max(-2, Math.min(2, spinVelocity / 180)) * motionTilt.amount * Math.PI) / 180
      : 0;
    const { hoverTilt } = dial.values.images;
    const edge = gapEdge();
    const live = [];

    items.forEach((item, index) => {
      const angle = displayAngle(rotation + index * step);
      const size = sizeAt(Math.abs(angle));
      const width = size.width * imageScale * fit;
      const height = size.height * imageScale * fit;
      const center = flat(angle);
      const x = center.x - width / 2;
      const y = center.y - height / 2;
      // Crossing the left gap, an image fades out over the first `fadeArc`
      // degrees past the gap's edge (150° to 160° by default), stays hidden
      // across the middle, and fades back in over the last `fadeArc` degrees.
      // Blur rises as opacity falls.
      const fadeArc = Math.min(gapFade.arc, 180 - edge);
      const fadeOpacity = Math.max(0, Math.min(1, (edge + fadeArc - Math.abs(angle)) / fadeArc));
      const blur = (1 - fadeOpacity) * gapFade.blur * fit;
      // With perspective on, images also dim the deeper they sit, down to
      // `farOpacity` at the far left. Images within `clearUntil` degrees of
      // the front are left at 1, and the dimming eases in up to `dimFrom` so
      // an image moving between the two doesn't jump.
      const depthRatio = (1 - (center.x - centerX) / radiusX) / 2;
      const { farOpacity, clearUntil, dimFrom } = perspective.dimming;
      const dimAmount =
        dimFrom > clearUntil
          ? Math.max(0, Math.min(1, (Math.abs(angle) - clearUntil) / (dimFrom - clearUntil)))
          : Number(Math.abs(angle) >= dimFrom);
      const depthOpacity = perspective.enabled ? 1 - dimAmount * depthRatio * (1 - farOpacity) : 1;
      const opacity = fadeOpacity * depthOpacity;

      item.style.width = `${width}px`;
      item.style.height = `${height}px`;
      item.style.translate = `${x}px ${y}px`;
      const transforms = [];
      if (perspective.enabled) {
        transforms.push(`translateZ(${depthAt(center.x).toFixed(2)}px)`, `rotateY(${(-tilt).toFixed(4)}rad)`);
      }
      if (tip !== 0) {
        const [kx, ky, kz] = tiltAxis(motionTilt.mode, angle);
        transforms.push(`rotate3d(${kx.toFixed(4)}, ${ky.toFixed(4)}, ${kz}, ${tip.toFixed(4)}rad)`);
      }
      // Hover tilt, only for images within `range` of the front.
      const lifted = hoverPoses[index].amount;
      const card = cards[index];
      const maxTilt = (hoverTilt.amount * Math.PI) / 180;
      const scale = 1 + (hoverTilt.scale - 1) * lifted;
      let hover = null;
      if (Math.abs(angle) <= hoverTilt.range + 0.5) {
        if (hoverTilt.mode === "right" && pointerPose.amount > 0.001) {
          // Turn about the image's vertical centre line: right side back.
          hover = { scale, x: 0, y: maxTilt * pointerPose.amount };
        } else if (hoverTilt.mode === "pointer" && pointerPose.amount > 0.001) {
          // Offset from this image to the pointer, as -1 to 1 at `reach`. The
          // side nearest the pointer swings away from the viewer.
          const reach = hoverTilt.reach * fit;
          const offsetX = Math.max(-1, Math.min(1, (pointerPose.x - center.x) / reach));
          const offsetY = Math.max(-1, Math.min(1, (pointerPose.y - center.y) / reach));
          hover = { scale, x: -offsetY * maxTilt * pointerPose.amount, y: offsetX * maxTilt * pointerPose.amount };
        } else if ((hoverTilt.mode === "bank" || hoverTilt.mode === "lean") && lifted > 0.001) {
          hover = { scale, axis: tiltAxis(hoverTilt.mode, angle), angle: maxTilt * lifted };
        }
      }
      if (!hover && lifted > 0.001) hover = { scale, x: 0, y: 0 };
      if (!hover) card.style.transform = "none";
      else if (hover.axis) {
        card.style.transform = `rotate3d(${hover.axis[0].toFixed(4)}, ${hover.axis[1].toFixed(4)}, ${hover.axis[2]}, ${hover.angle.toFixed(4)}rad) scale(${scale.toFixed(4)})`;
      } else {
        card.style.transform = `rotateX(${hover.x.toFixed(4)}rad) rotateY(${hover.y.toFixed(4)}rad) scale(${scale.toFixed(4)})`;
      }
      angles[index] = angle;
      card.style.opacity = opacity;
      card.style.filter = blur > 0 ? `blur(${blur.toFixed(2)}px)` : "none";
      card.style.borderRadius = `${cornerRadius * fit}px`;
      item.style.pointerEvents = opacity < 0.05 ? "none" : "";
      item.style.zIndex = Math.round(size.width);
      item.classList.toggle("is-front", index === frontIndex);
      item.setAttribute("aria-label", index === frontIndex ? `${IMAGES[index].alt}. Drag or use arrow keys to turn the ring.` : IMAGES[index].alt);
      item.tabIndex = index === frontIndex ? 0 : -1;
      live.push({ index, angle, size, width, height, opacity, fadeOpacity, blur, hover });
    });

    stage.classList.toggle("drag-anywhere", dial.values.motion.drag.anywhere);
    const showSkeleton = dial.values.fancy;
    skeletonSwitch.setAttribute("aria-checked", String(showSkeleton));
    stage.classList.toggle("show-skeleton", showSkeleton);
    if (showSkeleton) drawSkeleton({ live, geometry, fit, tip });
  }

  // Draws the construction behind the animation: the orbit path, the size
  // stops each image is interpolated between, the gap and fade zones, and
  // every image's live values as the ring turns. Each layer has its own dial.
  function drawSkeleton({ live, geometry, fit, tip }) {
    const { gapFade } = dial.values;
    const imageScale = dial.values.images.scale;
    const { guides, sizeStops, imageMarkers: markers, imageLabels: labels, style } = dial.values.skeleton;
    const { point, box } = geometry;
    const n = (value) => value.toFixed(1);
    const at = (p) => `x="${n(p.x)}" y="${n(p.y)}"`;
    // Curves are sampled so they follow the perspective projection.
    const curve = (from, to) => {
      const points = [];
      for (let angle = from; angle < to; angle += 3) points.push(point(angle));
      points.push(point(to));
      return points.map((p) => `${n(p.x)},${n(p.y)}`).join(" ");
    };
    const center = point(0, 0);
    const parts = [];

    stage.style.setProperty("--sk-accent", style.color);
    stage.style.setProperty("--sk-image-dim", style.imageDim);
    stage.style.setProperty("--sk-strength", style.strength);
    stage.style.setProperty("--sk-line", `${style.lineWidth}px`);
    skeleton.style.fontSize = `${style.labelSize}px`;

    if (guides.orbitPath) {
      parts.push(`<polygon class="sk-path" points="${curve(0, 357)}" />`);
    }

    if (guides.gapZones) {
      const edge = gapEdge();
      const fadeArc = Math.min(gapFade.arc, 180 - edge);
      parts.push(
        `<polyline class="sk-gap" points="${curve(edge, 360 - edge)}" />`,
        `<polyline class="sk-fade" points="${curve(edge, edge + fadeArc)}" />`,
        `<polyline class="sk-fade" points="${curve(360 - edge - fadeArc, 360 - edge)}" />`,
        `<text class="sk-note sk-note-front" ${at(point(180, 1.12))} text-anchor="end" dominant-baseline="middle">gap ${n(360 - edge * 2)}° · fade ${n(fadeArc)}°</text>`
      );
    }

    if (guides.centerReadout) {
      const lineHeight = style.labelSize + 5;
      parts.push(
        `<path class="sk-guide" d="M${n(center.x - 8)} ${n(center.y)}h16M${n(center.x)} ${n(center.y - 8)}v16" />`,
        `<text class="sk-note" x="${n(center.x)}" y="${n(center.y + 12 + lineHeight)}" text-anchor="middle">rotation ${wrap(0, 360, rotation).toFixed(labels.decimals)}°</text>`,
        `<text class="sk-note" x="${n(center.x)}" y="${n(center.y + 12 + lineHeight * 2)}" text-anchor="middle">step ${displayAngle(step).toFixed(1)}° per image</text>`,
        `<text class="sk-note" x="${n(center.x)}" y="${n(center.y + 12 + lineHeight * 3)}" text-anchor="middle">tilt ${((tip * 180) / Math.PI).toFixed(1)}°</text>`
      );
    }

    // Size stops: an image passing this angle is exactly this size.
    if (sizeStops.boxes || sizeStops.labels) {
      for (let angle = 0; angle <= 180; angle += sizeStops.spacing) {
        const stop = sizeAt(angle);
        const width = stop.width * imageScale * fit;
        const height = stop.height * imageScale * fit;
        const sides = angle === 0 || angle === 180 ? [angle] : [angle, -angle];
        sides.forEach((side) => {
          if (sizeStops.boxes && !(side === 0 && guides.dragTarget)) {
            parts.push(`<polygon class="sk-stop" points="${box(side, width, height)}" />`);
          }
          if (sizeStops.labels) {
            parts.push(
              `<text class="sk-note" ${at(point(side, sizeStops.labelPosition))} text-anchor="middle" dominant-baseline="middle">${side}° · ${Math.round(stop.width)}×${Math.round(stop.height)}</text>`
            );
          }
        });
      }
    }

    if (guides.dragTarget) {
      const front = SIZE_STOPS[0];
      const width = front.width * imageScale * fit;
      const height = front.height * imageScale * fit;
      parts.push(
        `<polygon class="sk-stop sk-stop-front" points="${box(0, width, height)}" />`,
        `<text class="sk-note sk-note-front" ${at(point(0, 1, 0, -height / 2 - 10))} text-anchor="middle">drag target</text>`
      );
    }

    // Live images: spoke from the centre, outline, and current values.
    live.forEach(({ index, angle, size, width, height, opacity, fadeOpacity, blur, hover }) => {
      const text = [];
      if (labels.number) text.push(`#${index + 1}`);
      if (labels.angle) text.push(`${angle.toFixed(labels.decimals)}°`);
      if (labels.size) text.push(`${size.width.toFixed(labels.decimals)}×${size.height.toFixed(labels.decimals)}`);
      const fading = labels.fade && fadeOpacity < 1;
      if (fading || (labels.opacity && opacity < 1)) text.push(`opacity ${opacity.toFixed(2)}`);
      if (fading) text.push(`blur ${blur.toFixed(1)}`);
      const middle = point(angle);

      parts.push(`<g opacity="${fadeOpacity.toFixed(2)}">`);
      if (markers.spokes) {
        parts.push(`<line class="sk-spoke" x1="${n(center.x)}" y1="${n(center.y)}" x2="${n(middle.x)}" y2="${n(middle.y)}" />`);
      }
      if (markers.outlines) {
        parts.push(`<polygon class="sk-live" points="${box(angle, width, height, tip, hover)}" />`);
      }
      if (markers.centerDots) {
        parts.push(`<circle class="sk-dot" cx="${n(middle.x)}" cy="${n(middle.y)}" r="${2 + style.lineWidth}" />`);
      }
      if (text.length) {
        const below = point(angle, 1, 0, height / 2);
        parts.push(
          `<text class="sk-live-label" x="${n(below.x)}" y="${n(below.y + style.labelSize + 3)}" text-anchor="middle">${text.join(" · ")}</text>`
        );
      }
      parts.push(`</g>`);
    });

    skeleton.innerHTML = parts.join("");
  }

  // Hover tilt state, eased every frame. `pointerPose` is the pointer's
  // position on the stage and how strongly the group tilt is applied (0 to 1);
  // `hoverPoses` is how far each image is lifted (0 at rest, 1 when hovered).
  const pointerPose = { x: 0, y: 0, amount: 0, targetX: 0, targetY: 0, targetAmount: 0 };
  const hoverPoses = items.map(() => ({ amount: 0, targetAmount: 0 }));
  const angles = items.map(() => 0); // each image's current angle, set by layout()
  let hoverFrame = 0;
  let hoverTime = 0;

  function easeHover(now) {
    const seconds = Math.min((now - hoverTime) / 1000, 0.064);
    hoverTime = now;
    const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-seconds * dial.values.images.hoverTilt.response);
    let moving = false;
    const ease = (pose, key, goal) => {
      const gap = pose[goal] - pose[key];
      if (Math.abs(gap) < (key === "amount" ? 0.001 : 0.1)) pose[key] = pose[goal];
      else {
        pose[key] += gap * blend;
        moving = true;
      }
    };
    ease(pointerPose, "x", "targetX");
    ease(pointerPose, "y", "targetY");
    ease(pointerPose, "amount", "targetAmount");
    hoverPoses.forEach((pose) => ease(pose, "amount", "targetAmount"));
    layout();
    hoverFrame = moving ? requestAnimationFrame(easeHover) : 0;
  }

  function startHoverEasing() {
    if (hoverFrame) return;
    hoverTime = performance.now();
    hoverFrame = requestAnimationFrame(easeHover);
  }

  function clearHover() {
    pointerPose.targetAmount = 0;
    hoverPoses.forEach((pose) => (pose.targetAmount = 0));
    startHoverEasing();
  }

  stage.addEventListener("pointermove", (event) => {
    // No tilt for touch (nothing hovers) or while dragging.
    const { hoverTilt } = dial.values.images;
    if (event.pointerType === "touch" || drag || !hoverTilt.enabled) return;
    const hovered = items.indexOf(event.target.closest(".orbit-item"));
    const tiltable = hovered !== -1 && Math.abs(angles[hovered]) <= hoverTilt.range + 0.5;
    hoverPoses.forEach((pose, index) => (pose.targetAmount = tiltable && index === hovered ? 1 : 0));
    pointerPose.targetX = event.clientX;
    pointerPose.targetY = event.clientY;
    // Arriving from nowhere, start at the pointer rather than sweeping in
    // from wherever it last was.
    if (pointerPose.amount === 0) {
      pointerPose.x = event.clientX;
      pointerPose.y = event.clientY;
    }
    pointerPose.targetAmount = tiltable ? 1 : 0;
    startHoverEasing();
  });
  stage.addEventListener("pointerleave", clearHover);

  // Springs the ring to `destination` (a whole number of steps), carrying
  // over `velocity` in degrees per second from a drag.
  function settle(destination, velocity = 0) {
    target = destination;
    frontIndex = wrap(0, items.length, -Math.round(target / step));
    spin?.stop();
    if (reducedMotion.matches || target === rotation) {
      rotation = target;
      spinVelocity = 0;
      lastTick = 0;
      layout();
      return;
    }
    spin = animate(rotation, target, {
      ...dial.values.motion.transition,
      velocity,
      onUpdate: (latest) => {
        const now = performance.now();
        const elapsed = (now - lastTick) / 1000;
        if (lastTick && elapsed > 0) spinVelocity += ((latest - rotation) / elapsed - spinVelocity) * 0.5;
        lastTick = now;
        rotation = latest;
        layout();
      },
      onComplete: () => {
        spinVelocity = 0;
        lastTick = 0;
        layout();
      },
    });
  }

  // The orbit only moves when it is dragged. Dragging the front
  // (right-centre) image turns the ring with the pointer; on release it
  // springs to the nearest image, thrown further by a quick flick.
  let drag = null;

  function pointerAngle(event) {
    const x = (event.clientX - stage.clientWidth / 2) / dial.values.ring.horizontalStretch;
    const y = (event.clientY - stage.clientHeight / 2) / dial.values.ring.verticalStretch;
    return (Math.atan2(y, x) * 180) / Math.PI;
  }

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const onFront = event.target.closest(".orbit-item") === items[frontIndex];
    if (!onFront && !dial.values.motion.drag.anywhere) return;
    spin?.stop();
    stage.setPointerCapture(event.pointerId);
    stage.classList.add("is-dragging");
    drag = { pointerId: event.pointerId, angle: pointerAngle(event), time: performance.now() };
    spinVelocity = 0;
    lastTick = 0;
    clearHover();
    requestAnimationFrame(holdDrag);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const angle = pointerAngle(event);
    const now = performance.now();
    // The left gap squeezes the images towards the front, so the ring has to
    // turn slightly more than the pointer for the image to stay under it.
    const gain = (180 - step / 2) / gapEdge();
    const change = wrap(-180, 180, angle - drag.angle) * gain;
    const elapsed = Math.max(now - drag.time, 1) / 1000;
    rotation += change;
    spinVelocity += (change / elapsed - spinVelocity) * 0.35;
    drag.angle = angle;
    drag.time = now;
    layout();
  });

  // While the pointer is held still, let the measured speed (and with it the
  // motion tilt) die away.
  function holdDrag() {
    if (!drag) return;
    if (performance.now() - drag.time > 40 && spinVelocity !== 0) {
      spinVelocity = Math.abs(spinVelocity) < 1 ? 0 : spinVelocity * 0.8;
      layout();
    }
    requestAnimationFrame(holdDrag);
  }

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag = null;
    stage.classList.remove("is-dragging");
    const velocity = Math.max(-1440, Math.min(1440, spinVelocity));
    const thrown = rotation + velocity * dial.values.motion.drag.flick;
    settle(Math.round(thrown / step) * step, velocity);
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  // Keyboard: arrow keys on the focused front image turn the ring one place.
  items.forEach((item, index) => {
    item.addEventListener("keydown", (event) => {
      const direction = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
      if (index !== frontIndex || !direction) return;
      event.preventDefault();
      settle(target + step * direction);
      items[frontIndex].focus();
    });
  });

  dial.subscribe(layout);
  window.addEventListener("resize", layout);
})();
