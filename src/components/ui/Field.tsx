import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'aria-invalid'> {
  label: string;
  /** Message d'erreur. Sa présence suffit à marquer le champ comme invalide. */
  erreur?: string | null;
  /** Précision affichée sous le libellé : format attendu, contrainte, exemple. */
  aide?: ReactNode;
}

/**
 * Champ de saisie accessible.
 *
 * Corrige trois défauts relevés à l'audit, présents sur les huit champs de l'ancien code :
 * le libellé n'était pas associé à l'entrée (pas de `htmlFor`, pas d'`id`), le message
 * d'erreur n'était rattaché à rien (`aria-describedby` absent) et n'était pas annoncé
 * aux lecteurs d'écran, et `focus:outline-none` supprimait le focus visible sans le
 * remplacer.
 */
export function Field({ label, erreur, aide, className, ...rest }: FieldProps) {
  const id = useId();
  const idAide = `${id}-aide`;
  const idErreur = `${id}-erreur`;

  const decrit = [aide ? idAide : null, erreur ? idErreur : null].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-petit font-medium text-craie">
        {label}
      </label>

      {aide && (
        <p id={idAide} className="text-micro text-brume">
          {aide}
        </p>
      )}

      <input
        id={id}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={decrit || undefined}
        className={cn(
          'min-h-11 w-full rounded-1 bg-graphite px-3 text-corps text-craie',
          'border transition-colors duration-[--duree-1] ease-[--ease-nexus]',
          'placeholder:text-brume',
          erreur ? 'border-alerte' : 'border-ardoise hover:border-brume',
          className
        )}
        {...rest}
      />

      {erreur && (
        // `role="alert"` fait annoncer le message dès son apparition. Le texte doit dire
        // quoi faire, pas s'excuser — cf. DESIGN.md §6.
        <p id={idErreur} role="alert" className="text-micro text-alerte">
          {erreur}
        </p>
      )}
    </div>
  );
}
