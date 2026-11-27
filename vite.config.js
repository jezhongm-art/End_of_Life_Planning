import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Cloudflare Workers Builds 上の @cloudflare/vite-plugin は相対 base ('./') だとエラーや資産404になりやすいため '/' を使い、
  // GitHub Pages 等では相対パス './' を維持する
  base: process.env.WORKERS_CI ? '/' : './',
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  }
})
