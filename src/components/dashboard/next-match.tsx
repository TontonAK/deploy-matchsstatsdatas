"use client";

import { Calendar } from "lucide-react";
import StadiumIcon from "../svg/stadium-icon";

export default function NextMatch() {
  return (
    <div className="flex gap-6 w-full py-4 px-6 bg-gradient-to-br from-plaisir-primary to-plaisir-secondary rounded-xl shadow-lg border border-yellow-600">
      {/* Prochain match */}
      <div className="flex flex-col items-center justify-between bg-white/80 rounded-lg shadow-md px-6 py-4 grow">
        <div className="flex justify-center gap-2">
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
            Prochain match
          </span>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Logo équipe domicile"
            className="w-14 h-14 object-contain"
          />
          <span className="text-lg font-bold text-gray-800">Plaisir RC</span>
          <span className="text-2xl font-bold text-gray-600">VS</span>
          <span className="text-lg font-bold text-gray-800">RO Yerrois</span>
          <img
            src="/logo2.png"
            alt="Logo équipe extérieure"
            className="w-14 h-14 object-contain"
          />
        </div>
        <div className="mt-2 text-center">
          <div className="text-base text-gray-500">
            Championnat île-de-France - Régionale 2 - Poule 2
          </div>
          <div className="text-sm text-gray-500">
            Dimanche 26 Octobre 2025 - 15:00
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1 justify-center">
            <StadiumIcon />
            <span>Stade Robert Barran</span>
          </div>
        </div>
      </div>

      {/* 5 derniers matchs */}
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
        </ul>
      </div>
    </div>
  );
}
