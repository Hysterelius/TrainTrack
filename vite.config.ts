import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader({
      svgo: false,
    }),
  ],
  server: {
    headers: {
      "Strict-Transport-Security": "max-age=86400; includeSubDomains",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      'Content-Security-Policy': "script-src 'self' ; style-src 'self' 'sha256-UnezlJEaWFjWgVqsSrh0bJ4DgSBoGqB73j8lYGnK2nE=' 'sha256-PcMpsrnpmowlWr2lIEboES0/q+ERtknMH+BM/RCxnDM='",
    },
  },
});
