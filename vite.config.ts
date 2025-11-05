// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//       "@components": path.resolve(__dirname, "./src/components"),
//       "@pages": path.resolve(__dirname, "./src/pages"),
//       "@utils": path.resolve(__dirname, "./src/utils"),
//       "@types": path.resolve(__dirname, "./src/types"),
//       "@store": path.resolve(__dirname, "./src/store"),
//       "@constants": path.resolve(__dirname, "./src/constants"),
//     },
//   },
//   server: {
//     port: 6009,
//     open: false,
//     host: '0.0.0.0',
//   },
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store'),
      '@constants': path.resolve(__dirname, './src/constants'),
    },
  },
  server: {
    port: 6009,
    open: false,
    host: '0.0.0.0',  // Expose to all network interfaces
  },
  preview: {
    allowedHosts: ['underwriter.uat.credpalapp.dev', 'underwriter.host1.credpalapp.dev'],  // Add allowed hosts here
  },
});
