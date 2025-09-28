export type TeamSide = "home" | "away" | null;

interface TeamSynonyms {
  home: string[];
  away: string[];
}

export function mapTeamName(text: string, synonyms: TeamSynonyms): TeamSide {
  const normalized = text.toLowerCase();

  for (const alias of synonyms.home) {
    if (normalized.includes(alias.toLowerCase())) {
      return "home";
    }
  }

  for (const alias of synonyms.away) {
    if (normalized.includes(alias.toLowerCase())) {
      return "away";
    }
  }

  return null;
}
