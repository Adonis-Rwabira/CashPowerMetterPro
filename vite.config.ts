import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: {
        name: 'CashPowerMetterPro | Gestionnaire de Sous-Compteurs',
        short_name: 'CashPowerMetterPro',
        description: "Gestion divisionnaire d'énergie et détection de pertes 100% Hors-Ligne par Ir Adonis Rwabira",
        theme_color: '#1B202A',
        background_color: '#101318',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test.setup.ts',
  }
});
