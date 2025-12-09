// 配置baseUrl
import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir: "docs",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        page1: resolve(__dirname, "src/page1/index.html"),
        page2: resolve(__dirname, "src/page2/index.html"),
        page3: resolve(__dirname, "src/page3/index.html"),
        page4: resolve(__dirname, "src/page4/index.html"),
        page5: resolve(__dirname, "src/page5/index.html"),
        page6: resolve(__dirname, "src/page6/index.html"),
        page7: resolve(__dirname, "src/page7/index.html"),
      },
    },
  },
});
