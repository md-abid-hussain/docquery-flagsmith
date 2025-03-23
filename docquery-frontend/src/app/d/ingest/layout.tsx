import { CopilotKit } from "@copilotkit/react-core";
import { auth } from "@/auth";
import { UnauthorizedAccess } from "@/components/unauthorized";
import { LogIn, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ADMIN_USERS = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(",") || [];

export default async function IngestionPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <ShieldAlert className="h-16 w-16 text-muted-foreground" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight">
            Authentication Required
          </h2>

          <p className="text-muted-foreground">
            You need to be logged in to access this page. Please sign in with
            your account to continue.
          </p>

          <div className="pt-4">
            <Link href="/signin">
              <Button size="lg" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user?.email || !ADMIN_USERS.includes(session.user.email)) {
    return <UnauthorizedAccess />;
  }

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      showDevConsole={false}
      agent="ingestion_agent"
    >
      {children}
    </CopilotKit>
  );
}
