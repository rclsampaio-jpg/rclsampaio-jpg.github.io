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
    // A plain reload() can still be served from cache and re-crash on the
    // same stale bundle (this screen most often fires when a lazy chunk
    // 404s because the deployed dist/ moved on since this tab loaded).
    // Cache-busting the URL forces a real network fetch of the new index.html.
    window.location.href = `${window.location.pathname}?_=${Date.now()}`;
  };

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-[999] bg-[#FAF8F5] dark:bg-ink flex flex-col justify-center items-center p-6 text-center gap-4">
          <p className="text-2xl">🦋</p>
          <h1 className="text-lg font-serif font-medium text-slate-900 dark:text-ink-text">
            Algo não carregou direito
          </h1>
          <p className="text-xs text-slate-500 dark:text-ink-muted max-w-xs">
            Isso não deveria ter acontecido. Recarregue a página — seu progresso está salvo.
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-3 bg-rosegold dark:bg-transparent dark:border dark:border-rosegold-light hover:bg-[#A35D68] dark:hover:bg-rosegold-light/10 text-white dark:text-rosegold-light rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
