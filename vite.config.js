import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Standard Vite + React. The Anthropic API key is read at runtime from
// import.meta.env.VITE_ANTHROPIC_API_KEY (optional) or pasted into the UI,
// so nothing secret is ever committed or bundled by default.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
});
