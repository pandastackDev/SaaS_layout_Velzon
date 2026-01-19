import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), viteTsconfigPaths()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	define: {
		global: "globalThis",
		"process.env": {},
	},
	css: {
		preprocessorOptions: {
			scss: {
				silenceDeprecations: [
					"import",
					"global-builtin",
					"color-functions",
					"mixed-decls",
				],
			},
		},
	},
	server: {
		port: 3000,
		open: true,
	},
	build: {
		outDir: "build",
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom", "react-router-dom"],
					redux: ["redux", "react-redux", "@reduxjs/toolkit"],
				},
			},
		},
	},
	optimizeDeps: {
		include: ["react", "react-dom"],
	},
});
