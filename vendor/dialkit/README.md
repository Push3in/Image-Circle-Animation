# Vendored DialKit

Copied from `node_modules/dialkit/dist/vanilla/` (dialkit 2.0.2), the no-bundler build its README recommends copying.

Three local changes in `browser.global.js`:

- The spring editor's Stiffness slider runs 10–500 in steps of 10. Upstream hard-codes 1–1000, which cannot be configured from outside.
- Dropdowns (select, versions) fade and scale in when they open and fade out when they close. Upstream adds and removes them in a single frame. The change is `animatePopup` and its two uses in `popupMenu`.
- Nested folders animate when they open, not only when they close. Upstream skips the animation whenever the content measured 0 wide beforehand, which a closed (`display: none`) folder always does, so opening snapped. The fix is in `mountFolder`'s `render`: the `nested` check and `startHeight`.

To update: copy the two files again and re-apply all three changes.
