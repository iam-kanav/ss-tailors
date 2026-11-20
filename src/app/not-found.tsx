import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <p className="text-xs text-[#777777]">404</p>
        <h1 className="text-2xl font-semibold text-[#111111]">Page not found</h1>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-[#111111] hover:bg-[#9b1c1c] text-white text-sm font-medium transition-colors"
        >
          Back to S.S Tailors
        </Link>
      </div>
    </div>
  );
}
