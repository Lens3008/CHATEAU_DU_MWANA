export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-[var(--color-public-primary)] rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Chargement magique en cours...</p>
    </div>
  );
}
