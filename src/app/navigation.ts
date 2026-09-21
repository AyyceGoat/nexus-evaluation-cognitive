import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Descripteur de page hérité de l'ancien routage écrit à la main.
 *
 * Il est conservé volontairement : une dizaine d'écrans reçoivent une prop
 * `navigate: (page: Page) => void`. Le garder évite de réécrire ces écrans pour
 * basculer sur react-router, alors que le sujet de la phase est l'authentification.
 * `useNavigatePage` fait la traduction vers de vraies URL.
 */
export type Page =
  | { type: 'home' }
  | { type: 'iq' }
  | { type: 'knowledge'; categoryId?: string }
  | { type: 'countries' }
  | { type: 'quiz' }
  | { type: 'article'; categoryId: string; sectionIndex: number; subIndex?: number };

export function pageToPath(page: Page): string {
  switch (page.type) {
    case 'home':
      return '/';
    case 'iq':
      return '/evaluation';
    case 'knowledge':
      return page.categoryId ? `/savoir/${page.categoryId}` : '/savoir';
    case 'countries':
      return '/pays';
    case 'quiz':
      return '/quiz';
    case 'article':
      return page.subIndex !== undefined
        ? `/article/${page.categoryId}/${page.sectionIndex}/${page.subIndex}`
        : `/article/${page.categoryId}/${page.sectionIndex}`;
  }
}

/** Adaptateur : les écrans continuent de parler en `Page`, le routeur en URL. */
export function useNavigatePage(): (page: Page) => void {
  const navigate = useNavigate();
  return useCallback((page: Page) => navigate(pageToPath(page)), [navigate]);
}

/** Routes de l'espace connecté. Rassemblées ici pour que les gardes s'y réfèrent. */
export const CHEMINS = {
  accueil: '/',
  evaluation: '/evaluation',
  inscription: '/inscription',
  connexion: '/connexion',
  motDePasseOublie: '/mot-de-passe',
  bienvenue: '/bienvenue',
  tableauDeBord: '/tableau-de-bord',
  profil: '/profil',
  parametres: '/parametres',
  rapport: (id: string) => `/rapport/${id}`,
} as const;
