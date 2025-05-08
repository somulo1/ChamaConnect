import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Simple error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#e11d48' }}>Something went wrong</h1>
          <pre style={{ 
            background: '#f1f5f9', 
            padding: '16px', 
            borderRadius: '6px',
            whiteSpace: 'pre-wrap',
            overflow: 'auto'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}



createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
