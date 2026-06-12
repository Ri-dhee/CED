"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">Application error</h1>
          <p className="mt-2 text-sm text-gray-600">
            The site hit an unrecoverable runtime error.
          </p>
          {error.digest && (
            <p className="mt-3 text-xs text-gray-400">Digest: {error.digest}</p>
          )}
          <div className="mt-5 flex gap-2">
            <button
              onClick={reset}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
