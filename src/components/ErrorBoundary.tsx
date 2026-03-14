import * as React from 'react';

export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    const { hasError, error } = (this as any).state;
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-border p-8 rounded-3xl shadow-2xl text-center space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Application Error</h1>
            <p className="text-muted-foreground text-sm">{error?.message}</p>
            <button onClick={() => window.location.reload()} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold">Reload</button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
