"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackText?: string;
}

interface State {
  hasError: boolean;
  errorInfo?: string;
}

export class ErrorBoundaryWrapper extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorInfo: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Section Error Caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-dashed border-red-300 bg-red-50/30 rounded-xl text-center my-2">
          <p className="text-xs font-medium text-red-600 mb-2">
            {this.props.fallbackText || "ไม่สามารถแสดงผลส่วนนี้ได้ชั่วคราว"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs underline text-slate-600 hover:text-slate-900"
          >
            ลองกดรีเฟรชส่วนนี้
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
