import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Standard Vite + React. The Anthropic API key is read at runtime from
// import.meta.env.VITE_ANTHROPIC_API_KEY (optional) or pasted into the UI,
// so nothing secret is ever committed or bundled by default.
// base is "/klear/" for the GitHub Pages build (served at /klear/), but "/" for
// local dev so `npm run dev` still opens cleanly at http://localhost:5173.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/klear/" : "/",
  server: { port: 5173, open: true },
}));
