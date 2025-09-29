import { PrismaClient } from "../src/generated/prisma";

//const scryptAsync = promisify(scrypt);

/*async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32);
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}*/

const prisma = new PrismaClient();

async function main() {
  /*const positions = await prisma.position.createMany({
    data: [
      { name: "Pilier gauche", shortName: "1LG", group: "First_Line" },
      { name: "Talonneur", shortName: "TAL", group: "First_Line" },
      { name: "Pilier droit", shortName: "1LD", group: "First_Line" },
      { name: "Seconde ligne", shortName: "2L", group: "Second_Line" },
      { name: "Troisième ligne aile", shortName: "3LA", group: "Third_Line" },
      { name: "Troisième ligne centre", shortName: "3LC", group: "Third_Line" },
      { name: "Demi de mêlée", shortName: "DM", group: "Scrum_Fly_Half" },
      { name: "Demi d'ouverture", shortName: "DO", group: "Scrum_Fly_Half" },
      { name: "Ailier", shortName: "AIL", group: "Winger" },
      { name: "Centre", shortName: "CTR", group: "Center" },
      { name: "Arrière", shortName: "ARR", group: "Full_Back" },
    ],
  });

  const matchTypes = await prisma.matchType.createMany({
    data: [
      { name: "Amical" },
      { name: "Championnat" },
      { name: "Barrage" },
      { name: "32ème de finale" },
      { name: "16ème de finale" },
      { name: "8ème de finale" },
      { name: "Quart de finale" },
      { name: "Demi-finale" },
      { name: "Finale" },
    ],
  });*/
  /*const league = await prisma.league.create({
    data: {
      name: "Régionale 1",
        slug: "regionale-1",
        pools: {
          create: [{ pool: "Poule 1" }, { pool: "Poule 2" }],
        },
    },
      {
        name: "Régionale 1",
        slug: "regionale-1",
        pools: {
          create: [{ pool: "Poule 1" }, { pool: "Poule 2" }],
        },
      },
  });*/
  /*const season = await prisma.season.create({
    data: {
      name: "2025-2026",
      seasonLeague: {
        create: {
          typeMatchId: 1,
        },
      },
    },
  });

  await prisma.club.update({
    where: {
      slug: "plaisir-rugby-club",
    },
    data: {
      stadiums: {
        create: [
          { name: "Stade Robert Barran" },
          { name: "Stade des Peupliers" },
        ],
      },
    },
  });

  await prisma.club.update({
    where: {
      slug: "rc-velizy-villacoublay",
    },
    data: {
      stadiums: {
        create: [
          { name: "Stade Robert Wagner" },
          { name: "Stade Du Domaine De La Cour Roland" },
        ],
      },
    },
  });

  await prisma.club.update({
    where: {
      slug: "urc-78",
    },
    data: {
      stadiums: {
        create: [
          { name: "Stade Guy Boniface" },
          { name: "Stade Du Bout Des Clos" },
        ],
      },
    },
  });*/
  /*const statTypes = await prisma.statType.createMany({
    data: [
      { name: "Points inscrits", valueType: "Number" },
      { name: "Possession", valueType: "Percentage" },
      { name: "Territoriale", valueType: "Percentage" },
      { name: "Essais", valueType: "Number" },
      { name: "Drops tentés", valueType: "Number" },
      { name: "Drops réussis", valueType: "Number" },
      { name: "Transformations tentées", valueType: "Number" },
      { name: "Transformations réussies", valueType: "Number" },
      { name: "Pénalités tentées", valueType: "Number" },
      { name: "Pénalités réussies", valueType: "Number" },
      { name: "Pénalités concédées", valueType: "Number" },
      { name: "Coups francs concédés", valueType: "Number" },
      { name: "Mêlées gagnées", valueType: "Number" },
      { name: "Mêlées perdues", valueType: "Number" },
      { name: "Touches gagnées", valueType: "Number" },
      { name: "Touches perdues", valueType: "Number" },
      { name: "Cartons jaunes", valueType: "Number" },
      { name: "Cartons rouges", valueType: "Number" },
      { name: "Passes tentées", valueType: "Number" },
      { name: "Passes réusies", valueType: "Number" },
      { name: "Plaquages tentés", valueType: "Number" },
      { name: "Plaquages réusis", valueType: "Number" },
      { name: "Rucks gagnés", valueType: "Number" },
      { name: "Rucks perdus", valueType: "Number" },
      { name: "Mauls gagnés", valueType: "Number" },
      { name: "Mauls perdus", valueType: "Number" },
      { name: "Ballons perdus", valueType: "Number" },
      { name: "Turnovers gagnés", valueType: "Number" },
      { name: "Turnovers concédés", valueType: "Number" },
      { name: "Temps de jeu", valueType: "Number" },
    ],
  });

  const matchEventTypes = await prisma.matchEventType.createMany({
    data: [
      { name: "Essai" },
      { name: "Transformation réussie" },
      { name: "Transformation manquée" },
      { name: "Drop réussi" },
      { name: "Drop manqué" },
      { name: "Pénalité" },
      { name: "Coup franc" },
      { name: "Pénalité réussie" },
      { name: "Pénalité manquée" },
      { name: "Carton jaune" },
      { name: "Carton rouge" },
      { name: "Remplacement" },
    ],
  });

  const matchPeriodTypes = await prisma.matchPeriodType.createMany({
    data: [
      { name: "2x40min", numberPeriod: 2, durationPeriod: 40 },
      {
        name: "2x40min + 2x10min prolongations",
        numberPeriod: 2,
        durationPeriod: 40,
        extratimeNumberPeriod: 2,
        extratimeDurationPeriod: 10,
      },
      { name: "3x30 min", numberPeriod: 3, durationPeriod: 30 },
    ],
  });

  /*const club = await prisma.club.create({
    data: {
      name: "Plaisir Rugby Club",
      slug: "plaisir-rugby-club",
      primaryColor: "#2855d6",
      secondaryColor: "#fded01",
      stadium: "Stade Robert Barran",
      logo: "/logo.png",
      teams: {
        create: {
          name: "Equipe 3",
        },
      },
    },
    include: {
      users: true,
      teams: true,
    },
  });

  // TODO : changer la façon de créer un user/player. Passer par signUp de better auth
  const { data, error } = await authClient.signUp.email({
    email: "f.buisson@cegetel.net",
    password: "nyauIJicAzn7po91&",
    name: "Fabien Buisson",
    lastname: "Buisson",
    firstname: "Fabien",
    slug: "fabien-buisson",
    clubId: club.id,
    job: "Admin",
  });

  const user = await prisma.user.update({
    where: {
      email: "f.buisson@cegetel.net",
    },
    data: {
      positions: {
        create: [
          { position: { connect: { id: 3 } }, isMainPosition: true },
          { position: { connect: { id: 4 } } },
        ],
      },
      teams: {
        create: {
          team: {
            connect: {
              id: 1,
            },
          },
        },
      },
    },
  });*/
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
