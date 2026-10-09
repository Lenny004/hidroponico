import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Aísla fallos de renderizado, especialmente WebGL/Three.js, del resto de la aplicación. */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Error de interfaz aislado", error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return this.props.fallback ?? (
      <section className="error-interfaz" role="alert">
        <h2>La vista necesita reiniciarse</h2>
        <p>{this.state.error.message || "Ocurrió un error inesperado."}</p>
        <button className="error-interfaz__boton" type="button" onClick={() => window.location.reload()}>
          Recargar aplicación
        </button>
      </section>
    );
  }
}
