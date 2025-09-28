import { Calendar } from "lucide-react";

const lastMatchs = [
  {
    date: "14/09",
    place: "E",
    opponent: "",
    result: "V",
    score: "10-21",
  },
  {
    date: "21/09",
    place: "D",
    opponent: "",
    result: "V",
    score: "54-12",
  },
  {
    date: "28/09",
    place: "E",
    opponent: "",
    result: "V",
    score: "7-28",
  },
  {
    date: "05/10",
    place: "D",
    opponent: "",
    result: "V",
    score: "48-7",
  },
  {
    date: "12/10",
    place: "E",
    opponent: "",
    result: "D",
    score: "24-20",
  },
];

export default function FiveLastMatchs() {
  return (
    <div className="flex flex-col bg-white/80 rounded-lg shadow-md px-6 py-4 grow">
      <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <Calendar />5 derniers matchs
      </div>
      <ul className="text-sm text-gray-600 space-y-1">
        <li className="flex items-center gap-2">
          <span className="font-medium">Plaisir RC 2-1 Versailles</span>
          <span className="ml-auto text-green-600 font-bold">V</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="font-medium">Plaisir RC 1-1 Velizy</span>
          <span className="ml-auto text-gray-600 font-bold">N</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="font-medium">Yerres 1-0 Plaisir RC</span>
          <span className="ml-auto text-red-600 font-bold">D</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="font-medium">Yerres 1-0 Plaisir RC</span>
          <span className="ml-auto text-red-600 font-bold">D</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="font-medium">Yerres 1-0 Plaisir RC</span>
          <span className="ml-auto text-red-600 font-bold">D</span>
        </li>
      </ul>
    </div>
  );
}
