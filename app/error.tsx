"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#9f7a49]">
          Something went wrong
        </p>
        <h2 className="mt-4 font-serif text-4xl text-neutral-900">
          The page hit an unexpected error.
        </h2>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          Try again first. If it keeps failing, refresh the page and retry your
          action.
        </p>
        <button
          className="mt-8 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
