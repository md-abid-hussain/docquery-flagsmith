"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  GitBranch,
  ExternalLink,
  Calendar,
  Database,
  Code,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  language: string;
  default_branch: string;
}

interface UserRepositoryCardProps {
  repository: Repository;
  className?: string;
}

export function UserRepositoryCard({
  repository,
  className,
}: UserRepositoryCardProps) {
  const formatNumber = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <Card
      className={cn(
        "overflow-hidden h-full hover:shadow-md transition-all duration-200 flex flex-col",
        "border-primary/10 hover:border-primary/30",
        className,
      )}
    >
      <CardHeader className="bg-muted/30 p-4 pb-3 space-y-1 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold truncate" title={repository.name}>
            {repository.name}
          </h3>
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View on GitHub"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <p
          className="text-sm text-muted-foreground line-clamp-2"
          title={repository.description || ""}
        >
          {repository.description || "No description provided"}
        </p>
      </CardHeader>

      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          {repository.language && (
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1"
            >
              <Code className="h-3 w-3" />
              {repository.language}
            </Badge>
          )}

          {repository.stargazers_count > 0 && (
            <Badge
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              <Star className="h-3 w-3" />
              {formatNumber(repository.stargazers_count)}
            </Badge>
          )}

          <Badge
            variant="secondary"
            className="text-xs flex items-center gap-1"
          >
            <GitBranch className="h-3 w-3" />
            {repository.default_branch}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            Updated{" "}
            {formatDistanceToNow(new Date(repository.updated_at), {
              addSuffix: true,
            })}
          </span>
        </div>

        {repository.topics && repository.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {repository.topics.slice(0, 3).map((topic) => (
              <Badge
                key={topic}
                variant="outline"
                className="text-xs bg-primary/5"
              >
                {topic}
              </Badge>
            ))}
            {repository.topics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{repository.topics.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-auto pt-2">
          <Link
            href={`/d/user/ingest-repo/${repository.name}`}
            className="block w-full"
          >
            <Button className="w-full gap-2" variant="default">
              <Database className="h-4 w-4" />
              Ingest Repository
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
