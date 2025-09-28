import { Header } from "@/components/navigation/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren } from "react";

export default function Layout(props: PropsWithChildren) {
  return (
    <SidebarProvider>
      <SidebarInset>
        <Header />
        {props.children}
      </SidebarInset>
    </SidebarProvider>
  );
}
