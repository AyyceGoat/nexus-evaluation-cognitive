import { brotliCompressSync } from 'node:zlib';
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

/**
 * Injecte le poids réel du chargement initial dans l'écran de lancement.
 *
 * La jauge de `public/lancement.js` compare les octets reçus à ce poids. Pour
 * qu'elle dise la vérité, le poids doit être celui que Netlify **sert**, pas la
 * taille sur disque : les fichiers partent compressés en Brotli.
 *
 * On compresse donc réellement chaque fichier du chargement initial, plutôt que
 * d'appliquer un ratio au jugé. Les polices `.woff2` sont déjà compressées et
 * servies telles quelles : leur taille brute est la bonne.
 *
 * Conséquence si ce greffon manquait : `data-poids` vaudrait 0, la jauge
 * n'avancerait que sur les jalons d'amorçage, et resterait à 6 % pendant tout le
 * téléchargement. Elle ne mentirait pas, elle serait seulement muette.
 */
function injecterPoidsDeChargement(): Plugin {
  let poids = 0;

  return {
    name: 'nexus-poids-de-chargement',
    apply: 'build',

    generateBundle(_options, bundle) {
      poids = 0;

      for (const [nom, sortie] of Object.entries(bundle)) {
        const estEntree = sortie.type === 'chunk' && sortie.isEntry;
        const estStyle = nom.endsWith('.css');
        const estPoliceLatine = /-latin-wght-normal-[^.]+\.woff2$/.test(nom);

        if (!estEntree && !estStyle && !estPoliceLatine) continue;

        if (estPoliceLatine) {
          // Déjà compressée, servie à l'identique.
          const source = sortie.type === 'asset' ? sortie.source : '';
          poids += typeof source === 'string' ? Buffer.byteLength(source) : source.byteLength;
          continue;
        }

        const contenu =
          sortie.type === 'chunk'
            ? sortie.code
            : typeof sortie.source === 'string'
              ? sortie.source
              : Buffer.from(sortie.source).toString('utf8');

        poids += brotliCompressSync(Buffer.from(contenu)).byteLength;
      }
    },

    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace('data-poids="0"', `data-poids="${poids}"`);
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), prechargerPolices(), injecterPoidsDeChargement()],
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
