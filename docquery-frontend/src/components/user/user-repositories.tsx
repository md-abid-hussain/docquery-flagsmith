"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Github,
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRepositoryCard } from "./user-repository-card";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  topics: string[];
  language: string;
  default_branch: string;
  updated_at: string;
  fork: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
}

interface UserRepositoriesProps {
  user:
    | {
        name?: string | null;
        githubUsername?: string | null;
        email?: string | null;
        image?: string | null;
      }
    | undefined;
}

export function UserRepositories({ user }: UserRepositoriesProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const repositoriesPerPage = 6;

  // Extract unique languages from repositories
  const languages =
    repositories.length > 0
      ? [
          "all",
          ...new Set(
            repositories
              .filter((repo) => repo.language)
              .map((repo) => repo.language),
          ),
        ]
      : ["all"];

  useEffect(() => {
    const fetchRepositories = async () => {
      if (!user?.githubUsername) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://api.github.com/users/${user.githubUsername}/repos?sort=updated&per_page=100`,
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "GitHub user not found"
              : response.status === 403
                ? "API rate limit exceeded"
                : "Failed to fetch repositories",
          );
        }

        const data = await response.json();

        // Filter out forked repositories
        const ownedRepos = data.filter((repo: Repository) => !repo.fork);
        setRepositories(ownedRepos);
        setFilteredRepos(ownedRepos);
        setTotalPages(Math.ceil(ownedRepos.length / repositoriesPerPage));
      } catch (err) {
        console.error("Error fetching repositories:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [user?.githubUsername]);

  // Apply filters when search query or language filter changes
  useEffect(() => {
    if (repositories.length === 0) return;

    let result = [...repositories];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          (repo.description && repo.description.toLowerCase().includes(query)),
      );
    }

    // Apply language filter
    if (languageFilter && languageFilter !== "all") {
      result = result.filter((repo) => repo.language === languageFilter);
    }

    setFilteredRepos(result);
    setTotalPages(Math.ceil(result.length / repositoriesPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, languageFilter, repositories]);

  // Get current page repositories
  const getCurrentPageRepos = () => {
    const startIndex = (currentPage - 1) * repositoriesPerPage;
    const endIndex = startIndex + repositoriesPerPage;
    return filteredRepos.slice(startIndex, endIndex);
  };

  return (
    <Card className="w-full h-full">
      <div className="p-6 space-y-6 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Repositories</h2>
            <p className="text-muted-foreground">
              Browse and select repositories to ingest into DocQuery
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        {!loading && !error && repositories.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-64">
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by language" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang === "all" ? "All Languages" : lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Repository Content with Flex-Grow */}
        <div className="flex-grow">
          {loading ? (
            <div className="flex justify-center items-center py-12 h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading repositories...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 border border-destructive/50 bg-destructive/10 rounded-lg text-center">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <div>
                  <h3 className="text-xl font-semibold text-destructive">
                    Error Loading Repositories
                  </h3>
                  <p className="mt-2">{error}</p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="p-8 border rounded-lg text-center h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {searchQuery || languageFilter !== "all"
                      ? "No matching repositories found"
                      : "No original repositories found"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery || languageFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "You don't have any non-forked repositories on GitHub."}
                  </p>
                </div>
                <div className="pt-4">
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2">
                      <Github className="h-4 w-4" />
                      Create a Repository on GitHub
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
              {getCurrentPageRepos().map((repo) => (
                <UserRepositoryCard key={repo.id} repository={repo} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls - Only show when needed and not loading */}
        {!loading && !error && filteredRepos.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center mt-2 gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
