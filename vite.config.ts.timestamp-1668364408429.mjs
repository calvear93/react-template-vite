// vite.config.ts
import tsconfigPaths from "file:///C:/Development/Personal/source/react-template-vite/node_modules/.pnpm/vite-tsconfig-paths@3.5.2_vite@3.2.3/node_modules/vite-tsconfig-paths/dist/index.mjs";
import react from "file:///C:/Development/Personal/source/react-template-vite/node_modules/.pnpm/@vitejs+plugin-react@2.2.0_vite@3.2.3/node_modules/@vitejs/plugin-react/dist/index.mjs";
import css from "file:///C:/Development/Personal/source/react-template-vite/node_modules/.pnpm/vite-plugin-windicss@1.8.8_vite@3.2.3/node_modules/vite-plugin-windicss/dist/index.mjs";
import fonts from "file:///C:/Development/Personal/source/react-template-vite/node_modules/.pnpm/vite-plugin-webfont-dl@3.4.1_vite@3.2.3/node_modules/vite-plugin-webfont-dl/dist/index.js";
import { checker } from "file:///C:/Development/Personal/source/react-template-vite/node_modules/.pnpm/vite-plugin-checker@0.5.1_2l5jdy57g4tx6s4ke6r2ixx36a/node_modules/vite-plugin-checker/dist/esm/main.js";
import svg from "file:///C:/Development/Personal/source/react-template-vite/node_modules/.pnpm/vite-plugin-svgr@2.2.2_vite@3.2.3/node_modules/vite-plugin-svgr/dist/index.mjs";
import stylelint from "file:///C:/Development/Personal/source/react-template-vite/node_modules/.pnpm/vite-plugin-stylelint@3.0.8_bxlz7ihpyvd2pkrfvmwfjvxr4u/node_modules/vite-plugin-stylelint/dist/index.mjs";
import { VitePWA as pwa } from "file:///C:/Development/Personal/source/react-template-vite/node_modules/.pnpm/vite-plugin-pwa@0.13.3_vite@3.2.3/node_modules/vite-plugin-pwa/dist/index.mjs";
import { createHtmlPlugin as html } from "file:///C:/Development/Personal/source/react-template-vite/node_modules/.pnpm/vite-plugin-html@3.2.0_vite@3.2.3/node_modules/vite-plugin-html/dist/index.mjs";
import { chunkSplitPlugin } from "file:///C:/Development/Personal/source/react-template-vite/node_modules/.pnpm/vite-plugin-chunk-split@0.4.3_sass@1.56.1/node_modules/vite-plugin-chunk-split/dist/index.js";
var basePath = `${process.env.BASE_URL}/`.replace(/\/+/g, "/");
var fontFamily = process.env.FONT_FAMILY;
var fontWeight = process.env.FONT_WEIGHTS;
var vite_config_default = {
  base: basePath,
  server: {
    open: true,
    https: process.env.HTTPS === "true",
    port: +process.env.PORT
  },
  build: {
    sourcemap: process.env.GENERATE_SOURCEMAP === "true",
    emptyOutDir: true,
    minify: true,
    target: process.env.TARGET
  },
  plugins: [
    react(),
    css(),
    tsconfigPaths(),
    checker({ typescript: true, enableBuild: true }),
    svg(),
    stylelint(),
    fonts([
      `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${fontWeight}&display=swap`
    ]),
    html({
      inject: {
        data: process.env
      },
      minify: true
    }),
    chunkSplitPlugin({
      strategy: "single-vendor",
      customSplitting: {
        react: ["react", "react-dom"],
        router: ["react-router-dom", /src\/libs\/router/],
        store: ["easy-peasy"]
      }
    }),
    pwa({
      devOptions: {
        enabled: false
      },
      manifest: false,
      registerType: "autoUpdate",
      injectRegister: "inline",
      workbox: {
        globPatterns: [
          "**/*.{html,js,css,ico,png,svg,woff2,webmanifest}"
        ],
        cleanupOutdatedCaches: true,
        sourcemap: process.env.GENERATE_SOURCEMAP === "true"
      }
    })
  ]
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxEZXZlbG9wbWVudFxcXFxQZXJzb25hbFxcXFxzb3VyY2VcXFxccmVhY3QtdGVtcGxhdGUtdml0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcRGV2ZWxvcG1lbnRcXFxcUGVyc29uYWxcXFxcc291cmNlXFxcXHJlYWN0LXRlbXBsYXRlLXZpdGVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L0RldmVsb3BtZW50L1BlcnNvbmFsL3NvdXJjZS9yZWFjdC10ZW1wbGF0ZS12aXRlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgVXNlckNvbmZpZ0V4cG9ydCB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuaW1wb3J0IGNzcyBmcm9tICd2aXRlLXBsdWdpbi13aW5kaWNzcyc7XHJcbmltcG9ydCBmb250cyBmcm9tICd2aXRlLXBsdWdpbi13ZWJmb250LWRsJztcclxuaW1wb3J0IHsgY2hlY2tlciB9IGZyb20gJ3ZpdGUtcGx1Z2luLWNoZWNrZXInO1xyXG5pbXBvcnQgc3ZnIGZyb20gJ3ZpdGUtcGx1Z2luLXN2Z3InO1xyXG5pbXBvcnQgc3R5bGVsaW50IGZyb20gJ3ZpdGUtcGx1Z2luLXN0eWxlbGludCc7XHJcbmltcG9ydCB7IFZpdGVQV0EgYXMgcHdhIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcclxuaW1wb3J0IHsgY3JlYXRlSHRtbFBsdWdpbiBhcyBodG1sIH0gZnJvbSAndml0ZS1wbHVnaW4taHRtbCc7XHJcbmltcG9ydCB7IGNodW5rU3BsaXRQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1jaHVuay1zcGxpdCc7XHJcblxyXG5jb25zdCBiYXNlUGF0aCA9IGAke3Byb2Nlc3MuZW52LkJBU0VfVVJMfS9gLnJlcGxhY2UoL1xcLysvZywgJy8nKTtcclxuY29uc3QgZm9udEZhbWlseSA9IHByb2Nlc3MuZW52LkZPTlRfRkFNSUxZO1xyXG5jb25zdCBmb250V2VpZ2h0ID0gcHJvY2Vzcy5lbnYuRk9OVF9XRUlHSFRTO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQge1xyXG5cdGJhc2U6IGJhc2VQYXRoLFxyXG5cdHNlcnZlcjoge1xyXG5cdFx0b3BlbjogdHJ1ZSxcclxuXHRcdGh0dHBzOiBwcm9jZXNzLmVudi5IVFRQUyA9PT0gJ3RydWUnLFxyXG5cdFx0cG9ydDogK3Byb2Nlc3MuZW52LlBPUlQhXHJcblx0fSxcclxuXHRidWlsZDoge1xyXG5cdFx0c291cmNlbWFwOiBwcm9jZXNzLmVudi5HRU5FUkFURV9TT1VSQ0VNQVAgPT09ICd0cnVlJyxcclxuXHRcdGVtcHR5T3V0RGlyOiB0cnVlLFxyXG5cdFx0bWluaWZ5OiB0cnVlLFxyXG5cdFx0dGFyZ2V0OiBwcm9jZXNzLmVudi5UQVJHRVRcclxuXHR9LFxyXG5cdHBsdWdpbnM6IFtcclxuXHRcdHJlYWN0KCksXHJcblx0XHRjc3MoKSxcclxuXHRcdHRzY29uZmlnUGF0aHMoKSxcclxuXHRcdGNoZWNrZXIoeyB0eXBlc2NyaXB0OiB0cnVlLCBlbmFibGVCdWlsZDogdHJ1ZSB9KSxcclxuXHRcdHN2ZygpLFxyXG5cdFx0c3R5bGVsaW50KCksXHJcblx0XHRmb250cyhbXHJcblx0XHRcdGBodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PSR7Zm9udEZhbWlseX06d2dodEAke2ZvbnRXZWlnaHR9JmRpc3BsYXk9c3dhcGBcclxuXHRcdF0pLFxyXG5cdFx0aHRtbCh7XHJcblx0XHRcdGluamVjdDoge1xyXG5cdFx0XHRcdGRhdGE6IHByb2Nlc3MuZW52XHJcblx0XHRcdH0sXHJcblx0XHRcdG1pbmlmeTogdHJ1ZVxyXG5cdFx0fSksXHJcblx0XHRjaHVua1NwbGl0UGx1Z2luKHtcclxuXHRcdFx0c3RyYXRlZ3k6ICdzaW5nbGUtdmVuZG9yJyxcclxuXHRcdFx0Y3VzdG9tU3BsaXR0aW5nOiB7XHJcblx0XHRcdFx0cmVhY3Q6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcblx0XHRcdFx0cm91dGVyOiBbJ3JlYWN0LXJvdXRlci1kb20nLCAvc3JjXFwvbGlic1xcL3JvdXRlci9dLFxyXG5cdFx0XHRcdHN0b3JlOiBbJ2Vhc3ktcGVhc3knXVxyXG5cdFx0XHR9XHJcblx0XHR9KSxcclxuXHRcdHB3YSh7XHJcblx0XHRcdGRldk9wdGlvbnM6IHtcclxuXHRcdFx0XHRlbmFibGVkOiBmYWxzZVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRtYW5pZmVzdDogZmFsc2UsXHJcblx0XHRcdHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG5cdFx0XHRpbmplY3RSZWdpc3RlcjogJ2lubGluZScsXHJcblx0XHRcdHdvcmtib3g6IHtcclxuXHRcdFx0XHRnbG9iUGF0dGVybnM6IFtcclxuXHRcdFx0XHRcdCcqKi8qLntodG1sLGpzLGNzcyxpY28scG5nLHN2Zyx3b2ZmMix3ZWJtYW5pZmVzdH0nXHJcblx0XHRcdFx0XSxcclxuXHRcdFx0XHRjbGVhbnVwT3V0ZGF0ZWRDYWNoZXM6IHRydWUsXHJcblx0XHRcdFx0c291cmNlbWFwOiBwcm9jZXNzLmVudi5HRU5FUkFURV9TT1VSQ0VNQVAgPT09ICd0cnVlJ1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdF1cclxufSBhcyBVc2VyQ29uZmlnRXhwb3J0O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sU0FBUztBQUNoQixPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sU0FBUztBQUNoQixPQUFPLGVBQWU7QUFDdEIsU0FBUyxXQUFXLFdBQVc7QUFDL0IsU0FBUyxvQkFBb0IsWUFBWTtBQUN6QyxTQUFTLHdCQUF3QjtBQUVqQyxJQUFNLFdBQVcsR0FBRyxRQUFRLElBQUksWUFBWSxRQUFRLFFBQVEsR0FBRztBQUMvRCxJQUFNLGFBQWEsUUFBUSxJQUFJO0FBQy9CLElBQU0sYUFBYSxRQUFRLElBQUk7QUFHL0IsSUFBTyxzQkFBUTtBQUFBLEVBQ2QsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sT0FBTyxRQUFRLElBQUksVUFBVTtBQUFBLElBQzdCLE1BQU0sQ0FBQyxRQUFRLElBQUk7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ04sV0FBVyxRQUFRLElBQUksdUJBQXVCO0FBQUEsSUFDOUMsYUFBYTtBQUFBLElBQ2IsUUFBUTtBQUFBLElBQ1IsUUFBUSxRQUFRLElBQUk7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLElBQ0osY0FBYztBQUFBLElBQ2QsUUFBUSxFQUFFLFlBQVksTUFBTSxhQUFhLEtBQUssQ0FBQztBQUFBLElBQy9DLElBQUk7QUFBQSxJQUNKLFVBQVU7QUFBQSxJQUNWLE1BQU07QUFBQSxNQUNMLDRDQUE0QyxtQkFBbUI7QUFBQSxJQUNoRSxDQUFDO0FBQUEsSUFDRCxLQUFLO0FBQUEsTUFDSixRQUFRO0FBQUEsUUFDUCxNQUFNLFFBQVE7QUFBQSxNQUNmO0FBQUEsTUFDQSxRQUFRO0FBQUEsSUFDVCxDQUFDO0FBQUEsSUFDRCxpQkFBaUI7QUFBQSxNQUNoQixVQUFVO0FBQUEsTUFDVixpQkFBaUI7QUFBQSxRQUNoQixPQUFPLENBQUMsU0FBUyxXQUFXO0FBQUEsUUFDNUIsUUFBUSxDQUFDLG9CQUFvQixtQkFBbUI7QUFBQSxRQUNoRCxPQUFPLENBQUMsWUFBWTtBQUFBLE1BQ3JCO0FBQUEsSUFDRCxDQUFDO0FBQUEsSUFDRCxJQUFJO0FBQUEsTUFDSCxZQUFZO0FBQUEsUUFDWCxTQUFTO0FBQUEsTUFDVjtBQUFBLE1BQ0EsVUFBVTtBQUFBLE1BQ1YsY0FBYztBQUFBLE1BQ2QsZ0JBQWdCO0FBQUEsTUFDaEIsU0FBUztBQUFBLFFBQ1IsY0FBYztBQUFBLFVBQ2I7QUFBQSxRQUNEO0FBQUEsUUFDQSx1QkFBdUI7QUFBQSxRQUN2QixXQUFXLFFBQVEsSUFBSSx1QkFBdUI7QUFBQSxNQUMvQztBQUFBLElBQ0QsQ0FBQztBQUFBLEVBQ0Y7QUFDRDsiLAogICJuYW1lcyI6IFtdCn0K
