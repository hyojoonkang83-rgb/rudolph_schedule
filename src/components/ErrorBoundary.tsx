import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFC] p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-border">
            <div className="h-20 w-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">앗! 문제가 발생했습니다</h1>
            <p className="text-foreground/60 text-sm mb-8 leading-relaxed">
              프로그램 실행 중 예기치 못한 오류가 발생했습니다. <br/>
              화면을 새로고침하거나 데이터를 초기화해 보세요.
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                <RefreshCw className="h-4 w-4" />
                다시 시도하기
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 w-full bg-muted text-foreground/60 font-bold py-4 rounded-2xl hover:bg-muted/80 transition-all"
              >
                데이터 전체 초기화 후 시작
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
