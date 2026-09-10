import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from './cn';

interface DialogProps {
  ouvert: boolean;
  onFermer: () => void;
  titre: string;
  /** Masque le titre visuellement tout en le laissant lisible aux lecteurs d'écran. */
  titreMasque?: boolean;
  children: ReactNode;
  className?: string;
}

const SELECTEUR_FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Dialogue modal accessible.
 *
 * Les deux modales de l'ancien code n'avaient ni `role="dialog"`, ni `aria-modal`, ni
 * piège de focus, ni restauration du focus, ni blocage du défilement ; l'une ne se
 * fermait même pas à Échap. Tout est traité ici une seule fois, pour que plus aucun
 * écran n'ait à s'en occuper.
 */
export function Dialog({
  ouvert,
  onFermer,
  titre,
  titreMasque = false,
  children,
  className,
}: DialogProps) {
  const panneauRef = useRef<HTMLDivElement>(null);
  const declencheurRef = useRef<HTMLElement | null>(null);

  const focusables = useCallback((): HTMLElement[] => {
    const racine = panneauRef.current;
    if (!racine) return [];
    return Array.from(racine.querySelectorAll<HTMLElement>(SELECTEUR_FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
  }, []);

  // Mémorise l'élément déclencheur et rend le focus en fermant : sans ça, le focus
  // repart en haut de page et la navigation clavier est perdue.
  useEffect(() => {
    if (!ouvert) return;
    declencheurRef.current = document.activeElement as HTMLElement | null;

    const premier = focusables()[0] ?? panneauRef.current;
    premier?.focus();

    return () => {
      declencheurRef.current?.focus?.();
    };
  }, [ouvert, focusables]);

  // Bloque le défilement de la page derrière le modal.
  useEffect(() => {
    if (!ouvert) return;
    const precedent = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = precedent;
    };
  }, [ouvert]);

  // Échap ferme, Tab reste enfermé dans le dialogue.
  useEffect(() => {
    if (!ouvert) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onFermer();
        return;
      }

      if (event.key !== 'Tab') return;

      const cibles = focusables();
      if (cibles.length === 0) {
        event.preventDefault();
        return;
      }

      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];
      const actif = document.activeElement;

      if (event.shiftKey && (actif === premier || !panneauRef.current?.contains(actif))) {
        event.preventDefault();
        dernier.focus();
      } else if (!event.shiftKey && actif === dernier) {
        event.preventDefault();
        premier.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [ouvert, onFermer, focusables]);

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-noir/80 p-4 pt-[10vh]">
      <div
        ref={panneauRef}
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        tabIndex={-1}
        className={cn(
          'dialogue-entre w-full max-w-lg rounded-3 border border-ardoise bg-graphite',
          'shadow-[var(--ombre-dialogue)]',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ardoise p-4">
          <h2 className={cn('text-t3 text-craie', titreMasque && 'sr-only')}>{titre}</h2>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer"
            className="-m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-1 text-brume transition-colors hover:text-craie"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
