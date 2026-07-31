// src/components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Without this, a render error anywhere in the tree used to blank the
// whole screen with no feedback — the user would just see white/blank and
// have no way to recover short of force-quitting the app. This catches it,
// shows a friendly recovery screen, and logs the error to the console so
// it's at least visible via remote debugging if ever needed.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare state: ErrorBoundaryState;
  declare props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('RenaSer crashed:', error, info.componentStack);
  }

  handleReload = () => {
    // No need to reset this.state — the reload below replaces the whole
    // page, so there's nothing left to re-render into.
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-[999] bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center gap-4">
          <p className="text-2xl">🦋</p>
          <h1 className="text-lg font-serif font-medium text-slate-900 dark:text-white">
            Algo não carregou direito
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            Isso não deveria ter acontecido. Recarregue a página — seu progresso está salvo.
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-3 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
