import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

type Variant = 'principal' | 'secondaire' | 'discret' | 'danger';
type Taille = 'normal' | 'compact';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  taille?: Taille;
  children: ReactNode;
}

/**
 * Sur fond `mesure`, le texte est NOIR et jamais `craie`.
 *
 * Ce n'est pas une préférence : `craie` sur `mesure` donne un contraste de 2,17,
 * soit un échec net, là où `noir` sur `mesure` donne 8,50. Cf. DESIGN.md §2.2.
 */
const VARIANTES: Record<Variant, string> = {
  principal: 'bg-mesure text-noir hover:bg-mesure/90 border border-transparent font-semibold',
  secondaire: 'bg-transparent text-craie border border-ardoise hover:border-brume',
  discret: 'bg-transparent text-brume border border-transparent hover:text-craie',
  danger: 'bg-transparent text-alerte border border-alerte/40 hover:border-alerte',
};

/**
 * `min-h-11` vaut 44 px : la cible tactile minimale est obtenue par le composant, et
 * non par une règle globale sur tous les `button, a` comme le faisait l'ancien CSS —
 * ce qui étirait aussi les liens en ligne du pied de page.
 */
const TAILLES: Record<Taille, string> = {
  normal: 'min-h-11 px-5 text-petit',
  compact: 'min-h-9 px-3 text-micro',
};

export function Button({
  variant = 'secondaire',
  taille = 'normal',
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-1',
        'transition-colors duration-[--duree-1] ease-[--ease-nexus]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'active:translate-y-px',
        VARIANTES[variant],
        TAILLES[taille],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
