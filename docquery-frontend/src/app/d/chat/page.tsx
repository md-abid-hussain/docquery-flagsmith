import { prisma } from "@/prisma";
import Link from "next/link";
import GitHubRepoCard from "@/components/github-repo-card";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, User2, Info } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChatPage() {
  const session = await auth();
  const allRepositories = await prisma.repositories.findMany();

  let currentUser = null;
  let userRepositories: string[] = [];

  if (session) {
    currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    if (currentUser) {
      userRepositories = currentUser.ingestedRepositories || [];
    }
  }

  // No repositories at all
  if (allRepositories.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="min-h-[calc(100vh-61px)] flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              No repositories found
            </h1>
            <p className="text-muted-foreground">
              Get started by ingesting your first repository
            </p>
          </div>

          <Link href="/d/ingest">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Ingest a repository
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Available Repositories
          </h1>
          <p className="text-muted-foreground">
            Select a repository to start chatting
          </p>
        </div>
        {session && (
          <div className="flex items-center gap-4 self-start sm:self-center">
            <Link href="/d/user">
              <Button variant="outline" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Repository
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Public repositories section - always shown at the top */}
      {allRepositories.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Public Repositories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allRepositories.map((repo) => (
              <GitHubRepoCard key={repo.id} repoName={repo.name} />
            ))}
          </div>
        </div>
      )}

      {/* User's repositories section - only show if user is logged in */}
      {session && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <User2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Your Repositories</h2>
          </div>

          {userRepositories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRepositories.map(
                (repo, index) =>
                  repo && (
                    <GitHubRepoCard
                      key={index}
                      repoName={repo}
                      className="border-primary/20"
                    />
                  ),
              )}
            </div>
          ) : (
            <div className="bg-muted/40 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <Info className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No Personal Repositories
              </h3>
              <p className="text-muted-foreground mb-4">
                You haven't ingested any personal repositories yet.
              </p>
              <Link href="/d/user">
                <Button size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Ingest Your Repository
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
