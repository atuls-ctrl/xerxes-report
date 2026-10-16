# React + TypeScript + Vite

## Colors

Every color lives in one file: [`src/styles/_colors.scss`](src/styles/_colors.scss).
It is grouped by purpose (primary, surfaces, table rows, text, borders, status,
trend, interactive states, overlays, charts). Do not write hex/rgb values in
components.

- **SCSS**: `@use '../../styles' as *;` already brings in all `$color-*` tokens
  (and shadows built from them, e.g. `$shadow-overlay`).
- **TypeScript** (ApexCharts options, inline styles):
  `import { colors, chartSeriesColors } from '../../styles/colors'`. The values
  are read from the SCSS tokens through `src/styles/colors.module.scss`; to
  expose another token, add it to that file's `:export` block and to
  `src/styles/colors.ts`.

Reuse an existing token when the purpose matches. Look-alike shades with
different meanings stay separate (e.g. `$color-success` for status dots vs
`$color-positive` for upward trends).

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
