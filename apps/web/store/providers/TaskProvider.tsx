"use client";

// The global QueryProvider in app/layout.tsx already wraps the whole app.
// This wrapper just passes children through so tasks share the same cache
// as the dashboard and contacts pages.
export default function TaskProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
