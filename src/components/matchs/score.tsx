"use client";

export function Score() {
  // Pour l'exemple, on met des scores statiques. À remplacer par des props si besoin.
  const scoreLocal = 48;
  const scoreVisiteur = 7;

  return (
    <div className="flex items-center px-8 py-2 rounded-lg text-3xl font-bold">
      <span className="min-w-[40px] text-center">{scoreLocal}</span>
      <span className="mx-4 text-2xl text-gray-500">-</span>
      <span className="min-w-[40px] text-center">{scoreVisiteur}</span>
    </div>
  );
}
