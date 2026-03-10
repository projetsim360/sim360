import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="max-w-md w-full">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <KeenIcon icon="information-2" style="duotone" className="text-destructive text-xl" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Une erreur est survenue</h3>
                <p className="text-sm text-muted-foreground">
                  Un probleme inattendu s'est produit. Veuillez reessayer.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Recharger la page
                </Button>
                <Button onClick={this.handleReset}>
                  Reessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
