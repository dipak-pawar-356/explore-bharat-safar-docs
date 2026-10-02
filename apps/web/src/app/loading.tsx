export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-bharat-saffron-200 border-t-bharat-saffron-600 rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest font-semibold text-bharat-saffron-600">
          Loading Ecosystem...
        </span>
      </div>
    </div>
  );
}
