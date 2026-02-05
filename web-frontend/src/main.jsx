import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LineraContextProvider } from "./context/LineraContext";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Result from "./pages/Result";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <details>
            <summary>Technical Details</summary>
            <pre>{this.state.error && this.state.error.toString()}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ErrorBoundary>
    <BrowserRouter>
      <LineraContextProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </LineraContextProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
