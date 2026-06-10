### Style Dictionary Structure

```
/assets/
  /tokens/
    /base/
      color.json           ← raw color values
      typography.json      ← font families, sizes, weights
      spacing.json         ← spacing scale
      radius.json          ← border radius scale
      shadow.json          ← box shadow definitions
    /semantic/
      color.json           ← semantic aliases (surface, on-surface, etc.)
      component.json       ← component-level tokens
  /styles/
    _reset.scss
    _typography.scss
    main.scss
```

### Token Example: Two-Layer Token System

```json
// assets/tokens/base/color.json — raw palette
{
  "color": {
    "indigo": {
      "50": { "value": "#eef2ff" },
      "100": { "value": "#e0e7ff" },
      "500": { "value": "#6366f1" },
      "600": { "value": "#4f46e5" },
      "900": { "value": "#312e81" }
    },
    "slate": {
      "50": { "value": "#f8fafc" },
      "900": { "value": "#0f172a" }
    }
  }
}
```

```json
// assets/tokens/semantic/color.json — semantic aliases
{
  "color": {
    "brand": {
      "primary": { "value": "{color.indigo.500}" },
      "primary-hover": { "value": "{color.indigo.600}" }
    },
    "surface": {
      "default": { "value": "{color.slate.50}" },
      "elevated": { "value": "#ffffff" }
    },
    "text": {
      "primary": { "value": "{color.slate.900}" },
      "secondary": { "value": "#64748b" },
      "disabled": { "value": "#94a3b8" }
    }
  }
}
```

### Style Dictionary Config

```javascript
// style-dictionary.config.js
export default {
  source: ["assets/tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      prefix: "app",
      buildPath: "assets/styles/generated/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: { outputReferences: true },
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "shared/tokens/",
      files: [
        {
          destination: "tokens.ts",
          format: "javascript/es6",
        },
      ],
    },
  },
};
```

Running `npx style-dictionary build` generates:

```css
/* assets/styles/generated/tokens.css */
:root {
  --app-color-brand-primary: #6366f1;
  --app-color-brand-primary-hover: #4f46e5;
  --app-color-surface-default: #f8fafc;
  --app-color-text-primary: #0f172a;
  --app-color-text-secondary: #64748b;
}
```

Components then use `var(--app-color-brand-primary)` exclusively. No raw hex values anywhere in component styles.
