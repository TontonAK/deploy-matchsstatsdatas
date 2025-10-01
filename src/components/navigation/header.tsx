import { Role } from "@/generated/prisma";
import { getRequiredUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { MenuItem, UserRole } from "@/lib/utils";
import {
  CalendarSearch,
  ChartBar,
  Crown,
  LayoutDashboard,
  Settings,
  ShieldHalf,
  User,
  UserPen,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { unauthorized } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { LogoutButton } from "./logout-button";
import { MobileMenu } from "./mobile-menu";

const dataHeader = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    title: "Matchs",
    url: "/matchs",
    icon: <CalendarSearch className="size-4" />,
  },
  {
    title: "Statistiques",
    url: "#",
    icon: <ChartBar className="size-4" />,
    items: [
      {
        title: "Stats équipe",
        url: "/statistics/teams",
        icon: <ShieldHalf className="size-4" />,
      },
      {
        title: "Stats joueurs",
        url: "/statistics/players",
        icon: <User className="size-4" />,
      },
    ],
  },
];

const dataAdminHeader = [
  {
    title: "Administration",
    url: "#",
    icon: <Crown className="size-4" />,
    items: [
      {
        title: "Clubs",
        url: "/admin/clubs",
        icon: <ShieldHalf className="size-4" />,
      },
      {
        title: "Joueurs",
        url: "/admin/players",
        icon: <Users className="size-4" />,
      },
      {
        title: "Paramètres",
        url: "/admin/parameters",
        icon: <Settings className="size-4" />,
      },
    ],
  },
];

function GotFirstCharacter(name: string) {
  return name.at(0);
}

export default async function Header() {
  const user = await getRequiredUser();
  const player = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      firstname: true,
      lastname: true,
      image: true,
      role: true,
      job: true,
      club: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
    },
  });

  if (!player) {
    unauthorized();
  }

  const job = UserRole[player.job as Role];

  // Menu items for mobile sidebar
  const mainMenuItems = dataHeader.filter((item) => !item.items);
  const statsMenuItem = dataHeader.find(
    (item) => item.title === "Statistiques"
  );
  const adminMenuItem = dataAdminHeader.find(
    (item) => item.title === "Administration"
  );

  const userForNav = {
    id: player.id,
    name: player.name ?? "",
    firstname: player.firstname,
    lastname: player.lastname,
    image: player.image,
    job: job.name,
  };

  return (
    <div className="fixed z-50 top-0 left-0 w-full bg-white font-montserrat">
      <header className="w-full border-b-4 border-plaisir-primary">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex mx-10">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src={player.club.logo ?? "/default-logo.png"}
                alt="Logo"
                width={32}
                height={32}
                className="object-cover"
              />
              <span className="text-lg font-semibold tracking-tighter">
                {player.club.name}
              </span>
            </div>
            <div className="flex items-center">
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  {dataHeader.map((item) => renderMenuItem(item))}
                  {user.role === "admin" &&
                    dataAdminHeader.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.image ?? "/default-player.png"} />
                  <AvatarFallback className="rounded-lg">
                    {GotFirstCharacter(player.firstname)}
                    {GotFirstCharacter(player.lastname)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="flex items-start gap-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {player.name}
                    </span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {job.name}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile`} className="flex items-center gap-2">
                    <UserPen className="size-4 opacity-60" aria-hidden="true" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/statistics/players/${player.id}`}
                    className="flex items-center gap-2"
                  >
                    <ChartBar
                      className="size-4 opacity-60"
                      aria-hidden="true"
                    />
                    Mes statistiques
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Mobile Menu */}
        <MobileMenu
          clubLogo={player.club.logo}
          clubName={player.club.name}
          mainMenuItems={mainMenuItems}
          statsMenuItem={statsMenuItem}
          adminMenuItem={adminMenuItem}
          isAdmin={user.role === "admin"}
          user={userForNav}
        />
      </header>
    </div>
  );
}

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>
          <span className="flex flex-row items-center gap-2">
            {item.icon}
            {item.title}
          </span>
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground !left-auto">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
      >
        <span className="flex flex-row items-center gap-2">
          {item.icon}
          {item.title}
        </span>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      {item.icon}
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
      </div>
    </a>
  );
};

export { Header };
