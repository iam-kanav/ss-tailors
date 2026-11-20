import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9e2a2b]">404</p>
        <h1 className="font-serif text-4xl font-medium text-[#171412]">Garment Not Found</h1>
        <p className="text-sm text-[#6c635b]">
          The page or piece you are looking for may have been retired from our seasonal atelier collection.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex px-6 py-3 rounded-full bg-[#171412] hover:bg-[#9e2a2b] text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
          >
            Back to S.S Tailors
          </Link>
        </div>
      </div>
    </div>
  );
}
