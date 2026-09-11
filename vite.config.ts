import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Précharge les deux sous-ensembles latins des polices.
 *
 * Sans cela, le navigateur ne découvre les fichiers qu'après avoir analysé la feuille
 * de style : le texte est d'abord peint avec la police de repli, puis repeint avec la
 * vraie, et la page bouge. Mesuré par Lighthouse avant correction : **CLS de 0,484** sur
 * l'accueil et 0,146 sur une page sans image, pour une cible de 0,1 — le décalage
 * croissait avec la quantité de texte, ce qui désignait les polices et non la mise en page.
 *
 * Les noms de fichiers portent un hash de build, donc les liens sont injectés à partir
 * du bundle réellement émis plutôt qu'écrits en dur dans index.html.
 */
function prechargerPolices(): Plugin {
  const aPrecharger: string[] = [];

  return {
    name: 'nexus-precharger-polices',
    apply: 'build',

    generateBundle(_options, bundle) {
      for (const nom of Object.keys(bundle)) {
        // Seuls les sous-ensembles latins : c'est tout ce dont le français a besoin.
        // Précharger `latin-ext` et `vietnamese` gaspillerait de la bande passante.
        if (/-latin-wght-normal-[^.]+\.woff2$/.test(nom)) aPrecharger.push(nom);
      }
    },

    transformIndexHtml: {
      order: 'post',
      handler() {
        return aPrecharger.map((fichier) => ({
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: `/${fichier}`,
            as: 'font',
            type: 'font/woff2',
            crossorigin: '',
          },
          injectTo: 'head-prepend' as const,
        }));
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), prechargerPolices()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // Les cartes de source rendent le débogage en production possible et ne sont
    // téléchargées que par les outils de développement.
    sourcemap: true,
  },
});
