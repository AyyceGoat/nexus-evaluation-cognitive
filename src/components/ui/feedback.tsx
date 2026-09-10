import type { ReactNode } from 'react';
import { cn } from './cn';

/* ══ Surface ═══════════════════════════════════════════════════════════════
   La profondeur vient de l'empilement fond → surface → bordure, jamais d'une
   ombre grise sous le panneau : c'est le marqueur le plus reconnaissable du
   design généré. Cf. DESIGN.md §4.3.
   ═══════════════════════════════════════════════════════════════════════ */

export function Panel({
  children,
  className,
  niveau = 1,
}: {
  children: ReactNode;
  className?: string;
  niveau?: 1 | 2;
}) {
  return (
    <div
      className={cn(
        'rounded-2 border border-ardoise',
        niveau === 1 ? 'bg-graphite' : 'bg-ardoise',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ══ Chargement ════════════════════════════════════════════════════════════
   Un squelette qui reprend la forme du contenu attendu, jamais un spinner
   centré : le spinner ne dit ni quoi arrive ni combien.
   ═══════════════════════════════════════════════════════════════════════ */

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('squelette rounded-1', className)} />;
}

/** Squelette de la carte de résultat : trois lignes, aux proportions du vrai contenu. */
export function SkeletonResultat() {
  return (
    <Panel className="p-6">
      <div className="flex flex-col gap-4" role="status" aria-live="polite">
        <span className="sr-only">Chargement du résultat</span>
        <Skeleton className="h-3 w-32" />
        <div className="flex items-baseline gap-6">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-3 w-56" />
      </div>
    </Panel>
  );
}

/** Squelette de liste : `lignes` blocs de la hauteur d'une ligne réelle. */
export function SkeletonListe({ lignes = 3 }: { lignes?: number }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-live="polite">
      <span className="sr-only">Chargement de la liste</span>
      {Array.from({ length: lignes }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

/* ══ Vide ══════════════════════════════════════════════════════════════════
   Un état vide est conçu : il explique et propose l'action qui le remplit.
   ═══════════════════════════════════════════════════════════════════════ */

export function EmptyState({
  titre,
  children,
  action,
}: {
  titre: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 border-l-2 border-ardoise py-8 pl-6">
      <p className="text-t3 text-craie">{titre}</p>
      <p className="mesure-texte text-petit text-brume">{children}</p>
      {action}
    </div>
  );
}

/* ══ Erreur ════════════════════════════════════════════════════════════════
   Dit ce qui s'est passé et donne un bouton qui réessaie. Jamais
   « une erreur est survenue ».
   ═══════════════════════════════════════════════════════════════════════ */

export function ErrorState({
  titre,
  children,
  action,
}: {
  titre: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 border-l-2 border-alerte py-8 pl-6"
    >
      <p className="text-t3 text-craie">{titre}</p>
      <p className="mesure-texte text-petit text-brume">{children}</p>
      {action}
    </div>
  );
}
