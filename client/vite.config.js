import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Vite reads this file when it starts the dev server or creates a build.
// The React plugin teaches Vite how to transform JSX in React components.
export default defineConfig({
  plugins: [react()]
});
