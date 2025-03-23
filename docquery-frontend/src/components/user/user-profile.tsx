"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Github,
  Mail,
  User as UserIcon,
  MapPin,
  Link as LinkIcon,
  ExternalLink,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { UserRepositories } from "./user-repositories";

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
  blog: string;
  location: string;
  email: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

interface UserProfileProps {
  user:
    | {
        name?: string | null;
        githubUsername?: string | null;
        email?: string | null;
        image?: string | null;
      }
    | undefined;
}

export function UserProfile({ user }: UserProfileProps) {
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitHubUser = async () => {
      if (!user?.githubUsername) return;

      try {
        setLoading(true);
        setError(null);

        // We're using a public GitHub API here
        // In a real app, you might want to use an authenticated endpoint
        const response = await fetch(
          `https://api.github.com/users/${user.githubUsername}`,
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "GitHub profile not found"
              : "Failed to fetch GitHub profile",
          );
        }

        const data = await response.json();
        setGithubUser(data);
      } catch (err) {
        console.error("Error fetching GitHub profile:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubUser();
  }, [user?.githubUsername]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <UserIcon className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold mt-4">User Not Found</h2>
            <p className="text-muted-foreground mt-2">
              Unable to retrieve user information.
            </p>
            <Link href="/d/chat">
              <Button className="mt-6">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-muted/10">
      <div className="container mx-auto p-4">
        {/* Responsive grid layout - stack on mobile, side-by-side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - User profile info */}
          <div className="lg:col-span-4">
            <Card className="w-full overflow-hidden h-full">
              <div className="flex flex-col h-full">
                {/* User avatar and basic info */}
                <div className="p-6 bg-muted/20 flex flex-col items-center border-b">
                  {loading ? (
                    <Skeleton className="h-44 w-44 rounded-full mb-6" />
                  ) : (
                    <div className="relative h-44 w-44 mb-6">
                      <Image
                        src={
                          githubUser?.avatar_url ||
                          user.image ||
                          "/placeholder-avatar.png"
                        }
                        alt={`${user.name}'s avatar`}
                        className="object-cover rounded-full ring-4 ring-primary/10"
                        fill
                        priority
                      />
                    </div>
                  )}

                  {loading ? (
                    <div className="w-full space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-6 w-3/4 mx-auto" />
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <h1 className="text-xl font-bold tracking-tight">
                        {githubUser?.name || user.name}
                      </h1>
                      <p className="text-muted-foreground font-mono">
                        {githubUser?.login || user.githubUsername}
                      </p>
                    </div>
                  )}

                  {!loading && (
                    <div className="grid grid-cols-3 gap-4 w-full text-center mt-6 pt-6 border-t">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">
                          {githubUser?.followers || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Followers
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">
                          {githubUser?.following || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Following
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">
                          {githubUser?.public_repos || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Repos</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* User details */}
                <div className="p-6 flex-1">
                  {loading ? (
                    <div className="space-y-6">
                      <Skeleton className="h-16 w-full" />
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>
                    </div>
                  ) : (
                    <>
                      {githubUser?.bio && (
                        <div className="mb-6 bg-muted/20 p-4 rounded-lg">
                          <p className="italic text-muted-foreground">
                            {githubUser.bio}
                          </p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {user.email && (
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-5 w-5 text-primary" />
                            <span>{user.email}</span>
                          </div>
                        )}

                        {githubUser?.location && (
                          <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span>{githubUser.location}</span>
                          </div>
                        )}

                        {githubUser?.blog && (
                          <div className="flex items-center gap-3 text-sm">
                            <LinkIcon className="h-5 w-5 text-primary" />
                            <a
                              href={
                                githubUser.blog.startsWith("http")
                                  ? githubUser.blog
                                  : `https://${githubUser.blog}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {githubUser.blog}
                            </a>
                          </div>
                        )}

                        {githubUser?.created_at && (
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span>
                              Joined GitHub{" "}
                              {formatDistanceToNow(
                                new Date(githubUser.created_at),
                                { addSuffix: true },
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 pt-6 border-t">
                        <a
                          href={
                            githubUser?.html_url ||
                            `https://github.com/${user.githubUsername || user.name}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <Button variant="outline" className="gap-2">
                            <Github className="h-4 w-4" />
                            View GitHub Profile
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="mt-6 bg-destructive/10 text-destructive p-4 rounded-md text-sm">
                      <p className="font-medium">
                        Error fetching GitHub profile: {error}
                      </p>
                      <p className="mt-1">
                        Your basic profile information is still available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right column - Repositories */}
          <div className="lg:col-span-8">
            <UserRepositories user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
