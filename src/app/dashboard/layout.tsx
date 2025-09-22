
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { redirect } from 'next/navigation';

const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/dashboard';

export default function DashboardRedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout now only serves to redirect from the old /dashboard path
  // to the new secret admin path if they are different.
  if (adminPath !== '/dashboard') {
    redirect(adminPath);
  }

  // If the admin path IS /dashboard, then we render the actual layout.
  // This avoids circular redirects.
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SidebarProvider>
        <div className="min-h-screen flex">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                  {children}
              </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
