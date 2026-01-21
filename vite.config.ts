import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react({
			jsxRuntime: "automatic",
		}),
		viteTsconfigPaths(),
	],
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
				includePaths: [
					path.resolve(__dirname, "./node_modules"),
					path.resolve(__dirname, "./src"),
				],
			},
		},
	},
	server: {
		port: 3000,
		host: true,
		open: true,
		strictPort: false,
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
		chunkSizeWarningLimit: 1000,
	},
	esbuild: {
		logOverride: { "this-is-undefined-in-esm": "silent" },
	},
	optimizeDeps: {
		include: ["react", "react-dom"],
	},
});
