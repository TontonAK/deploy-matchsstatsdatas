import HeaderMatch from "@/components/matchs/header-match";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMatchDetails } from "@/database/matchs/get-matchs";
import VoiceRecorder from "@/features/voice-recorder/voice-recorder";
import { getRequiredUser } from "@/lib/auth-session";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ ulid: string }>;
}

const tabsMenu = [
  {
    action: "events",
    menu: "Evènements",
  },
];

export default async function TestLiveVoicePage(props: PageProps) {
  const user = await getRequiredUser();

  if (user.role !== "admin" || (user.job !== "Coach" && user.job !== "Admin")) {
    redirect("/matchs");
  }

  const params = await props.params;
  const matchStats = await getMatchDetails(params.ulid);

  if (!matchStats) {
    notFound();
  }

  return (
    <main className="font-montserrat font-bold">
      <HeaderMatch matchData={matchStats} />
      <Tabs
        className="flex w-full justify-center relative"
        defaultValue="events"
      >
        <TabsList className="rounded-none bg-transparent h-auto flex pt-1 overflow-x-auto text-sm md:justify-center lg:text-base border-b border-solid border-gray-200 w-full">
          {tabsMenu.map((item) => (
            <TabsTrigger
              key={item.action}
              className="flex px-4 py-4 rounded-none font-semibold uppercase text-black border-solid border-plaisir-primary hover:border-b-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:font-extrabold"
              value={item.action}
            >
              {item.menu}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="events">
          <div className="p-4 text-center text-xs text-muted-foreground">
            <VoiceRecorder
              homeTeam={matchStats.homeTeam.club.name}
              awayTeam={matchStats.awayTeam.club.name}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
