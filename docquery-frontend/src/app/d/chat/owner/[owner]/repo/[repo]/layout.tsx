import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { NotFound } from "@/components/not-found";

interface RepositoryChatLayoutProps {
  children: React.ReactNode;
  params: Promise<{ owner: string; repo: string }>;
}

export default async function RepositoryChatLayout({
  children,
  params,
}: RepositoryChatLayoutProps) {
  const { owner, repo } = await params;
  const session = await auth();

  // Fetch repository data
  const repository = await prisma.repositories.findUnique({
    where: {
      name: `${owner}/${repo}`,
    },
  });

  // If repository doesn't exist, show 404
  if (repository) {
    return children;
  } else if (!session) {
    return <NotFound />;
  } else {
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    if (
      currentUser &&
      currentUser.ingestedRepositories.includes(`${owner}/${repo}`)
    ) {
      return children;
    } else {
      return <NotFound />;
    }
  }
}
