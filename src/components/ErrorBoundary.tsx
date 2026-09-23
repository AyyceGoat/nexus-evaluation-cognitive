import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in NEXUS ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-noir p-4 text-center">
          <div className="bg-graphite border border-ardoise max-w-md p-8 rounded-2 border border-alerte/20">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="font-titre text-xl font-bold mb-2 text-alerte">
              Une erreur inattendue est survenue
            </h2>
            <p className="text-texte text-sm mb-6 leading-relaxed">
              Un dysfonctionnement s'est produit lors du rendu de cette section.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 rounded-1 bg-mesure text-noir text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Retourner à l'accueil
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
