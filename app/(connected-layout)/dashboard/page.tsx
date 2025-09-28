import { Calendar } from "lucide-react";
import { Metadata } from "next";
import { DashboardLastMatchs } from "./dashboard-last-matchs";
import { DashboardNextMatch } from "./dashboard-next-match";
import { DashboardResumeStats } from "./dashboard-resume-stats";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
  return (
    <div className="pt-15 font-montserrat font-bold space-y-6">
      <div className="flex gap-6 w-full py-4 px-6 bg-gradient-to-br from-plaisir-primary to-plaisir-secondary rounded-xl shadow-lg border border-yellow-600">
        {/* Prochain match */}
        <div className="flex flex-col items-center justify-between bg-white/80 rounded-lg shadow-md px-6 py-4 grow">
          <div className="flex justify-center gap-2">
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              Prochain match
            </span>
          </div>
          <DashboardNextMatch />
        </div>

        {/* 5 derniers matchs */}
        <div className="flex flex-col bg-white/80 rounded-lg shadow-md px-6 py-4 grow">
          <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar />5 derniers matchs
          </div>
          <DashboardLastMatchs />
        </div>
      </div>

      {/* Statistiques résumées */}
      <DashboardResumeStats />
    </div>
  );
}
