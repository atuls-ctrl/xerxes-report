# React + TypeScript + Vite

## Colors

Every color is defined once, in [`src/styles/_colors.scss`](src/styles/_colors.scss),
grouped by purpose (brand, surfaces, text, borders, status, trend tones, table
rows, interactive states, overlays, chart series).

- **SCSS:** `@use '../../styles' as *;` and use the variables, e.g.
  `color: $color-text-muted;`. Don't write hex/rgb/named colors in component
  stylesheets.
- **TypeScript** (ApexCharts options, inline styles, stories):
  `import { colors, chartColors } from '<path>/styles/colors'`. These values
  are read from the same SCSS tokens through the `:export` block in
  [`src/styles/colors.module.scss`](src/styles/colors.module.scss). To expose
  another token to TS, add it there and in [`colors.ts`](src/styles/colors.ts).
- **New colors:** reuse an existing token first. If a new shade is really
  needed, add it to `_colors.scss` with a comment saying where it belongs.
  Some near-identical values (e.g. `$color-page` vs `$color-surface-header`)
  are kept apart on purpose to match Figma.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
