"use client";

import { useEffect } from "react";

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 bg-[#f7f1e8] text-neutral-950">
        <main className="flex min-h-screen items-center justify-center px-6 py-20">
          <div className="max-w-xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#9f7a49]">
              Application error
            </p>
            <h1 className="mt-4 font-serif text-4xl">
              The app couldn&apos;t finish loading.
            </h1>
            <p className="mt-4 text-base leading-7 text-neutral-700">
              Retry once from here. If the problem persists, refresh the browser
              to request a clean render.
            </p>
            <button
              className="mt-8 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              onClick={reset}
              type="button"
            >
              Reload app
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
