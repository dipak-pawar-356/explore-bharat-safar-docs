import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-bharat-saffron-100 dark:bg-bharat-indigo-900 flex items-center justify-center text-bharat-saffron-600 mb-6">
        <span className="text-3xl font-black">404</span>
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
        Destination Not Found
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
        The geographic coordinate, village record, or exploration route you requested does not exist
        or has moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-bharat-saffron-600 text-white hover:bg-bharat-saffron-700 transition"
      >
        Return to Bharat Canvas
      </Link>
    </div>
  );
}
