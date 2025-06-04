import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/root";

import "./styles/global.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "@m5nv/ui-elements Demo - Container Query Showcase" },
    {
      name: "description",
      content:
        "Interactive demo showcasing the revolutionary @m5nv/ui-elements component library with comprehensive container query support and real-world examples",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "theme-color", content: "#7c9885" }, // Updated to match Ghibli palette
    {
      name: "keywords",
      content:
        "container queries, UI components, responsive design, React, CSS",
    },
  ];
}

export function links() {
  return [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    },
    // Add manifest for PWA-like experience
    { rel: "manifest", href: "/manifest.json" },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set default theme and palette on app load
    // This ensures consistent theming across the entire app
    const savedPalette = localStorage.getItem("ui-elements-palette") ||
      "ghibli";
    const savedTheme = localStorage.getItem("ui-elements-theme") || "light";

    document.documentElement.setAttribute("data-palette", savedPalette);
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Update theme-color meta tag based on palette
    const themeColorMap = {
      ghibli: "#7c9885",
      blue: "#3b82f6",
      purple: "#8b5cf6",
      green: "#10b981",
      orange: "#f97316",
    };

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        "content",
        themeColorMap[savedPalette as keyof typeof themeColorMap] || "#7c9885",
      );
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "var(--mv-space-xl)",
          textAlign: "center",
          background: "var(--mv-color-background)",
          color: "var(--mv-color-text-primary)",
        }}
      >
        <div style={{ fontSize: "6rem", marginBottom: "var(--mv-space-lg)" }}>
          {error.status === 404 ? "🔍" : "⚠️"}
        </div>
        <h1
          style={{
            fontSize: "3rem",
            margin: "0 0 var(--mv-space-md) 0",
            color: "var(--mv-color-danger)",
          }}
        >
          {error.status}
        </h1>
        <h2
          style={{
            fontSize: "1.5rem",
            margin: "0 0 var(--mv-space-lg) 0",
          }}
        >
          {error.status === 404 ? "Page Not Found" : error.statusText}
        </h2>
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--mv-color-text-secondary)",
            maxWidth: "600px",
            margin: "0 0 var(--mv-space-xl) 0",
            lineHeight: "1.6",
          }}
        >
          {error.status === 404
            ? "The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL."
            : "Something went wrong. Please try again later or contact support if the problem persists."}
        </p>
        <div
          style={{
            display: "flex",
            gap: "var(--mv-space-md)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--mv-space-sm)",
              padding: "var(--mv-space-md) var(--mv-space-lg)",
              background: "var(--mv-color-primary)",
              color: "var(--mv-color-text-inverse)",
              borderRadius: "var(--mv-radius-md)",
              textDecoration: "none",
              fontWeight: "500",
              transition: "var(--mv-transition-fast)",
              border: "2px solid var(--mv-color-primary)",
            }}
          >
            🏠 Go Home
          </a>
          <a
            href="/showcase"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--mv-space-sm)",
              padding: "var(--mv-space-md) var(--mv-space-lg)",
              background: "transparent",
              color: "var(--mv-color-primary)",
              border: "2px solid var(--mv-color-primary)",
              borderRadius: "var(--mv-radius-md)",
              textDecoration: "none",
              fontWeight: "500",
              transition: "var(--mv-transition-fast)",
            }}
          >
            🚀 Container Query Showcase
          </a>
          <button
            onClick={() => window.history.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--mv-space-sm)",
              padding: "var(--mv-space-md) var(--mv-space-lg)",
              background: "transparent",
              color: "var(--mv-color-text-primary)",
              border: "2px solid var(--mv-color-border)",
              borderRadius: "var(--mv-radius-md)",
              fontWeight: "500",
              cursor: "pointer",
              transition: "var(--mv-transition-fast)",
              fontFamily: "inherit",
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "var(--mv-space-xl)",
        textAlign: "center",
        background: "var(--mv-color-background)",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "var(--mv-space-lg)" }}>
        💥
      </div>
      <h1
        style={{
          color: "var(--mv-color-danger)",
          margin: "0 0 var(--mv-space-md) 0",
        }}
      >
        Application Error
      </h1>
      <p
        style={{
          color: "var(--mv-color-text-secondary)",
          margin: "0 0 var(--mv-space-lg) 0",
          fontSize: "var(--mv-font-size-lg)",
        }}
      >
        Something unexpected happened. Please refresh the page or try again
        later.
      </p>
      <div
        style={{
          display: "flex",
          gap: "var(--mv-space-md)",
          marginBottom: "var(--mv-space-lg)",
        }}
      >
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "var(--mv-space-md) var(--mv-space-lg)",
            background: "var(--mv-color-primary)",
            color: "var(--mv-color-text-inverse)",
            border: "none",
            borderRadius: "var(--mv-radius-md)",
            cursor: "pointer",
            fontWeight: "500",
            fontFamily: "inherit",
          }}
        >
          🔄 Refresh Page
        </button>
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "var(--mv-space-md) var(--mv-space-lg)",
            background: "transparent",
            color: "var(--mv-color-text-primary)",
            border: "1px solid var(--mv-color-border)",
            borderRadius: "var(--mv-radius-md)",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          🏠 Go Home
        </a>
      </div>
      <details
        style={{
          marginTop: "var(--mv-space-lg)",
          padding: "var(--mv-space-md)",
          background: "var(--mv-color-surface)",
          borderRadius: "var(--mv-radius-md)",
          border: "1px solid var(--mv-color-border)",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontWeight: "500",
            color: "var(--mv-color-text-primary)",
            marginBottom: "var(--mv-space-sm)",
          }}
        >
          🔍 Error Details
        </summary>
        <pre
          style={{
            marginTop: "var(--mv-space-md)",
            textAlign: "left",
            fontSize: "0.875rem",
            color: "var(--mv-color-text-secondary)",
            whiteSpace: "pre-wrap",
            backgroundColor: "var(--mv-color-surface-elevated)",
            padding: "var(--mv-space-md)",
            borderRadius: "var(--mv-radius-sm)",
            overflow: "auto",
          }}
        >
          {error instanceof Error ? error.message : "Unknown error"}
          {error instanceof Error && error.stack && (
            <>
              {'\n\nStack trace:\n'}
              {error.stack}
            </>
          )}
        </pre>
      </details>
    </div>
  );
}
