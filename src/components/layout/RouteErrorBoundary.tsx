import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: unknown): RouteErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Erro inesperado durante a renderizacao da tela.",
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error("Route render failure", error, info);
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      message: "",
    });
  };

  private handleReload = (): void => {
    if (typeof window === "undefined") return;
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const route = typeof window !== "undefined" ? window.location.pathname : "";

    return (
      <div className="glass-card rounded-lg border border-destructive/30 p-6 space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-base font-semibold">Falha ao carregar a tela</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          A rota atual apresentou um erro de renderizacao e foi protegida para evitar tela em branco.
        </p>
        <p className="text-xs text-muted-foreground">
          Rota: {route || "-"}{this.state.message ? ` - Detalhe: ${this.state.message}` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={this.handleRetry}>Tentar novamente</Button>
          <Button type="button" variant="outline" onClick={this.handleReload}>Recarregar pagina</Button>
        </div>
      </div>
    );
  }
}

export default RouteErrorBoundary;
