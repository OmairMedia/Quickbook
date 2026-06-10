export default {
  source: ["app/assets/tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      prefix: "app",
      buildPath: "app/assets/styles/generated/",
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
      buildPath: "app/shared/tokens/",
      files: [
        {
          destination: "tokens.ts",
          format: "javascript/es6",
        },
      ],
    },
    scss: {
      transformGroup: "scss",
      buildPath: "app/assets/styles/generated/",
      files: [
        {
          destination: "_tokens.scss",
          format: "scss/variables",
          options: { outputReferences: true },
        },
      ],
    },
  },
};
