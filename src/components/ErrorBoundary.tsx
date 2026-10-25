import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Sprout, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error('Unexpected application error:', error.message);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-6">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Something went wrong
            </h1>
            <p className="text-stone-600 mb-6 leading-relaxed">
              The page hit an unexpected problem. Try refreshing — your data is safe.
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
