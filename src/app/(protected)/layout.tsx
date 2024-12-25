import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { getUserSession } from "~/hooks/getUser";
import App_sidebar from "./app_sidebar";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getUserSession();

  return (
    <SidebarProvider>
      {/* <AppSidebat/> */}
      <App_sidebar />
      <main className="m-2 w-full">
        <div className="border-sidebar-border bg-sidebar flex gap-2 rounded-lg border p-4">
          <Avatar>
            <AvatarImage src={session.user?.image as string} />
            <AvatarFallback>{session.user?.name}</AvatarFallback>
          </Avatar>
          {/* Your app content */}
          {/* <AppContent /> */}
        </div>
        <div className="border-primary mt-2 h-screen w-full rounded-lg border p-2">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default layout;
