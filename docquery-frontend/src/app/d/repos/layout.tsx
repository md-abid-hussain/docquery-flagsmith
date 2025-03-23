import { auth } from "@/auth";
import { UnauthorizedAccess } from "@/components/unauthorized";

const ADMIN_USERS = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(",") || [];

export default async function ReposManagementLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (
    !session ||
    !session?.user?.email ||
    !ADMIN_USERS.includes(session.user.email)
  ) {
    return <UnauthorizedAccess />;
  }

  return children;
}
