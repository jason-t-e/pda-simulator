import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  minify: true,
  splitting: true,         // Enable code-splitting for tree-shaking
  treeshake: true,
  clean: true,
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    // Ensure JSX is handled correctly
    options.jsx = "automatic";
  },
  // Copy theme.css to dist as a separate side-effectful file
  async onSuccess() {
    const { copyFile } = await import("fs/promises");
    await copyFile("src/theme/theme.css", "dist/theme.css");
    console.log("✓ Copied theme.css to dist/");
  },
});
