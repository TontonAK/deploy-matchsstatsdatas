import { MenuItem } from "@/lib/utils";
import { LogIn } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";

const dataHeader = [
  {
    title: "Se connecter",
    url: "/login",
    icon: <LogIn className="size-4" />,
  },
];

export default async function HeaderDisconnect() {
  return (
    <div className="fixed z-50 top-0 left-0 w-full bg-white font-montserrat">
      <header className="w-full border-b-4 border-plaisir-primary">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex mx-10">
          <div className="flex items-center">
            <div className="flex items-center gap-6">
              <NavigationMenu>
                <NavigationMenuList>
                  {dataHeader.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}

const renderMenuItem = (item: MenuItem) => {
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

/*const renderMobileMenuItem = (item: MenuItem) => {
  return (
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.icon}
      {item.title}
    </a>
  );
};*/

export { HeaderDisconnect };
