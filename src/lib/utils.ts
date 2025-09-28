import { CatchBlockAreaLineout, GroundArea, Role } from "@/generated/prisma";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export enum typeImageEnum {
  PLAYER = "Joueur",
  TEAM = "Equipe",
}

export enum MatchLineupNumberEnum {
  TWENTY_TWO = 22,
  TWENTY_FIVE = 25,
  THIRTY = 30,
}

export enum SideTeam {
  Home = "Domicile",
  Away = "Visiteur",
}

export enum EventType {
  Try = "Essai",
  Conversion = "Transformation réussie",
  NoConversion = "Transformation manquée",
  Drop = "Drop réussi",
  NoDrop = "Drop manqué",
  Penalty = "Pénalité",
  FreeKick = "Coup franc",
  PenaltyGoal = "Pénalité réussie",
  NoPenaltyGoal = "Pénalité manquée",
  YellowCard = "Carton jaune",
  RedCard = "Carton rouge",
  Substitution = "Remplacement",
}

export enum MatchEventGroupEnum {
  Tries = "Essais",
  Shoots = "Coups de pieds",
  Fouls = "Fautes",
  Other = "Autres",
}

export interface MatchEventType {
  eventType: EventType;
  team: "home" | "away" | number;
  playerNumber: number | null; // joueur concerné par l’action
  mainPlayer?: number | null; // joueur qui sort (pour remplacement)
  secondPlayer?: number | null; // joueur qui rentre (pour remplacement)
  minute: number | null; // minute annoncée (ou null si pas dit)
}

export const UserRole: Record<Role, { name: string }> = {
  Player: {
    name: "Joueur",
  },
  Coach: {
    name: "Entraîneur",
  },
  Admin: {
    name: "Administrateur",
  },
};

export const GroundAreaName: Record<GroundArea, string> = {
  Own_22_In_Goal: "Propre 22 / en-but",
  Own_40: "Propre 40",
  Own_50: "Propre 50",
  Opp_50: "50 adverse",
  Opp_40: "40 adverse",
  Opp_22_In_Goal: "22 adverse / en-but",
};

export const AreaLineoutName: Record<CatchBlockAreaLineout, string> = {
  Block_Area_1: "Zone de saut 1 (devant)",
  Block_Area_2: "Zone de saut 2 (milieu)",
  Block_Area_3: "Zone de saut 3 (fond)",
};

export interface TileMatchProps {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | undefined;
  team: string;
}

export interface StatBarProps {
  statTitle: string;
  statValueType: string;
  statHome: number;
  statAway: number;
  statHomeColor: string;
  statAwayColor: string;
}

export interface MenuItem {
  title: string;
  url: string;
  icon: React.ReactNode;
  items?: MenuItem[];
}
