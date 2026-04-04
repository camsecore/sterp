"use client";

export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-lg font-medium text-neutral-900 mb-2">Profile failed to load</h2>
        <p className="text-sm text-neutral-500 mb-6">Something went wrong loading this profile.</p>
        <button
          onClick={reset}
          className="text-sm text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
