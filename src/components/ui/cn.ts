import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne des listes de classes en laissant la dernière gagner sur les conflits.
 *
 * `clsx` et `tailwind-merge` étaient déjà installés dans le projet sans jamais être
 * importés. Ils servent enfin : sans `twMerge`, une classe passée en prop ne peut pas
 * écraser celle du composant, et on finit par écrire des variantes en dur.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
