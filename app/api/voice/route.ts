import { getClubAlias } from "@/database/clubs/get-club";
import openai from "@/lib/openai";
import { mapTeamName } from "@/utils/mapTeamName";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File;
    const homeTeamFull = formData.get("homeTeam")?.toString() || "";
    const awayTeamFull = formData.get("awayTeam")?.toString() || "";

    const homeAliases = [homeTeamFull];
    const awayAliases = [awayTeamFull];

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    // 🟢 Récupération des alias depuis la BDD
    const homeAliasesDb = await getClubAlias(homeTeamFull);

    const awayAliasesDb = await getClubAlias(awayTeamFull);

    if (homeAliasesDb) {
      homeAliases.concat(homeAliasesDb?.alias.split(","));
    }

    if (awayAliasesDb) {
      awayAliases.concat(awayAliasesDb?.alias.split(","));
    }

    const synonyms = {
      home: homeAliases,
      away: awayAliases,
    };

    // 🟢 Envoi à Whisper pour transcription brute
    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      language: "fr",
    });

    const spokenText = transcription.text;

    // 🟢 Mapping avec helper (indépendant de GPT)
    const teamSide = mapTeamName(spokenText, synonyms);

    // 🟢 Envoi à GPT pour structuration JSON
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant d'arbitrage de rugby.

Équipes :
- home = ${homeTeamFull}
- away = ${awayTeamFull}

Ta tâche : analyser le texte et retourner un JSON strict :
{
  "eventType": "...",
  "team": "home | away | null",
  "playerNumber": <numéro ou null>,
  "mainPlayer": <numéro ou null>,
  "secondPlayer": <numéro ou null>,
  "minute": <minute ou null>
}

IMPORTANT :
- eventType doit appartenir à : Essai, Transformation réussie, Transformation manquée, Pénalité, Pénalité réussie, Pénalité manquée, Carton jaune, Carton rouge, Remplacement.
- team est "home" ou "away". Si tu n’arrives pas à savoir → null.
- playerNumber = joueur principal (ex: essai, pénalité). null si pas dit.
- mainPlayer = joueur sortant en cas de remplacement.
- secondPlayer = joueur entrant en cas de remplacement.
- minute = si le texte dit "à la 15ème" ou "à la 15ème minute", retourne 15. Sinon null.
        `,
        },
        {
          role: "user",
          content: spokenText,
        },
      ],
    });

    console.log(gptResponse.choices[0].message.content);

    const structured = JSON.parse(
      gptResponse.choices[0].message.content || "{}"
    );

    // 🟢 Sécurisation du team si notre helper a déjà trouvé
    if (teamSide && structured.team !== teamSide) {
      structured.team = teamSide;
    }

    return NextResponse.json({
      text: spokenText,
      structured,
    });
  } catch (error) {
    console.error("Erreur API voice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
