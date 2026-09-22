/**
 * Génère `public/sitemap.xml` et `public/robots.txt`.
 *
 * Pourquoi un script plutôt qu'un fichier tenu à la main : celui d'avant désignait
 * l'ancien domaine et les anciennes routes (`/knowledge`, `/countries`), disparues
 * depuis la refonte du routage, et ignorait `/evaluation` comme `/classement`. Une
 * URL canonique périmée ne casse rien de visible — elle dit simplement aux moteurs de
 * recherche que le contenu vit ailleurs. C'est le genre d'erreur qu'aucun test ne
 * rattrape et que personne ne remarque.
 *
 * Usage : node scripts/genere-sitemap.mjs [domaine]
 */

import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DOMAINE = (process.argv[2] ?? 'https://nexus-evaluation-cognitive.netlify.app').replace(
  /\/$/,
  ''
);

async function chargerCategories() {
  const dossier = mkdtempSync(join(tmpdir(), 'nexus-savoir-'));
  const sortie = join(dossier, 'savoir.mjs');
  await build({
    entryPoints: ['src/data/knowledge.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: sortie,
    logLevel: 'error',
  });
  const module = await import(pathToFileURL(sortie).href);
  return module.knowledgeCategories;
}

/** Une entrée par URL réellement servie, avec sa priorité. */
function composerUrls(categories) {
  const urls = [
    { chemin: '/', priorite: '1.0', frequence: 'weekly' },
    { chemin: '/evaluation', priorite: '0.9', frequence: 'monthly' },
    { chemin: '/classement', priorite: '0.8', frequence: 'daily' },
    { chemin: '/savoir', priorite: '0.8', frequence: 'weekly' },
    { chemin: '/pays', priorite: '0.7', frequence: 'monthly' },
    { chemin: '/quiz', priorite: '0.7', frequence: 'monthly' },
  ];

  for (const categorie of categories) {
    urls.push({ chemin: `/savoir/${categorie.id}`, priorite: '0.6', frequence: 'monthly' });

    categorie.sections.forEach((section, indexSection) => {
      urls.push({
        chemin: `/article/${categorie.id}/${indexSection}`,
        priorite: '0.5',
        frequence: 'monthly',
      });
      (section.subsections ?? []).forEach((_, indexSous) => {
        urls.push({
          chemin: `/article/${categorie.id}/${indexSection}/${indexSous}`,
          priorite: '0.4',
          frequence: 'monthly',
        });
      });
    });
  }

  return urls;
}

const categories = await chargerCategories();
const urls = composerUrls(categories);
const aujourdhui = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- FICHIER GENERE : node scripts/genere-sitemap.mjs -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${DOMAINE}${u.chemin}</loc>
    <lastmod>${aujourdhui}</lastmod>
    <changefreq>${u.frequence}</changefreq>
    <priority>${u.priorite}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync('public/sitemap.xml', sitemap, 'utf8');

// Les écrans de compte et le rapport d'une passation n'ont rien à faire dans un
// index de recherche : ils sont personnels, et un rapport porte un identifiant.
const robots = `User-agent: *
Allow: /

Disallow: /tableau-de-bord
Disallow: /profil
Disallow: /parametres
Disallow: /bienvenue
Disallow: /rapport/
Disallow: /mot-de-passe

Sitemap: ${DOMAINE}/sitemap.xml
`;

writeFileSync('public/robots.txt', robots, 'utf8');

console.log(`public/sitemap.xml — ${urls.length} URL, domaine ${DOMAINE}`);
console.log('public/robots.txt — ecrit');
