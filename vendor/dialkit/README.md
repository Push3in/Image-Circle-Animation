# Vendored DialKit

Copied from `node_modules/dialkit/dist/vanilla/` (dialkit 2.0.2), the no-bundler build its README recommends copying.

One local change in `browser.global.js`: the spring editor's Stiffness slider runs 10–500 in steps of 10. Upstream hard-codes 1–1000, which cannot be configured from outside.

To update: copy the two files again and re-apply that change to the `slider("Stiffness", ...)` line.
