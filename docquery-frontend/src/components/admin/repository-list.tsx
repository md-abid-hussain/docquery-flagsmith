"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface Repository {
  id: string;
  name: string;
  // Add other properties as needed
}

interface RepositoryListProps {
  initialRepos: Repository[];
}

export function RepositoryList({ initialRepos }: RepositoryListProps) {
  const [repos, setRepos] = useState<Repository[]>(initialRepos);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setSuccessId(null);

    try {
      // Using the correct backend endpoint format with repository ID

      const response = await fetch(`${BACKEND_URL}/repositories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to delete repository");
      }

      // Show success state briefly
      setSuccessId(id);
      setTimeout(() => {
        // Remove from list after showing success
        setRepos(repos.filter((repo) => repo.id !== id));
        setSuccessId(null);
      }, 1500);

      toast({
        title: "Repository deleted",
        description: "The repository was successfully deleted.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete repository. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (repos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No repositories found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repos.map((repo) => (
        <Card key={repo.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{repo.name}</div>
              <Button
                variant={successId === repo.id ? "default" : "destructive"}
                size="sm"
                disabled={deletingId !== null}
                onClick={() => handleDelete(repo.id)}
              >
                {deletingId === repo.id && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {successId === repo.id && <Check className="h-4 w-4 mr-2" />}
                {deletingId === repo.id
                  ? "Deleting..."
                  : successId === repo.id
                    ? "Deleted!"
                    : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
